document.addEventListener('DOMContentLoaded', () => {
/* ---------- YEAR ---------- */
const yearSpan = document.getElementById('y');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* ---------- THEME TOGGLE (robust + prefers-color-scheme) ---------- */
const rootEl = document.documentElement;
const stored = localStorage.getItem('theme');
if (stored === 'light' || stored === 'dark') {
  rootEl.setAttribute('data-theme', stored);
} else {
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  rootEl.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
}
document.getElementById('themeToggle')?.addEventListener('click', () => {
  const next = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  rootEl.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ---------- CURSOR + TRAIL ---------- */
const cursor = document.getElementById('cursor');
const trail = document.getElementById('trail');
window.addEventListener('mousemove', e => {
  if (cursor) {
    (window.gsap ? gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.12, ease: 'power3.out' })
                 : (cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`));
  }
  if (trail) {
    trail.style.setProperty('--tx', e.clientX + 'px');
    trail.style.setProperty('--ty', e.clientY + 'px');
  }
});

/* ---------- RIPPLE for buttons ---------- */
document.querySelectorAll('.ripple').forEach(btn => {
  btn.addEventListener('click', () => {}); // CSS-only ripple, but ensure :active triggers
});

/* ---------- MAGNETIC HOVER ---------- */
document.querySelectorAll('.magnet').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    btn.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  });
});

/* ---------- VANILLA TILT ---------- */
if (window.VanillaTilt) {
  VanillaTilt.init(document.querySelectorAll('.tilt, .card, .chip'), {
    max: 10, speed: 700, glare: true, 'max-glare': 0.18, gyroscope: true
  });
}

/* ---------- FILTERS ---------- */
const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.card');
filters.forEach(f => f.addEventListener('click', () => {
  filters.forEach(x => x.classList.remove('active'));
  f.classList.add('active');
  const tag = f.dataset.filter;
  cards.forEach(c => {
    const show = tag === 'all' || c.dataset.tags.split(' ').includes(tag);
    c.style.display = show ? '' : 'none';
    if (show && window.gsap) gsap.fromTo(c, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .35, overwrite: true });
  });
}));

/* ---------- TYPEWRITER (independent of GSAP) ---------- */
const typedEl = document.getElementById('typed');
const roles = [
  "Data Engineering",
  "Automation Architect",
  "Visualization Designer",
  "ETL Pipeline Builder",
  "Power BI Developer"
];
let ridx = 0, llen = 0, del = false;
function typeNext() {
  if (!typedEl) return;
  const full = roles[ridx];
  if (!del) { typedEl.textContent = full.slice(0, ++llen); }
  else { typedEl.textContent = full.slice(0, --llen); }

  let speed = del ? 70 : 110;
  if (!del && llen === full.length) { speed = 1200; del = true; }
  if (del && llen === 0) { del = false; ridx = (ridx + 1) % roles.length; speed = 500; }
  setTimeout(typeNext, speed);
}
typeNext();

/* ---------- GSAP ENHANCEMENTS (guarded) ---------- */
if (window.gsap) {
  try {
    gsap.registerPlugin(ScrollTrigger);

    // SplitType guard
    try {
      new window.SplitType('.title-line', { types: 'chars,words' });
      gsap.from('.char', { y: 80, rotateX: -90, opacity: 0, duration: 1.0, stagger: 0.02, ease: 'back.out(1.7)', delay: 0.1 });
    } catch(e){ /* SplitType not critical */ }

    // Hero photo + stats
    gsap.from('.hero-photo', { scale: 0.9, opacity: 0, duration: 0.8, ease: 'power3.out' });
    gsap.from('.lead', { opacity: 0, y: 30, duration: 0.6, delay: 0.2 });
    gsap.from('.cta-row .btn', { opacity: 0, y: 24, stagger: 0.08, duration: 0.5, delay: 0.25 });
    gsap.from('.stat', { opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.06, ease: 'power2.out', delay: 0.3 });

    // Parallax hero photo on scroll
    gsap.to('.hero-photo', {
      yPercent: -8,
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 }
    });

    // Section entrance (content is visible by default)
    document.querySelectorAll('.section').forEach(sec => {
      gsap.from(sec, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: sec, start: 'top 85%' }
      });
    });

    // Scroll skew for cards
    const proxy = { skew: 0 };
    const setSkew = gsap.quickSetter('.card', 'skewY', 'deg');
    ScrollTrigger.create({
      onUpdate: (self) => {
        let s = self.getVelocity() / -300;
        s = gsap.utils.clamp(-10, 10, s);
        if (Math.abs(s) > Math.abs(proxy.skew)) {
          proxy.skew = s;
          gsap.to(proxy, { skew: 0, duration: 0.6, ease: 'power3', overwrite: true });
        }
        setSkew(proxy.skew);
      }
    });
  } catch (e) {
    console.warn('GSAP enhancements skipped:', e);
  }
}

/* ---------- Lenis smooth scroll (guarded) ---------- */
if (window.Lenis) {
  const lenis = new Lenis({ smoothWheel: true, wheelMultiplier: 1.1 });
  function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

/* ---------- Three.js: shader + flying particles (guarded) ---------- */
(function initThree(){
  if (!window.THREE) return;
  const canvas = document.getElementById('bg');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const shaderScene = new THREE.Scene();
  const shaderCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const frag = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(in vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v=0.0; float a=.5;
  for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.1; a*=.52; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = (uv - .5) * vec2(u_res.x/u_res.y, 1.0);
  vec2 m = (u_mouse / u_res - .5) * 0.8;
  float t = u_time * .07;
  float n = fbm(3.0*p + vec2(t, -t) + m*2.0);
  vec3 col1 = vec3(0.0, 0.91, 1.0);
  vec3 col2 = vec3(1.0, 0.24, 0.70);
  vec3 col = mix(col1, col2, smoothstep(0.3, 0.8, n));
  float v = smoothstep(1.0, 0.2, length(p));
  col *= v;
  gl_FragColor = vec4(col, 1.0);
}`;
  const vert = `void main(){ gl_Position = vec4(position, 1.0); }`;

  const uniforms = {
    u_res:   { value: new THREE.Vector2(1,1) },
    u_time:  { value: 0 },
    u_mouse: { value: new THREE.Vector2(-1000,-1000) }
  };
  const shaderMat = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag });
  shaderScene.add(new THREE.Mesh(quadGeo, shaderMat));

  // Particles overlay scene
  const pScene = new THREE.Scene();
  const pCam = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 1, 1000);
  pCam.position.z = 400;
  const pGeo = new THREE.BufferGeometry();
  const pCount = 1200;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 900;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, opacity: 0.5, transparent: true });
  const points = new THREE.Points(pGeo, pMat);
  pScene.add(points);

  function onResize(){
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.setSize(innerWidth, innerHeight);
    uniforms.u_res.value.set(innerWidth * dpr, innerHeight * dpr);
    pCam.aspect = innerWidth/innerHeight;
    pCam.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize); onResize();

  window.addEventListener('mousemove', (e)=>{
    uniforms.u_mouse.value.set(e.clientX, innerHeight - e.clientY);
  });

  let start = performance.now();
  (function render(){
    uniforms.u_time.value = (performance.now() - start) / 1000;
    points.rotation.x += 0.0006;
    points.rotation.y += 0.001;
    renderer.autoClear = true;
    renderer.render(shaderScene, shaderCam);
    renderer.autoClear = false;
    renderer.render(pScene, pCam);
    requestAnimationFrame(render);
  })();
})();

/* ---------- Resume Modal ---------- */
const modal = document.getElementById('resumeModal');
document.getElementById('openResume')?.addEventListener('click', () => modal?.showModal());
document.getElementById('closeResume')?.addEventListener('click', () => modal?.close());

/* ---------- Scroll indicator ---------- */
document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
  document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
});

}); // DOMContentLoaded
