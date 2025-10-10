(function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();})(function(){

/* YEAR */
document.getElementById('y').textContent = new Date().getFullYear();

/* THEME TOGGLE (persist) */
var root = document.documentElement;
document.getElementById('themeToggle').addEventListener('click', function(){
  var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try{localStorage.setItem('theme', next);}catch(e){}
});

/* INTRO SPLASH → page reveal */
(function(){
  var intro = document.getElementById('intro'); if (!intro) return;
  setTimeout(function(){
    intro.animate([{opacity:1},{opacity:0}], {duration:650, easing:'ease-in-out'}).onfinish = function(){ intro.remove(); };
  }, 1100);
})();

/* TYPED SUBTITLE (robust) */
(function(){
  var el = document.getElementById('typed'); if (!el) return;
  var words = ["Data Engineering","Automation Architect","Visualization Designer","ETL Pipeline Builder","Power BI Developer"];
  var i=0, len=0, del=false;
  (function loop(){
    var full = words[i];
    el.textContent = del ? full.slice(0, --len) : full.slice(0, ++len);
    var speed = del ? 70 : 110;
    if (!del && len === full.length){ del = true; speed = 1100; }
    if (del && len === 0){ del = false; i = (i+1)%words.length; speed = 450; }
    setTimeout(loop, speed);
  })();
})();

/* CURSOR comet + trail + beam */
var cursor = document.getElementById('cursor'), trail = document.getElementById('trail'), beam = document.getElementById('beam');
var mx=innerWidth/2, my=innerHeight/2, pmx=mx, pmy=my;
addEventListener('mousemove', function(e){
  pmx=mx; pmy=my; mx=e.clientX; my=e.clientY;
  cursor.style.transform = `translate(${mx}px,${my}px)`;
  trail.style.setProperty('--tx', mx + 'px'); trail.style.setProperty('--ty', my + 'px');
  var angle = Math.atan2(my - pmy, mx - pmx);
  beam.style.transform = `translate(${mx-60}px,${my}px) rotate(${angle}rad)`;
});

/* NAV magnetic underline */
(function(){
  var nav = document.querySelector('.navlinks'); if(!nav) return;
  var u = nav.querySelector('::after'); // not accessible; emulate by measuring
  var underline = document.createElement('div');
  underline.className = 'nav-underline';
  underline.style.cssText = 'position:absolute;height:2px;background:linear-gradient(90deg,var(--primary),var(--accent));border-radius:2px;bottom:2px;left:0;width:0;transition:transform .2s,width .2s;pointer-events:none';
  nav.appendChild(underline);
  nav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('mouseenter', function(){
      var r = a.getBoundingClientRect(), nr = nav.getBoundingClientRect();
      underline.style.width = r.width + 'px';
      underline.style.transform = `translateX(${r.left - nr.left}px)`;
    });
  });
  nav.addEventListener('mouseleave', function(){ underline.style.width = '0px'; });
})();

/* Magnetic hover for buttons & nav anchors */
document.querySelectorAll('.magnet,[data-jump]').forEach(function(btn){
  btn.addEventListener('mousemove', function(e){
    var r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', ((e.clientX - r.left)/r.width)*100 + '%');
    btn.style.setProperty('--my', ((e.clientY - r.top)/r.height)*100 + '%');
  });
});

/* Liquid portal transition on anchor clicks */
var portal = document.getElementById('transition');
function portalJump(target, x, y){
  if (!portal) { document.querySelector(target)?.scrollIntoView({behavior:'smooth'}); return; }
  portal.style.opacity = 1;
  var maxR = Math.hypot(innerWidth, innerHeight);
  var kf = [
    { clipPath:`circle(0px at ${x}px ${y}px)`, background:`radial-gradient(circle at ${x}px ${y}px, rgba(0,231,255,.85), rgba(255,61,179,.85) 35%, transparent 40%)` },
    { clipPath:`circle(${maxR}px at ${x}px ${y}px)` }
  ];
  portal.animate(kf,{duration:420,easing:'cubic-bezier(.22,.61,.36,1)'}); 
  setTimeout(function(){
    document.querySelector(target)?.scrollIntoView({behavior:'instant'});
    portal.animate(kf.slice().reverse(),{duration:420,easing:'cubic-bezier(.22,.61,.36,1)'}).onfinish=function(){portal.style.opacity=0;};
  }, 240);
}
document.querySelectorAll('[data-jump]').forEach(function(a){
  a.addEventListener('click', function(e){
    e.preventDefault();
    var r = a.getBoundingClientRect();
    portalJump(a.getAttribute('href'), r.left + r.width/2, r.top + r.height/2);
  });
});

/* Resume modal */
var modal = document.getElementById('resumeModal');
document.getElemen
