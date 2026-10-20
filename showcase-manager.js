(()=>{const form=document.getElementById('editor'),list=document.getElementById('items'),notice=document.getElementById('notice');let rows=[];const say=s=>notice.textContent=s;const api=async(path,opts={})=>{const r=await fetch('/api'+path,{credentials:'same-origin',cache:'no-store',...opts,headers:{...(opts.body?{'Content-Type':'application/json'}:{}),...(opts.headers||{})}});const j=await r.json();if(!r.ok)throw Error(j.error||'Request failed');return j};async function load(){try{const me=await api('/me');if(me.role!=='owner')throw Error('Owner access required');rows=(await api('/highlights/manage')).highlights;list.replaceChildren();if(!rows.length)list.textContent='No showcases yet. Create your first one above.';for(const x of rows){const el=document.createElement('div');el.className='entry';const info=document.createElement('div');const title=document.createElement('strong');title.textContent=x.title;const desc=document.createElement('p');desc.className='muted';desc.textContent=`${x.kind} · ${x.visible?'Visible':'Hidden'}${x.expires_at?' · Expires '+x.expires_at:''}`;info.append(title,desc);const controls=document.createElement('div');const edit=document.createElement('button');edit.className='secondary';edit.textContent='Edit';edit.onclick=()=>{for(const [k,v] of Object.entries(x)){if(!form.elements.namedItem(k))continue;if(k==='visible')form.elements[k].checked=!!v;else form.elements[k].value=k==='expires_at'?(v||'').slice(0,10):(v??'')}refreshPreview();window.scrollTo({top:0,behavior:'smooth'})};const del=document.createElement('button');del.className='danger';del.textContent='Delete';del.onclick=async()=>{if(!confirm(`Delete “${x.title}”? The stored image will NOT be deleted.`))return;try{await api('/highlights/manage/'+encodeURIComponent(x.id),{method:'DELETE'});say('Highlight deleted. Image retained.');await load()}catch(e){say(e.message)}};controls.append(edit,del);el.append(info,controls);list.append(el)}}catch(e){say(e.message);list.textContent='Unable to load highlights.'}}form.addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form).entries());data.visible=form.elements.visible.checked;try{await api('/highlights/manage',{method:'POST',body:JSON.stringify(data)});say('Saved successfully.');form.reset();refreshPreview();await load()}catch(e){say(e.message)}});document.getElementById('reset').onclick=()=>{form.reset();refreshPreview()};const preview=document.getElementById('image-preview'),previewEmpty=document.getElementById('image-preview-empty'),previewState=document.getElementById('preview-state'),previewPath=document.getElementById('preview-path');let previewVersion=0;function refreshPreview(){const raw=String(form.elements.image.value||'').trim();const token=++previewVersion;preview.hidden=true;preview.removeAttribute('src');previewPath.textContent=raw?`Image path: ${raw}`:'';if(!raw){previewState.textContent='No image selected';previewEmpty.textContent='Enter an image URL above to see it here.';previewEmpty.hidden=false;return}if(!(/^(?:assets\/|\/assets\/|\/api\/image\/)/.test(raw)||/^https:\/\/[^\s]+$/i.test(raw))){previewState.textContent='Unsupported image path';previewEmpty.textContent='Use assets/..., /api/image/... or an HTTPS image URL.';previewEmpty.hidden=false;return}previewState.textContent='Loading image…';previewEmpty.textContent='Loading preview…';previewEmpty.hidden=false;const probe=new Image();probe.onload=()=>{if(token!==previewVersion)return;preview.src=probe.src;preview.hidden=false;previewEmpty.hidden=true;previewState.textContent='Image ready — preview only'};probe.onerror=()=>{if(token!==previewVersion)return;previewState.textContent='Image not found';previewEmpty.textContent='Cannot load this image. Check its path and whether the file exists on your website.';previewEmpty.hidden=false};probe.src=raw.startsWith('assets/')?'/'+raw:raw}form.elements.image.addEventListener('input',refreshPreview);form.elements.image.addEventListener('change',refreshPreview);
const picker=document.getElementById('image-library'),uploader=document.getElementById('image-upload'),uploadState=document.getElementById('upload-state');
const knownAssets=['assets/category-smartphones.webp','assets/category-accessories.webp','assets/category-services.webp'];
const imagePath=v=>typeof v==='string'&&(/^(?:assets\/|\/assets\/|\/api\/image\/)/.test(v)||/^https:\/\/[^\s]+$/i.test(v));
async function populateImages(){
 const current=form.elements.image.value;
 const images=[...new Set([...rows.map(x=>x.image),...knownAssets].filter(imagePath))];
 picker.replaceChildren(new Option('Choose an existing image…',''));
 for(const path of images){
   // Only include paths which resolve, so the picker never promises an absent image.
   const resolved=path.startsWith('assets/')?'/'+path:path;
   const ok=await new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(true);i.onerror=()=>resolve(false);i.src=resolved;});
   if(ok){const label=path.length>76?'…'+path.slice(-73):path;picker.add(new Option(label,path));}
 }
 if(current&&[...picker.options].some(o=>o.value===current))picker.value=current;
}
picker.addEventListener('change',()=>{if(!picker.value)return;form.elements.image.value=picker.value;refreshPreview()});
uploader.addEventListener('change',async()=>{
 const file=uploader.files?.[0];if(!file)return;
 if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>5*1024*1024){uploadState.textContent='Choose a JPG, PNG, WEBP or GIF under 5 MB.';uploader.value='';return}
 uploadState.textContent='Uploading image…';
 try{
  const r=await fetch('/api/upload',{method:'POST',body:file,headers:{'Content-Type':file.type},credentials:'same-origin',cache:'no-store'});
  const data=await r.json();if(!r.ok)throw Error(data.error||'Upload failed');
  if(!data.url||!imagePath(data.url))throw Error('Upload did not return a valid image URL');
  form.elements.image.value=data.url;
  const opt=new Option('New upload · '+data.url,data.url);picker.add(opt);picker.value=data.url;
  refreshPreview();uploadState.textContent='Image uploaded. Save the highlight to keep its reference.';
 }catch(e){uploadState.textContent=e.message+' (Check Cloudflare R2 IMAGES binding.)'}
 finally{uploader.value=''}
});
const originalLoad=load;
load=async function(){await originalLoad();await populateImages()};
load()})();
