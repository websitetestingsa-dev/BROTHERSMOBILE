/* BMT ONE — owner-approved featured devices, offers and launches */
(async () => {
  'use strict';
  const root = document.getElementById('bmtHighlightGrid');
  if (!root) return;
  const section = root.closest('section');
  const typeNames = {device:'FEATURED DEVICE',offer:'SPECIAL OFFER',launch:'NEW LAUNCH',announcement:'SHOP UPDATE'};
  const safeImage = value => typeof value === 'string' && (/^(?:assets\/|\/assets\/|\/api\/image\/)/.test(value) || /^https:\/\/[^\s]+$/i.test(value));
  const safeLink = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {const url = new URL(value,location.origin);return ['http:','https:'].includes(url.protocol) && !url.username && !url.password ? url : null;}catch{return null;}
  };
  const node = (tag,className,text) => {const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;};
  try {
    const response = await fetch('/api/highlights',{credentials:'same-origin',cache:'no-store'});
    if (!response.ok) throw new Error('Highlights unavailable');
    const data = await response.json();
    const items = Array.isArray(data.highlights) ? data.highlights : [];
    root.replaceChildren();
    if (!items.length) {if(section)section.hidden=true;return;}
    if(section)section.hidden=false;
    for (const [index,item] of items.entries()) {
      const card=node('article','bmt-highlight-card'+(index===0?' bmt-highlight-card--lead':''));
      const media=node('div','bmt-highlight-media');
      if(safeImage(item.image)) {
        const img=node('img');img.src=item.image.startsWith('assets/')?'/'+item.image:item.image;
        img.alt=item.title?`${item.title} — Brothers Mobile`: 'Featured product image';
        img.loading=index===0?'eager':'lazy';img.decoding='async';
        img.addEventListener('error',()=>{img.remove();media.classList.add('bmt-highlight-media--empty');},{once:true});
        media.append(img);
      }else media.classList.add('bmt-highlight-media--empty');
      const topline=node('div','bmt-highlight-topline');
      topline.append(node('span','bmt-highlight-pill',String(item.badge||typeNames[item.kind]||'SHOP FEATURE').slice(0,60)));
      media.append(topline);
      const content=node('div','bmt-highlight-content');
      content.append(node('span','bmt-highlight-kicker',typeNames[item.kind]||'SHOP UPDATE'));
      content.append(node('h3','',String(item.title||'Featured at Brothers Mobile')));
      if(item.subtitle)content.append(node('p','',String(item.subtitle)));
      const bottom=node('div','bmt-highlight-bottom');
      if(item.price_label)bottom.append(node('span','bmt-highlight-price',String(item.price_label)));
      const url=safeLink(item.link_url);
      if(url){const link=node('a','bmt-highlight-link',item.kind==='offer'?'View offer ↗':'Explore more ↗');link.href=url.href;if(url.origin!==location.origin){link.target='_blank';link.rel='noopener noreferrer';}bottom.append(link);}
      if(bottom.childNodes.length)content.append(bottom);
      card.append(media,content);root.append(card);
    }
  } catch(error) {
    console.warn('Could not load owner-approved highlights',error);
    if(section)section.hidden=true;
  }
})();
