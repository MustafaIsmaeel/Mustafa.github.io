(function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();})(function(){

/* YEAR */
var y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();

/* THEME TOGGLE */
var root = document.documentElement;
var tbtn = document.getElementById('themeToggle');
if (tbtn) tbtn.addEventListener('click', function(){
  var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch(e){}
});

/* TYPEWRITER */
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

/* Cursor aura + trail */
var cursor = document.getElementById('cursor');
var trail = document.getElementById('trail');
var mx=innerWidth/2, my=innerHeight/2;
window.addEventListener('mousemove', function(e){
  mx = e.clientX; my = e.clientY;
  if (cursor) cursor.style.transform = 'translate('+mx+'px,'+my+'px)';
  if (trail) { trail.style.setProperty('--tx', mx + 'px'); trail.style.setProperty('--ty', my + 'px'); }
});

/* Magnetic hover for buttons */
document.querySelectorAll('.magnet, [data-jump]').forEach(function(btn){
  btn.addEventListener('mousemove', function(e){
    var r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', ((e.clientX - r.left)/r.width)*100 + '%');
    btn.style.setProperty('--my', ((e.clientY - r.top)/r.height)*100 + '%');
  });
});

/* Smooth page portal transition on anchor clicks */
var portal = document.getElementById('transition');
function portalJump(target, x, y){
  if (!portal) { document.querySelector(target)?.scrollIntoView({behavior:'smooth'}); return; }
  portal.style.opacity = 1;
  var maxR = Math.hypot(innerWidth, innerHeight);
  var keyframes = [
    { clipPath: `circle(0px at ${x}px ${y}px)`, background: `radial-gradient(circle at ${x}px ${y}px, rgba(0,231,255,.8), rgba(255,61,179,.8) 35%, transparent 40%)` },
    { clipPath: `circle(${maxR}px at ${x}px ${y}px)` }
  ];
  portal.animate(keyframes, { duration: 420, easing: 'cubic-bezier(.22,.61,.36,1)' });
  setTimeout(function(){
    document.querySelector(target)?.scrollIntoView({behavior:'instant'});
    portal.animate(keyframes.slice().reverse(), { duration: 420, easing: 'cubic-bezier(.22,.61,.36,1)' }).onfinish = function(){
      portal.style.opacity = 0;
    };
  }, 240);
}
document.querySelectorAll('[data-jump]').forEach(function(a){
  a.addEventListener('click', function(e){
    e.preventDefault();
    var rect = a.getBoundingClientRect();
    portalJump(a.getAttribute('href'), rect.left+rect.width/2, rect.top+rect.height/2);
  });
});

/* Resume modal */
var modal = document.getElementById('resumeModal');
document.getElementById('openResume')?.addEventListener('click', function(){ modal?.showModal(); });
document.getElementById('closeResume')?.addEventListener('click', function(){ modal?.close(); });

/* Scroll indicator */
document.querySelector('.scroll-indicator')?.addEventListener('click', function(){
  document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
});

/* Scroll progress */
var bar = document.getElementById('scrollbar');
function updateBar(){
  var h = document.documentElement;
  var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
  if (bar) bar.style.width = (scrolled * 100) + '%';
}
window.addEventListener('scroll', updateBar); updateBar();

/* COUNTERS on view */
(function(){
  var started=false;
  function startCounters(){
    if (started) return; started=true;
    document.querySelectorAll('.stat span[data-count]').forEach(function(el){
      var to = parseInt(el.dataset.count,10) || 0;
      var from = 0; var dur = 1200; var t0=null;
      function step(ts){
        if (!t0) t0=ts;
        var p = Math.min(1,(ts-t0)/dur);
        var val = Math.floor(from + (to-from)*p);
        el.textContent = val.toLocaleString();
        if (p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if (e.isIntersecting) { startCounters(); obs.disconnect(); } });
  }, { threshold: .5 });
  document.querySelector('.hero-stats') && obs.observe(document.querySelector('.hero-stats'));
})();

/* Filters with GSAP Flip (fallback ready) */
var filters = document.querySelectorAll('.filter');
var grid = document.getElementById('projectGrid');
var cards = Array.from(document.querySelectorAll('.card'));
filters.forEach(function(f){
  f.addEventListener('click', function(){
    filters.forEach(function(x){ x.classList.remove('active'); });
    f.classList.add('active');
    var tag = f.dataset.filter;

    var state = (window.Flip && grid) ? Flip.getState(cards) : null;
    cards.forEach(function(c){
      var show = (tag === 'all' || c.dataset.tags.split(' ').includes(tag));
      c.style.display = show ? '' : 'none';
    });
    if (state && window.Flip) {
      Flip.from(state, {
        absolute: true, ease: 'power2.inOut', duration: 0.55, stagger: 0.03,
        onEnter: function(el){ gsap.fromTo(el, { opacity:0, y:20, filter:'blur(6px)' }, { opacity:1, y:0, filter:'blur(0)', duration:0.4 }); },
        onLeave: function(el){ gsap.to(el, { opacity:0, y:20, filter:'blur(6px)', duration:0.3 }); }
      });
    }
  });
});

/* ---------------- VISUAL SYSTEMS ---------------- */

/* 1) GSAP reveals / split / headline underline / scramble */
try {
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Split title
    try {
      new window.SplitType('.title-line', { types: 'chars,words' });
      gsap.from('.char', { y: 80, rotateX: -90, opacity: 0, duration: 1.0, stagger: 0.02, ease: 'back.out(1.7)' });
    } catch(e){}

    // Spark underline draw
    gsap.to('.spark path', {
      strokeDasharray: 500, strokeDashoffset: 500,
      duration: 1, ease: 'power2.out',
      scrollTrigger: { trigger: '#hero', start: 'top 60%' },
      onStart: function(){
        var p = document.querySelector('.spark path'); if (!p) return;
        var len = p.getTotalLength();
        p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
        gsap.to(p, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' });
        gsap.to('.spark', { opacity: 1, duration: 0.6 });
      }
    });

    // Section wipes + headline underline + scramble
    document.querySelectorAll('.section').forEach(function(sec){
      gsap.fromTo(sec,
        { clipPath: 'inset(15% 15% 15% 15% round 16px)', opacity: 0, y: 20 },
        { clipPath: 'inset(0% 0% 0% 0% round 16px)', opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: sec, start: 'top 80%' } }
      );
      var hl = sec.querySelector('.headline');
      if (hl) {
        ScrollTrigger.create({
          trigger: hl, start: 'top 85%', once: true,
          onEnter: function(){
            hl.style.setProperty('--sx', 0);
            gsap.to(hl, { '--sx': 1, duration: .8, ease:'power3.out', onUpdate: function(){ hl.style.setProperty('--dummy', Math.random()); }});
            hl.style.setProperty('transform', 'none');
            scrambleText(hl, hl.textContent);
            var st = document.createElement('style'); st.innerHTML='.headline::after{ transform:scaleX(var(--sx,0)); }'; document.head.appendChild(st);
          }
        });
      }
    });

    // Entrances
    gsap.from('.hero-photo', { scale: 0.92, opacity: 0, duration: 0.8, ease: 'power3.out' });
    gsap.from('.lead', { opacity: 0, y: 30, duration: 0.6, delay: 0.15 });
    gsap.from('.cta-row .btn', { opacity: 0, y: 24, stagger: 0.08, duration: 0.5, delay: 0.2 });
    gsap.from('.stat', { opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.06, ease: 'power2.out', delay: 0.25 });

    // Scroll skew on cards
    var proxy = { skew: 0 }, setSkew = gsap.quickSetter('.card', 'skewY', 'deg');
    ScrollTrigger.create({
      onUpdate: function(self){
        var s = gsap.utils.clamp(-10, 10, self.getVelocity() / -300);
        if (Math.abs(s) > Math.abs(proxy.skew)) {
          proxy.skew = s; gsap.to(proxy, { skew: 0, duration: 0.6, ease: 'power3', overwrite: true });
        }
        setSkew(proxy.skew);
      }
    });

    // Hero parallax layers
    if (document.querySelector('.hero-photo')) {
      gsap.to('.hero-photo .blob', {
        scale: 1.1, rotate: 15,
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
      });
      gsap.to('.ring1', { rotate: 90, scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 }});
      gsap.to('.ring2', { rotate: -90, scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 }});
    }
  }
} catch(e){}

/* 2) Constellation network (2D canvas) */
(function(){
  var c = document.getElementById('net'); if (!c) return;
  var ctx = c.getContext('2d'); var dpr = Math.min(2, devicePixelRatio||1);
  var W=innerWidth, H=innerHeight, N = 80, pts=[];
  function resize(){ W=innerWidth; H=innerHeight; c.width=W*dpr; c.height=H*dpr; c.style.width=W+'px'; c.style.height=H+'px'; ctx.setTransform(dpr,0,0,dpr,0,0); }
  window.addEventListener('resize', resize); resize();
  for (var i=0;i<N;i++){ pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6}); }
  var mx=innerWidth/2,my=innerHeight/2;
  window.addEventListener('mousemove', e=>{mx=e.clientX; my=e.clientY;});
  function loop(){
    ctx.clearRect(0,0,W,H);
    for (var i=0;i<N;i++){
      var p=pts[i]; p.x+=p.vx; p.y+=p.vy;
      if (p.x<0||p.x>W) p.vx*=-1; if (p.y<0||p.y>H) p.vy*=-1;
      var dx=p.x-mx, dy=p.y-my, dist=Math.hypot(dx,dy); var m = Math.max(0, 180-dist)/180;
      ctx.fillStyle = `rgba(255,255,255,${.25+.45*m})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8+1.8*m, 0, Math.PI*2); ctx.fill();
    }
    // lines
    for (var a=0;a<N;a++){
      for (var b=a+1;b<N;b++){
        var pa=pts[a], pb=pts[b], dx=pa.x-pb.x, dy=pa.y-pb.y, d=dx*dx+dy*dy;
        if (d<110*110){
          var op = 1 - d/(110*110);
          ctx.strokeStyle = `rgba(0,231,255,${.12+op*.25})`;
          ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  } loop();
})();

/* 3) Skills “data ribbon” */
(function(){
  var c = document.getElementById('ribbon'); if (!c) return;
  var ctx = c.getContext('2d'); var dpr = Math.min(2, devicePixelRatio||1);
  var W=innerWidth, H=innerHeight;
  function resize(){ W=innerWidth; H=innerHeight; c.width=W*dpr; c.height=H*dpr; c.style.width=W+'px'; c.style.height=H+'px'; ctx.setTransform(dpr,0,0,dpr,0,0); }
  window.addEventListener('resize', resize); resize();
  var t=0; function curve(yOff, hue){
    ctx.beginPath(); ctx.moveTo(0,H*0.6+yOff);
    for (var x=0;x<=W;x+=20){
      var y = H*0.6 + Math.sin((x+t)/180 + yOff/80)*30 + Math.cos((x-t)/260 + yOff/60)*18 + yOff;
      ctx.lineTo(x, y);
    }
    ctx.lineWidth = 2.2; ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.35)`; ctx.stroke();
  }
  function loop(){
    var topY = document.getElementById('skills')?.getBoundingClientRect().top || 0;
    ctx.clearRect(0,0,W,H);
    if (topY<innerHeight && topY>-600){
      curve(0, 190); curve(22, 320); curve(-22, 260);
    }
    t+=2; requestAnimationFrame(loop);
  } loop();
})();

/* 4) THREE.js Nebula + star field (background) */
(function(){
  if (!window.THREE) return;
  var canvas = document.getElementById('bg'); if (!canvas) return;
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 1, 2000); cam.position.z = 420;

  // Stars
  var starGeo = new THREE.BufferGeometry(); var count = 2000; var pos = new Float32Array(count*3);
  for (var i=0;i<count*3;i++) pos[i] = (Math.random()-0.5)*1600;
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, opacity: .5, transparent:true });
  var stars = new THREE.Points(starGeo, starMat); scene.add(stars);

  // Nebula plane (shader)
  var geo = new THREE.PlaneGeometry(2000,1200,1,1);
  var frag = `
    precision highp float;
    uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
      return mix(mix(hash(i+vec2(0,0)),hash(i+vec2(1,0)),u.x),
                 mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y); }
    float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.1; a*=.52; } return v; }
    void main(){
      vec2 uv=gl_FragCoord.xy/u_res.xy; vec2 p=(uv-.5)*vec2(u_res.x/u_res.y,1.);
      vec2 m=(u_mouse/u_res-.5)*0.8; float t=u_time*.05; float n=fbm(2.2*p+vec2(t,-t)+m*1.5);
      vec3 col=mix(vec3(0.,.91,1.), vec3(1.,.24,.70), smoothstep(.25,.85,n));
      float v=smoothstep(1.,.2,length(p)); col*=v; gl_FragColor=vec4(col,1.);
    }`;
  var vert = `void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
  var uniforms = { u_res:{value:new THREE.Vector2(1,1)}, u_time:{value:0}, u_mouse:{value:new THREE.Vector2(-1e3,-1e3)} };
  var mat = new THREE.ShaderMaterial({ uniforms:uniforms, vertexShader:vert, fragmentShader:frag, transparent:true, depthWrite:false });
  var plane = new THREE.Mesh(geo, mat); plane.position.z = -200; scene.add(plane);

  function resize(){
    var dpr = Math.min(2, window.devicePixelRatio||1);
    renderer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight);
    cam.aspect = innerWidth/innerHeight; cam.updateProjectionMatrix();
    uniforms.u_res.value.set(innerWidth*dpr, innerHeight*dpr);
  } window.addEventListener('resize', resize); resize();

  window.addEventListener('mousemove', function(e){ uniforms.u_mouse.value.set(e.clientX, innerHeight - e.clientY); });

  var start = performance.now();
  (function loop(){
    uniforms.u_time.value = (performance.now()-start)/1000;
    stars.rotation.x += 0.0005; stars.rotation.y += 0.0008;
    renderer.render(scene, cam);
    requestAnimationFrame(loop);
  })();
})();

/* Text scramble */
function scrambleText(el, finalText){
  var chars = "!<>-_\\/[]{}—=+*^?#________"; var frame=0, q=[];
  var from = el.textContent; var len = Math.max(from.length, finalText.length);
  for (var i=0;i<len;i++){ var start=Math.floor(Math.random()*20), end=start+Math.floor(Math.random()*20); q.push({from:from[i]||"",to:finalText[i]||"",start:start,end:end,char:""}); }
  cancelAnimationFrame(el._scrambleRaf);
  (function update(){
    var out="", complete=0;
    for (var i=0;i<q.length;i++){ var a=q[i];
      if (frame>=a.end){ complete++; out+=a.to; }
      else if (frame>=a.start){ if(!a.char||Math.random()<.28){ a.char=chars[Math.floor(Math.random()*chars.length)]; } out+='<span class="dud">'+a.char+'</span>'; }
      else out+=a.from;
    }
    el.innerHTML=out;
    if (complete===q.length){ el._scrambleRaf=null; return; }
    frame++; el._scrambleRaf=requestAnimationFrame(update);
  })();
}

/* 5) GSAP 3D hover “repulsion” on cards (polished) */
(function(){
  if (!window.gsap) return;
  document.querySelectorAll('.card').forEach(function(card){
    var xTo = gsap.quickTo(card, 'x', { duration: 0.4, ease: 'power3' });
    var yTo = gsap.quickTo(card, 'y', { duration: 0.4, ease: 'power3' });
    var rXTo = gsap.quickTo(card, 'rotateX', { duration: 0.4, ease: 'power3' });
    var rYTo = gsap.quickTo(card, 'rotateY', { duration: 0.4, ease: 'power3' });
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect(); var dx=(e.clientX-r.left)/r.width-.5; var dy=(e.clientY-r.top)/r.height-.5;
      xTo(dx*10); yTo(dy*10); rXTo(-dy*6); rYTo(dx*6);
    });
    card.addEventListener('mouseleave', function(){ xTo(0); yTo(0); rXTo(0); rYTo(0); });
  });
})();

/* 6) VanillaTilt fallback */
if (window.VanillaTilt) {
  VanillaTilt.init(document.querySelectorAll('.tilt, .chip'), { max: 10, speed: 700, glare: true, 'max-glare': .18, gyroscope: true });
}

}); // DOM ready end
