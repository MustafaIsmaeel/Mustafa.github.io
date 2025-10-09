// Helper to run after DOM ready
(function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();})(function(){

/* YEAR */
var y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();

/* THEME TOGGLE + confetti burst */
var root = document.documentElement;
var tbtn = document.getElementById('themeToggle');
if (tbtn) tbtn.addEventListener('click', function(){
  var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch(e){}
  burstConfetti();
});

/* TYPEWRITER — independent of libraries */
(function(){
  var el = document.getElementById('typed');
  if (!el) return;
  var words = ["Data Engineering","Automation Architect","Visualization Designer","ETL Pipeline Builder","Power BI Developer"];
  var i=0, len=0, del=false;
  (function loop(){
    var full = words[i];
    el.textContent = del ? full.slice(0, --len) : full.slice(0, ++len);
    var speed = del ? 70 : 110;
    if (!del && len === full.length){ del = true; speed = 1200; }
    if (del && len === 0){ del = false; i = (i+1)%words.length; speed = 500; }
    setTimeout(loop, speed);
  })();
})();

/* Cursor aura + trail + beam + orbs */
var cursor = document.getElementById('cursor');
var trail = document.getElementById('trail');
var beam = document.getElementById('beam');
var orbs = Array.from(document.querySelectorAll('.orb'));
var mx=window.innerWidth/2, my=window.innerHeight/2, pmx=mx, pmy=my;
window.addEventListener('mousemove', function(e){
  pmx = mx; pmy = my; mx = e.clientX; my = e.clientY;
  if (cursor) cursor.style.transform = 'translate('+mx+'px,'+my+'px)';
  if (trail) { trail.style.setProperty('--tx', mx + 'px'); trail.style.setProperty('--ty', my + 'px'); }
  if (beam) {
    var angle = Math.atan2(my - pmy, mx - pmx);
    beam.style.transform = 'translate('+(mx-60)+'px,'+(my)+'px) rotate('+angle+'rad)';
  }
});
/* Flocking orbs */
(function animateOrbs(){
  orbs.forEach(function(o, idx){
    var ox = parseFloat(o.dataset.x || Math.random()*innerWidth);
    var oy = parseFloat(o.dataset.y || Math.random()*innerHeight);
    var lerp = 0.12 + idx*0.04;
    ox += (mx - ox) * lerp;
    oy += (my - oy) * lerp;
    o.dataset.x = ox; o.dataset.y = oy;
    o.style.transform = 'translate('+ox+'px,'+oy+'px)';
  });
  requestAnimationFrame(animateOrbs);
})();

/* Magnetic hover for btns */
document.querySelectorAll('.magnet').forEach(function(btn){
  btn.addEventListener('mousemove', function(e){
    var r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', ((e.clientX - r.left)/r.width)*100 + '%');
    btn.style.setProperty('--my', ((e.clientY - r.top)/r.height)*100 + '%');
  });
});

/* VanillaTilt (optional) */
if (window.VanillaTilt) {
  VanillaTilt.init(document.querySelectorAll('.tilt, .card, .chip'), { max: 10, speed: 700, glare: true, 'max-glare': .18, gyroscope: true });
}

/* Resume modal */
var modal = document.getElementById('resumeModal');
document.getElementById('openResume')?.addEventListener('click', function(){ modal?.showModal(); });
document.getElementById('closeResume')?.addEventListener('click', function(){ modal?.close(); });

/* Scroll indicator */
document.querySelector('.scroll-indicator')?.addEventListener('click', function(){
  document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
});

/* Scroll progress bar */
var bar = document.getElementById('scrollbar');
function updateBar(){
  var h = document.documentElement;
  var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
  if (bar) bar.style.width = (scrolled * 100) + '%';
}
window.addEventListener('scroll', updateBar); updateBar();

/* Filters with GSAP Flip (fallback to simple) */
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
        absolute: true,
        ease: 'power2.inOut',
        duration: 0.55,
        stagger: 0.03,
        onEnter: function(el){ gsap.fromTo(el, { opacity:0, y:20, filter:'blur(6px)' }, { opacity:1, y:0, filter:'blur(0)', duration:0.4 }); },
        onLeave: function(el){ gsap.to(el, { opacity:0, y:20, filter:'blur(6px)', duration:0.3 }); }
      });
    }
  });
});

/* ---------------- Fancy GSAP + Three if available ---------------- */
try {
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    /* Title chars + spark underline */
    try {
      new window.SplitType('.title-line', { types: 'chars,words' });
      gsap.from('.char', { y: 80, rotateX: -90, opacity: 0, duration: 1.0, stagger: 0.02, ease: 'back.out(1.7)' });
    } catch(e){}
    gsap.to('.spark path', {
      strokeDasharray: 500, strokeDashoffset: 500,
      duration: 1, ease: 'power2.out',
      scrollTrigger: { trigger: '#hero', start: 'top 60%' },
      onStart: function(){
        var path = document.querySelector('.spark path');
        if (!path) return;
        var len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        gsap.to(path, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' });
        gsap.to('.spark', { opacity: 1, duration: 0.6, ease: 'power2.out' });
      }
    });

    /* Hero entrance + stats */
    gsap.from('.hero-photo', { scale: 0.92, opacity: 0, duration: 0.8, ease: 'power3.out' });
    gsap.from('.lead', { opacity: 0, y: 30, duration: 0.6, delay: 0.15 });
    gsap.from('.cta-row .btn', { opacity: 0, y: 24, stagger: 0.08, duration: 0.5, delay: 0.2 });
    gsap.from('.stat', { opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.06, ease: 'power2.out', delay: 0.25 });

    /* Section wipe + headline underline */
    document.querySelectorAll('.section').forEach(function(sec){
      gsap.fromTo(sec,
        { clipPath: 'inset(15% 15% 15% 15% round 16px)', opacity: 0, y: 20 },
        { clipPath: 'inset(0% 0% 0% 0% round 16px)', opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: sec, start: 'top 80%' } }
      );
      var hl = sec.querySelector('.headline');
      if (hl) gsap.to(hl, {
        scrollTrigger:{ trigger: hl, start:'top 85%' },
        onEnter: function(){
          hl.style.setProperty('--u', 1);
          gsap.to(hl, { duration: 0.001, onStart: function(){
            hl.style.setProperty('--underline', 1);
          }});
          gsap.to(hl, { duration: 0.6, onStart: function(){
            hl.style.setProperty('--underline', 1);
          }});
          gsap.to(hl, { duration: 0.6, onStart: function(){
            var after = window.getComputedStyle(hl, '::after');
            hl.style.setProperty('--start', '0');
          }});
          gsap.fromTo(hl, { '--sx': 0 }, { '--sx': 1, duration: .8, ease:'power3.out',
            onUpdate: function(){
              // drive underline via CSS transform scaleX using ::after
              hl.style.setProperty('--dummy', Math.random());
            }
          });
          // actual transform handled by CSS scaleX
          hl.style.setProperty('transform', 'none');
          hl.style.setProperty('--sx', 1);
          hl.style.setProperty('--dummy', 0);
          hl.style.setProperty('--underline', 1);
          hl.style.setProperty('--u', 1);
          hl.style.setProperty('--start', 1);
          hl.style.setProperty('--sx', 1);
          hl.style.setProperty('--dummy', 0);
          hl.style.setProperty('--underline', 1);
          hl.style.setProperty('--u', 1);
        }
      });
      // CSS handles ::after scale; JS just triggers
      var a = document.createElement('style');
      a.innerHTML = '.headline::after{ transform:scaleX(var(--sx,0)); }';
      document.head.appendChild(a);
    });

    /* Scroll skew on cards */
    var proxy = { skew: 0 }, setSkew = gsap.quickSetter('.card', 'skewY', 'deg');
    ScrollTrigger.create({
      onUpdate: function(self){
        var s = gsap.utils.clamp(-10, 10, self.getVelocity() / -300);
        if (Math.abs(s) > Math.abs(proxy.skew)) {
          proxy.skew = s;
          gsap.to(proxy, { skew: 0, duration: 0.6, ease: 'power3', overwrite: true });
        }
        setSkew(proxy.skew);
      }
    });

    /* Hero parallax layers */
    if (document.querySelector('.hero-photo')) {
      gsap.to('.hero-photo .blob', {
        scale: 1.1, rotate: 15,
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
      });
      gsap.to('.ring1', { rotate: 90, scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 }});
      gsap.to('.ring2', { rotate: -90, scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 }});
    }

    /* Magnetic “repulsion” depth on cards */
    document.querySelectorAll('.card').forEach(function(card){
      var xTo = gsap.quickTo(card, 'x', { duration: 0.4, ease: 'power3' });
      var yTo = gsap.quickTo(card, 'y', { duration: 0.4, ease: 'power3' });
      var rXTo = gsap.quickTo(card, 'rotateX', { duration: 0.4, ease: 'power3' });
      var rYTo = gsap.quickTo(card, 'rotateY', { duration: 0.4, ease: 'power3' });
      card.addEventListener('mousemove', function(e){
        var rect = card.getBoundingClientRect();
        var dx = (e.clientX - rect.left) / rect.width - 0.5;
        var dy = (e.clientY - rect.top) / rect.height - 0.5;
        xTo(dx * 10); yTo(dy * 10); rXTo(-dy * 6); rYTo(dx * 6);
      });
      card.addEventListener('mouseleave', function(){ xTo(0); yTo(0); rXTo(0); rYTo(0); });
    });
  }

  /* THREE.js shader + flying particles */
  if (window.THREE) {
    var canvas = document.getElementById('bg'); if (canvas) {
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      var shaderScene = new THREE.Scene();
      var shaderCam = new THREE.OrthographicCamera(-1,1,1,-1,0,1);

      var geo = new THREE.PlaneGeometry(2,2);
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
          vec2 m=(u_mouse/u_res-.5)*0.8; float t=u_time*.07; float n=fbm(3.*p+vec2(t,-t)+m*2.);
          vec3 col=mix(vec3(0.,.91,1.), vec3(1.,.24,.70), smoothstep(.3,.8,n));
          float v=smoothstep(1.,.2,length(p)); col*=v; gl_FragColor=vec4(col,1.);
        }`;
      var vert = `void main(){ gl_Position = vec4(position,1.0); }`;
      var uniforms = { u_res:{value:new THREE.Vector2(1,1)}, u_time:{value:0}, u_mouse:{value:new THREE.Vector2(-1e3,-1e3)} };
      var mat = new THREE.ShaderMaterial({ uniforms:uniforms, vertexShader:vert, fragmentShader:frag });
      shaderScene.add(new THREE.Mesh(geo, mat));

      // Particles
      var pScene = new THREE.Scene();
      var pCam = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 1, 1000); pCam.position.z = 400;
      var pGeo = new THREE.BufferGeometry(); var count = 1400; var pos = new Float32Array(count*3);
      for (var i=0;i<count*3;i++) pos[i] = (Math.random()-0.5)*900;
      pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, opacity: .5, transparent:true });
      var points = new THREE.Points(pGeo, pMat); pScene.add(points);

      function resize(){
        var dpr = Math.min(2, window.devicePixelRatio||1);
        renderer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight);
        uniforms.u_res.value.set(innerWidth*dpr, innerHeight*dpr);
        pCam.aspect = innerWidth/innerHeight; pCam.updateProjectionMatrix();
      }
      window.addEventListener('resize', resize); resize();
      window.addEventListener('mousemove', function(e){ uniforms.u_mouse.value.set(e.clientX, innerHeight - e.clientY); });

      var start = performance.now();
      (function loop(){
        uniforms.u_time.value = (performance.now()-start)/1000;
        points.rotation.x += 0.0006; points.rotation.y += 0.001;
        renderer.autoClear = true; renderer.render(shaderScene, shaderCam);
        renderer.autoClear = false; renderer.render(pScene, pCam);
        requestAnimationFrame(loop);
      })();
    }
  }
} catch(e){ console.warn('Optional animations skipped', e); }

/* Confetti burst (DOM based, no library) */
function burstConfetti(){
  var N = 18;
  for (var i=0;i<N;i++){
    var s = document.createElement('span');
    s.className = 'confetti';
    var size = 6 + Math.random()*8;
    s.style.width = size+'px'; s.style.height = size+'px';
    s.style.left = (mx - size/2)+'px'; s.style.top = (my - size/2)+'px';
    s.style.background = 'hsl('+(Math.random()*360)+',100%,60%)';
    document.body.appendChild(s);
    (function(sp,dx,dy,rot){
      var x=mx, y=my, vx=(Math.random()-0.5)*6, vy=-Math.random()*7-3, r=0;
      var life=0, max=60+Math.random()*20;
      (function step(){
        x+=vx; y+=vy; vy+=0.22; r+=rot;
        sp.style.transform = 'translate('+x+'px,'+y+'px) rotate('+r+'deg)';
        life++;
        if (life<max) requestAnimationFrame(step);
        else sp.remove();
      })();
    })(s,0,0,(Math.random()-0.5)*20);
  }
}

});
