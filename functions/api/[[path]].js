const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const deny=(s=403)=>json({error:s===401?'Sign in required':'Access denied'},s);
const enc=new TextEncoder();
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const digest=async value=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(value))));
const pbkdf=async(pass,salt)=>{const key=await crypto.subtle.importKey('raw',enc.encode(pass),'PBKDF2',false,['deriveBits']);return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256)));};
const cookie=(name,value,age)=>`${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
async function actor(req,env){
 const raw=(req.headers.get('Cookie')||'').match(/(?:^|;\s*)bmt_session=([a-f0-9]{64})(?:;|$)/)?.[1];if(!raw)return null;
 const hash=await digest(raw);
 const row=await env.DB.prepare(`SELECT s.email,s.role FROM sessions t JOIN staff s ON s.email=t.email WHERE t.token_hash=? AND t.expires_at>datetime('now') AND s.revoked=0 AND s.staff_status='active' AND (s.expires_at IS NULL OR s.expires_at>datetime('now'))`).bind(hash).first();
 return row||null;
}
async function login(req,env){
 const x=await body(req);const email=String(x?.email||'').toLowerCase().trim(),password=String(x?.password||'');
 if(email.length>254||password.length>256||!email||!password)return json({error:'Invalid credentials'},401);
 const ip=req.headers.get('CF-Connecting-IP')||'unknown';const key=await digest(email+'|'+ip);
 const attempts=await env.DB.prepare(`SELECT failures,(locked_until>datetime('now')) AS is_locked FROM login_attempts WHERE key=?`).bind(key).first();
 if(attempts?.is_locked)return json({error:'Too many attempts. Try again later.'},429);
 const row=await env.DB.prepare(`SELECT email,role,password_salt,password_hash FROM staff WHERE email=? AND revoked=0 AND staff_status='active' AND (expires_at IS NULL OR expires_at>datetime('now'))`).bind(email).first();
 const valid=!!(row?.password_hash&&row.password_salt&&await pbkdf(password,row.password_salt)===row.password_hash);
 if(!valid){await env.DB.prepare(`INSERT INTO login_attempts(key,failures,locked_until) VALUES(?,1,NULL) ON CONFLICT(key) DO UPDATE SET failures=CASE WHEN failures>=4 THEN 0 ELSE failures+1 END,locked_until=CASE WHEN failures>=4 THEN datetime('now','+15 minutes') ELSE NULL END`).bind(key).run();return json({error:'Invalid credentials'},401);}
 await env.DB.prepare('DELETE FROM login_attempts WHERE key=?').bind(key).run();
 const token=hex(crypto.getRandomValues(new Uint8Array(32)));const hash=await digest(token);
 await env.DB.prepare(`INSERT INTO sessions(token_hash,email,expires_at) VALUES(?,?,datetime('now','+8 hours'))`).bind(hash,email).run();
 const res=json({email,role:row.role});res.headers.set('Set-Cookie',cookie('bmt_session',token,28800));return res;
}
const audit=(db,a,action,detail)=>db.prepare('INSERT INTO activity(email,action,detail) VALUES(?,?,?)').bind(a.email,action,String(detail).slice(0,500)).run();
const safeImage=s=>typeof s==='string'&&s.length<700&&(s===''||s.startsWith('/api/image/')||s.startsWith('assets/')||/^https:\/\//.test(s));
async function body(req){if(Number(req.headers.get('content-length')||0)>100000)return null;try{return await req.json()}catch{return null}}
export async function onRequest({request,env,params}){
 if(!env.DB)return json({error:'D1 binding DB not configured'},503);
 const path='/'+(Array.isArray(params.path)?params.path.join('/'):params.path||'');const method=request.method;
 if(!['GET','HEAD'].includes(method)){const origin=request.headers.get('Origin');if(!origin||origin!==new URL(request.url).origin)return json({error:'Invalid request origin'},403);}
 try{
 if(path==='/login'&&method==='POST')return login(request,env);
 if(path==='/logout'&&method==='POST'){const raw=(request.headers.get('Cookie')||'').match(/(?:^|;\s*)bmt_session=([a-f0-9]{64})(?:;|$)/)?.[1];if(raw)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await digest(raw)).run();const res=json({ok:true});res.headers.set('Set-Cookie',cookie('bmt_session','',0));return res;}
 if(path==='/catalog'&&method==='GET'){
 const [products,promos]=await Promise.all([env.DB.prepare('SELECT * FROM products ORDER BY updated_at DESC LIMIT 500').all(),env.DB.prepare('SELECT * FROM promos ORDER BY updated_at DESC LIMIT 100').all()]);
 return json({products:products.results.map(x=>({...x,sample:!!x.sample,price:x.price??'',qty:x.qty??''})),promos:promos.results,settings:{instagram:'https://www.instagram.com/2brotherstreading/',whatsapp:'97466091655'}});
 }
 if(path==='/business-profile'&&method==='GET'){
  const rows=(await env.DB.prepare('SELECT key,value FROM site_settings').all()).results;
  const settings=Object.fromEntries(rows.map(r=>[r.key,r.value]));
  const links=(await env.DB.prepare('SELECT id,platform,label,url,visible,sort_order FROM social_links WHERE visible=1 ORDER BY sort_order,id LIMIT 50').all()).results;
  return json({settings,links});
 }
 if(path.startsWith('/image/')&&method==='GET'){
 if(!env.IMAGES)return json({error:'R2 not configured'},503);const key=path.slice(7);if(!/^[a-f0-9-]{36}\.(png|jpg|webp|gif)$/.test(key))return deny(404);const obj=await env.IMAGES.get(key);if(!obj)return deny(404);return new Response(obj.body,{headers:{'Content-Type':obj.httpMetadata?.contentType||'image/webp','Cache-Control':'public,max-age=86400','X-Content-Type-Options':'nosniff'}});
 }
 const a=await actor(request,env);if(!a)return deny(401);
 if(path==='/me'&&method==='GET')return json(a);
 if(path==='/business-profile/all'&&method==='GET'){
  if(a.role!=='owner')return deny();
  const rows=(await env.DB.prepare('SELECT key,value FROM site_settings').all()).results;
  const links=(await env.DB.prepare('SELECT id,platform,label,url,visible,sort_order FROM social_links ORDER BY sort_order,id LIMIT 50').all()).results;
  return json({settings:Object.fromEntries(rows.map(r=>[r.key,r.value])),links});
 }
 if(path==='/business-profile'&&method==='PUT'){
  if(a.role!=='owner')return deny();
  const x=await body(request);if(!x||!Array.isArray(x.links)||x.links.length>50)return json({error:'Invalid profile'},400);
  const settings={business_name:String(x.business_name||'').trim().slice(0,120),whatsapp1:String(x.whatsapp1||'').replace(/[^0-9]/g,'').slice(0,15),whatsapp2:String(x.whatsapp2||'').replace(/[^0-9]/g,'').slice(0,15),partnership_enabled:x.partnership_enabled?'1':'0',partnership_whatsapp:String(x.partnership_whatsapp||'').replace(/[^0-9]/g,'').slice(0,15),partnership_message:String(x.partnership_message||'').trim().slice(0,600)};
  if(!settings.whatsapp1||settings.whatsapp1.length<8)return json({error:'Primary WhatsApp number is required'},400);
  const allowed=['Instagram','TikTok','YouTube','Facebook','Snapchat','WhatsApp','X','LinkedIn','Pinterest','Telegram','Google Maps','Website','Other'];
  for(const l of x.links){if(!allowed.includes(l.platform)||typeof l.label!=='string'||!l.label.trim()||l.label.length>70||typeof l.url!=='string'||l.url.length>500)return json({error:'Invalid social link'},400);let u;try{u=new URL(l.url)}catch{return json({error:'Invalid link URL'},400)}if(u.protocol!=='https:'||u.username||u.password)return json({error:'Only safe HTTPS links are allowed'},400);}
  const statements=Object.entries(settings).map(([k,v])=>env.DB.prepare('INSERT INTO site_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k,v));
  statements.push(env.DB.prepare('DELETE FROM social_links'));
  for(let i=0;i<x.links.length;i++){const l=x.links[i];statements.push(env.DB.prepare('INSERT INTO social_links(id,platform,label,url,visible,sort_order) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),l.platform,l.label.trim(),l.url,l.visible===false?0:1,i));}
  await env.DB.batch(statements);await audit(env.DB,a,'business.update','Profile and social links');return json({ok:true});
 }

 if(path==='/products'&&method==='GET')return json((await env.DB.prepare('SELECT * FROM products ORDER BY updated_at DESC LIMIT 500').all()).results);
 if(path==='/products'&&method==='POST'){
 const x=await body(request);if(!x||typeof x.name!=='string'||!x.name.trim()||x.name.length>140||!['Phones','Accessories','Other'].includes(x.category)||!safeImage(x.image||'')||String(x.description||'').length>2000||String(x.brand||'').length>150)return json({error:'Invalid product'},400);
 const price=x.price===''||x.price==null?null:Number(x.price),qty=x.qty===''||x.qty==null?null:Number(x.qty);if((price!==null&&(!Number.isFinite(price)||price<0||price>1e7))||(qty!==null&&(!Number.isInteger(qty)||qty<0||qty>1e7)))return json({error:'Invalid price or quantity'},400);
 const id=typeof x.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(x.id)?x.id:crypto.randomUUID();
 await env.DB.prepare(`INSERT INTO products(id,name,brand,category,price,qty,image,description,sample) VALUES(?,?,?,?,?,?,?,?,0) ON CONFLICT(id) DO UPDATE SET name=excluded.name,brand=excluded.brand,category=excluded.category,price=excluded.price,qty=excluded.qty,image=excluded.image,description=excluded.description,sample=0,updated_at=CURRENT_TIMESTAMP`).bind(id,x.name.trim(),x.brand||'',x.category,price,qty,x.image||'',x.description||'').run();await audit(env.DB,a,'product.save',id);return json({id});
 }
 if(path.startsWith('/products/')&&method==='DELETE'){const id=path.slice(10);if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id))return json({error:'Invalid ID'},400);await env.DB.prepare('DELETE FROM products WHERE id=?').bind(id).run();await audit(env.DB,a,'product.delete',id);return json({ok:true});}
 if(path==='/upload'&&method==='POST'){
 if(!env.IMAGES)return json({error:'Image uploads disabled. Select an existing assets/ image URL.'},503);const type=request.headers.get('content-type')||'';const allowed={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'};if(!allowed[type])return json({error:'Only JPG PNG WEBP GIF supported'},400);const bytes=await request.arrayBuffer();if(!bytes.byteLength||bytes.byteLength>5*1024*1024)return json({error:'Image must be under 5MB'},400);
 const u=new Uint8Array(bytes);const valid=type==='image/png'?u[0]===137&&u[1]===80&&u[2]===78&&u[3]===71:type==='image/jpeg'?u[0]===255&&u[1]===216:type==='image/gif'?u[0]===71&&u[1]===73&&u[2]===70:u[0]===82&&u[1]===73&&u[2]===70&&u[3]===70&&u[8]===87&&u[9]===69&&u[10]===66&&u[11]===80;
 if(!valid)return json({error:'Image file does not match type'},400);const key=crypto.randomUUID()+'.'+allowed[type];await env.IMAGES.put(key,bytes,{httpMetadata:{contentType:type}});await audit(env.DB,a,'image.upload',key);return json({url:'/api/image/'+key});
 }
 if(path==='/staff'&&method==='GET'){if(a.role!=='owner')return deny();return json((await env.DB.prepare('SELECT email,role,expires_at,revoked,staff_status,created_at FROM staff ORDER BY created_at DESC').all()).results);}
 if(path==='/staff'&&method==='POST'){if(a.role!=='owner')return deny();const x=await body(request);const email=String(x?.email||'').toLowerCase().trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||email===a.email)return json({error:'Invalid staff email'},400);const password=String(x?.password||'');if(password.length<14||password.length>128)return json({error:'Staff password must be 14–128 characters'},400);const salt=hex(crypto.getRandomValues(new Uint8Array(16)));const passhash=await pbkdf(password,salt);
 const existing=await env.DB.prepare('SELECT role FROM staff WHERE email=?').bind(email).first();if(existing?.role==='owner')return deny();await env.DB.prepare(`INSERT INTO staff(email,role,expires_at,revoked,staff_status,password_salt,password_hash) VALUES(?,'staff',NULL,0,'active',?,?) ON CONFLICT(email) DO UPDATE SET role='staff',expires_at=NULL,revoked=0,staff_status='active',password_salt=excluded.password_salt,password_hash=excluded.password_hash`).bind(email,salt,passhash).run();await env.DB.prepare('DELETE FROM sessions WHERE email=?').bind(email).run();await audit(env.DB,a,'staff.invite',email);return json({ok:true,note:'Account allowlisted; share the login link separately. No invitation email is sent.'});}
 if(path.startsWith('/staff/')&&(method==='PATCH'||method==='DELETE')){if(a.role!=='owner')return deny();let email;try{email=decodeURIComponent(path.slice(7)).toLowerCase().trim()}catch{return json({error:'Invalid email'},400)}const existing=await env.DB.prepare('SELECT role,staff_status FROM staff WHERE email=?').bind(email).first();if(!existing)return json({error:'Worker not found'},404);if(existing.role!=='staff')return deny();if(method==='DELETE'){await env.DB.prepare('DELETE FROM sessions WHERE email=?').bind(email).run();await env.DB.prepare('DELETE FROM staff WHERE email=? AND role=\'staff\'').bind(email).run();await audit(env.DB,a,'staff.delete',email);return json({ok:true})}const data=await body(request);const action=String(data?.action||'');if(!['block','unblock','fire'].includes(action))return json({error:'Invalid action'},400);const next=action==='block'?'blocked':action==='fire'?'fired':'active';await env.DB.prepare('UPDATE staff SET staff_status=?,revoked=? WHERE email=? AND role=\'staff\'').bind(next,next==='active'?0:1,email).run();await env.DB.prepare('DELETE FROM sessions WHERE email=?').bind(email).run();await audit(env.DB,a,'staff.'+action,email);return json({ok:true,status:next});}
 if(path==='/activity'&&method==='GET'){if(a.role!=='owner')return deny();return json((await env.DB.prepare('SELECT email,action,detail,created_at FROM activity ORDER BY id DESC LIMIT 100').all()).results);}
 return json({error:'Not found'},404);
 }catch(e){console.error(e);return json({error:'Server error; check Cloudflare logs and bindings'},500)}
}
