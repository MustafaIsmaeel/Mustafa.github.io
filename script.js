/***** YEAR *****/
document.getElementById('y').textContent = new Date().getFullYear();

/***** THEME TOGGLE *****/
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);
themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/***** CURSOR AURA + TRAIL *****/
const cursor = document.getElementById('cursor');
const trail = document.getElementById('trail');
let cx = -100, cy = -100;
window.addEventListener('mousemove', e => {
  cx = e.clientX; cy = e.clientY;
  gsap.to(cursor, { x: cx, y: cy, duration: 0.12, ease: 'power3.out' });
  trail.style.setProperty('--tx', cx + 'px');
  trail.style.setProperty('--ty', cy + 'px');
});

/***** MAGNETIC BUTTON HOVER *****/
document.querySelectorAll('.magnet').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    btn.style.setProperty('--mx', x + '%');
    btn.style.setProperty('--my', y + '%');
  });
});

/***** VANILLA TILT (3D tilt on cards/chips/stats & portrait) *****/
const tiltEls = document.querySelectorAll('.tilt, .card, .chip');
if (tiltEls.length) {
  VanillaTilt.init(tiltEls, { max: 10, speed: 700, glare: true, 'max-glare': 0.18, gyroscope: true });
}

/***** PROJECT FILTERS *****/
const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.card');
filters.forEach(f => f.addEventListener('click', () => {
  filters.forEach(x => x.classList.remove('active'));
  f.classList.add('active');
  const tag = f.dataset.filter;
  cards.forEach(c => {
    const tags = c.dataset.tags.split(' ');
    const show = tag === 'all' || tags.includes(tag);
    c.style.display = show ? '' : 'none';
    if (show) gsap.fromTo(c, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .35, overwrite: true });
  });
}));

/***** GSAP + SplitType: HERO ENTRY *****/
gsap.registerPlugin(ScrollTrigger);
new window.SplitType('.title-line', { types: 'chars,words' });
gsap.from('.hero-photo', { scale: 0, opacity: 0, duration: 1.1, ease: 'back.out(1.8)' });
gsap.from('.char', {
  y: 80, rotateX: -90, opacity: 0, duration: 1.1, stagger: 0.02, ease: 'back.out(1.7)', delay: 0.1
});
gsap.from('.lead', { opacity: 0, y: 30, duration: 0.6, delay: 0.35 });
gsap.from('.cta-row .btn', { opacity: 0, y: 24, stagger: 0.08, duration: 0.5, delay: 0.45 });
gsap.from('.stat', { opacity: 0, scale: 0.85, duration: 0.7, stagger: 0.08, ease: 'power2.out', delay: 0.6 });

/***** SECTION REVEALS *****/
gsap.utils.toArray('.reveal').forEach(el => {
  gsap.to(el, {
    opacity: 1, y: 0, duration: .8, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 85%' }
  });
});

/***** NAV DARKEN ON SCROLL *****/
const nav = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  const op = Math.min(0.9, 0.25 + window.scrollY / 500);
  nav.style.background = `rgba(0,0,0,${op})`;
});

/***** Lenis Smooth Scroll *****/
const lenis = new Lenis({ smoothWheel: true, wheelMultiplier: 1.1 });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

/***** THREE.JS — ANIMATED SHADER BACKGROUND (nebula-ish) *****/
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Fullscreen quad
const geo = new THREE.PlaneGeometry(2, 2);

// Simple GLSL for moving gradient noise (fast & pretty)
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

  // mouse parallax
  vec2 m = (u_mouse / u_res - .5) * 0.8;

  float t = u_time * .07;
  float n = fbm(3.0*p + vec2(t, -t) + m*2.0);

  vec3 col1 = vec3(0.0, 0.91, 1.0); // primary
  vec3 col2 = vec3(1.0, 0.24, 0.70); // accent
  vec3 col = mix(col1, col2, smoothstep(0.3, 0.8, n));

  // subtle vignette
  float v = smoothstep(1.0, 0.2, length(p));
  col *= v;

  gl_FragColor = vec4(col, 1.0);
}
`;
const vert = `
void main(){ gl_Position = vec4(position, 1.0); }
`;

const uniforms = {
  u_res:   { value: new THREE.Vector2(1,1) },
  u_time:  { value: 0 },
  u_mouse: { value: new THREE.Vector2(-1000,-1000) }
};

const mat = new THREE.ShaderMaterial({
  uniforms, vertexShader: vert, fragmentShader: frag
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

function onResize(){
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight);
  uniforms.u_res.value.set(innerWidth * dpr, innerHeight * dpr);
}
addEventListener('resize', onResize); onResize();

addEventListener('mousemove', (e)=>{
  uniforms.u_mouse.value.set(e.clientX, innerHeight - e.clientY);
});

let start = performance.now();
function render(){
  requestAnimationFrame(render);
  uniforms.u_time.value = (performance.now() - start) / 1000;
  renderer.render(scene, camera);
}
render();
/***** OVERLAY FLYING PARTICLES *****/
const pScene = new THREE.Scene();
const pCamera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 1, 1000);
pCamera.position.z = 400;

const pGeo = new THREE.BufferGeometry();
const pCount = 800;
const pos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount * 3; i++) pos[i] = (Math.random() - 0.5) * 800;
pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, opacity: 0.5, transparent: true });
const points = new THREE.Points(pGeo, pMat);
pScene.add(points);

function renderParticles() {
  points.rotation.x += 0.0006;
  points.rotation.y += 0.001;
  renderer.autoClear = false;
  renderer.clear();
  renderer.render(scene, camera);     // shader plane
  renderer.render(pScene, pCamera);   // particles
  requestAnimationFrame(renderParticles);
}
renderParticles();

/***** ACCESSIBILITY / SMALL UX *****/
// Scroll indicator → About
document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
  document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
});

/***** TYPEWRITER SUBTITLE *****/
const titles = [
  "Data Engineering",
  "Automation Architect",
  "Visualization Designer",
  "ETL Pipeline Builder",
  "Power BI Developer"
];
let i = 0, j = 0, current = "", isDeleting = false;
const el = document.getElementById("typed");

function type() {
  const full = titles[i];
  if (isDeleting) {
    current = full.substring(0, j--);
  } else {
    current = full.substring(0, j++);
  }
  el.textContent = current;

  let speed = isDeleting ? 80 : 120;

  if (!isDeleting && j === full.length) {
    speed = 1600;            // pause before delete
    isDeleting = true;
  } else if (isDeleting && j === 0) {
    isDeleting = false;
    i = (i + 1) % titles.length;
    speed = 500;             // pause before new word
  }
  setTimeout(type, speed);
}
type();

