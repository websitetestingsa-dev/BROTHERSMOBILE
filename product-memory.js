(()=>{'use strict';
const KEY='bmt-product-suggestions-v1';
const PRESETS={name:['iPhone','Samsung Galaxy','Xiaomi','OPPO','Phone case','Screen protector','Wireless earbuds','USB-C cable','Wireless charger','Wall charger','Power bank'],brand:['Apple','Samsung','Xiaomi','OPPO','HONOR','Huawei','Vivo','Realme','OnePlus','Google','Anker','Belkin','Baseus','UGREEN','Spigen','ESR','JBL','Sony','Oraimo','Other']};
const get=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{}}catch{return {}}};
const save=(o)=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch{}};
const values=(arr)=>[...new Set(arr.map(v=>String(v||'').trim()).filter(Boolean))].slice(0,150);
const fill=(id,arr)=>{const el=document.getElementById(id);if(!el)return;el.replaceChildren(...values(arr).map(v=>{const o=document.createElement('option');o.value=v;return o}))};
function refresh(products=[]){const mem=get();const form=document.getElementById('form');if(!form)return;fill('bmtNameSuggestions',[...PRESETS.name,...(mem.name||[]),...products.map(x=>x.name)]);fill('bmtBrandSuggestions',[...PRESETS.brand,...(mem.brand||[]),...products.map(x=>x.brand)]);fill('bmtImageSuggestions',[...(mem.image||[]),...products.map(x=>x.image)]);}
window.addEventListener('bmt:products',e=>refresh(Array.isArray(e.detail)?e.detail:[]));
const form=document.getElementById('form');if(!form)return;
form.addEventListener('submit',()=>{const mem=get();for(const k of ['name','brand','image']){const v=form.elements.namedItem(k)?.value?.trim();if(v)mem[k]=values([v,...(mem[k]||[])]).slice(0,100)}save(mem);refresh()});
form.addEventListener('change',e=>{const k=e.target?.name;if(!['name','brand','image'].includes(k))return;const v=e.target.value.trim();if(!v)return;const mem=get();mem[k]=values([v,...(mem[k]||[])]);save(mem);refresh()});
document.querySelectorAll('[data-qty-preset]').forEach(b=>b.addEventListener('click',()=>{form.elements.namedItem('qty').value=b.dataset.qtyPreset}));
document.getElementById('bmtForgetSuggestions')?.addEventListener('click',()=>{localStorage.removeItem(KEY);refresh();const status=document.getElementById('status');if(status)status.textContent='Browser suggestions cleared. Saved shop products were not changed.'});
refresh();
})();