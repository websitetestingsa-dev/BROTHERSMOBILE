/* BMT ONE public catalog: never render bundled sample/demo products. */
(()=>{'use strict';
 const grid=document.getElementById('stockGrid'),offers=document.getElementById('offerGrid');
 if(!grid)return;
 let products=[],filter='All',search='';
 const empty=(text)=>{const p=document.createElement('p');p.className='bmt-stock-empty';p.textContent=text;return p;};
 const valid=p=>p&&p.publish_status==='published'&&Number(p.sample)===0&&Number(p.price)>0&&Number.isInteger(Number(p.qty))&&Number(p.qty)>=0&&typeof p.image==='string'&&p.image.trim()&&typeof p.description==='string'&&p.description.trim().length>=10;
 const safeSrc=s=>typeof s==='string'&&(s.startsWith('/api/image/')||s.startsWith('assets/')||/^https:\/\//i.test(s))?s:'';
 function render(){
  grid.replaceChildren();
  const visible=products.filter(p=>(filter==='All'||p.category===filter)&&(`${p.name||''} ${p.brand||''} ${p.description||''}`).toLowerCase().includes(search));
  if(!visible.length){grid.append(empty(products.length?'No matching products.':'Products will appear here when the shop owner publishes them.'));return;}
  for(const p of visible){
   const card=document.createElement('article');card.className='bmt-stock-card';
   const im=document.createElement('img');im.loading='lazy';im.alt=p.name||'Product';im.src=safeSrc(p.image);im.addEventListener('error',()=>im.remove());
   const info=document.createElement('div');info.className='bmt-stock-info';
   const name=document.createElement('h3');name.textContent=p.name||'Product';
   const brand=document.createElement('p');brand.textContent=p.brand||p.category||'';
   const desc=document.createElement('p');desc.textContent=p.description||'';
   const price=document.createElement('strong');price.textContent='QAR '+Number(p.price).toLocaleString('en-US',{maximumFractionDigits:2});
   info.append(name,brand,desc,price);card.append(im,info);grid.append(card);
  }
 }
 document.getElementById('stockSearch')?.addEventListener('input',e=>{search=e.target.value.toLowerCase().trim();render()});
 document.getElementById('stockFilters')?.addEventListener('click',e=>{const b=e.target.closest('button[data-filter]');if(!b)return;filter=b.dataset.filter;for(const x of e.currentTarget.querySelectorAll('button'))x.classList.toggle('active',x===b);render()});
 if(offers){offers.replaceChildren();offers.append(empty('New offers will appear here when the shop owner announces them.'));}
 render();
 fetch('/api/catalog',{credentials:'same-origin',cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json()}).then(data=>{
  products=(Array.isArray(data.products)?data.products:[]).filter(valid);render();
  if(offers){offers.replaceChildren();const promos=Array.isArray(data.promos)?data.promos:[];for(const p of promos){if(p.visible===0||p.active===0)continue;const c=document.createElement('article');c.className='bmt-offer-card';const h=document.createElement('h3');h.textContent=p.title||p.name||'Store update';const d=document.createElement('p');d.textContent=p.description||p.details||'';c.append(h,d);offers.append(c)}if(!offers.children.length)offers.append(empty('New offers will appear here when the shop owner announces them.'));}
 }).catch(()=>{grid.replaceChildren(empty('Product listings are temporarily unavailable. Please contact the store.'));});
})();
