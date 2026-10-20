(()=>{'use strict';
const KEY='bmt_showroom_v2', instagram='https://www.instagram.com/2brotherstreading/';
const defaults={products:[
{id:'sample1',name:'Smartphones',category:'Phones',brand:'Apple · concept gallery',price:'',qty:'',image:'assets/iphone-black.png',description:'Illustrative iPhone concept image. Contact the shop to confirm actual models, prices and availability.',sample:true},
{id:'sample2',name:'Wireless earbuds',category:'Accessories',brand:'Earbuds',price:'',qty:'',image:'assets/earbuds-premium.png',description:'Wireless earbuds category illustration. Enquire about available brands and prices.',sample:true},
{id:'sample3',name:'Phone cases & covers',category:'Accessories',brand:'Cases & covers',price:'',qty:'',image:'assets/cases-covers.png',description:'Protective phone cases in different styles. Confirm compatibility and availability.',sample:true},
{id:'sample4',name:'Wall chargers',category:'Accessories',brand:'Charging accessories',price:'',qty:'',image:'assets/chargers-premium.png',description:'USB-C wall chargers. Ask the store about compatible models and prices.',sample:true},
{id:'sample5',name:'Power banks',category:'Accessories',brand:'Power banks',price:'',qty:'',image:'assets/power-banks.png',description:'Portable charging power banks. Contact the store for specifications and availability.',sample:true},
{id:'sample6',name:'Phone holders',category:'Accessories',brand:'Phone stands',price:'',qty:'',image:'assets/phone-holders.png',description:'Adjustable phone stands and holders. Enquire for details.',sample:true},
{id:'sample7',name:'Phone grips & wallets',category:'Accessories',brand:'Grips & wallets',price:'',qty:'',image:'assets/phone-grips-wallets.png',description:'Phone grip rings and card wallets. Check model compatibility.',sample:true},
{id:'sample8',name:'Data cables',category:'Accessories',brand:'Cables',price:'',qty:'',image:'assets/data-cables.png',description:'USB-C data and charging cables. Confirm available lengths and specifications.',sample:true},
{id:'sample9',name:'Wireless chargers',category:'Accessories',brand:'Wireless charging',price:'',qty:'',image:'assets/wireless-chargers.png',description:'Wireless charging stands and stations. Confirm device compatibility.',sample:true},
{id:'sample10',name:'Screen protectors',category:'Accessories',brand:'Screen protection',price:'',qty:'',image:'assets/screen-protectors.png',description:'Tempered-glass screen protection. Check compatible phone models.',sample:true}
],promos:[{id:'intro',title:'Your next upgrade starts here',text:'Follow our Instagram for updates and ask about the latest arrivals.',image:'',sample:true}],settings:{instagram,whatsapp:''}};
let state=structuredClone(defaults);
// Update bundled demo cards, including old browser-cached sample content.
// Never replace actual user-created products.
for(const p of state.products){if(p.sample){const updated=defaults.products.find(d=>d.id===p.id);if(updated)Object.assign(p,updated);}}
for(const sample of defaults.products){if(!state.products.some(p=>p.id===sample.id))state.products.push({...sample});}

const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save=()=>{};
const status=t=>{let el=$('#adminStatus');if(el)el.textContent=t};let filter='All',query='';
function render(){const items=state.products.filter(p=>(filter==='All'||p.category===filter)&&[p.name,p.brand,p.description].join(' ').toLowerCase().includes(query));$('#stockGrid').innerHTML=items.length?items.map(p=>`<article class="stock-card"><div class="stock-photo">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`:`<span class="stock-placeholder">${p.category==='Phones'?'▯':'◈'}</span>`}</div><div class="stock-details"><span class="stock-meta">${esc(p.brand||p.category)} ${p.sample?'· EXAMPLE':''}</span><h3>${esc(p.name)}</h3><p>${esc(p.description||'Ask us for details.')}</p><div class="stock-price">${p.price?`QAR ${esc(p.price)}`:'Ask for price'} ${p.qty!==''&&p.qty!=null?`<small>· ${Number(p.qty)>0?esc(p.qty)+' in stock':'Out of stock'}</small>`:''}</div><a href="${esc(state.settings.instagram||instagram)}" target="_blank" rel="noopener">Enquire ↗</a></div></article>`).join(''):'<p>No matching products. Check back for updates.</p>';
$('#offerGrid').innerHTML=state.promos.length?state.promos.map(p=>`<article class="offer-card">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">`:''}<span class="stock-meta">${p.sample?'WELCOME · EXAMPLE':'STORE ANNOUNCEMENT'}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p><a href="${esc(state.settings.instagram||instagram)}" target="_blank" rel="noopener">Get in touch ↗</a></article>`).join(''):'<p>New announcements coming soon.</p>'}
$('#stockSearch').addEventListener('input',e=>{query=e.target.value.toLowerCase();render()});$('#stockFilters').addEventListener('click',e=>{let b=e.target.closest('button[data-filter]');if(!b)return;filter=b.dataset.filter;$('#stockFilters').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));render()});

$('#adminOpen').onclick=()=>{location.href='/manage.html'};
async function refresh(){try{const r=await fetch('/api/catalog',{cache:'no-store'});if(!r.ok)throw Error('Unavailable');const data=await r.json();state={...defaults,...data};render()}catch(e){console.warn('Cloud catalog unavailable; showing illustrative examples',e)}}
refresh();setInterval(refresh,60000);
})();
