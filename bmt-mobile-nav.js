/* Enhancements only; existing script.js continues to handle menu toggle. */
(()=>{const menu=document.getElementById('menu'),nav=document.getElementById('navlinks');if(!menu||!nav)return;
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰';menu.focus()}});
 document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!e.target.closest('.nav')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'}});
})();
