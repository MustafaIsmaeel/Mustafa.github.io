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

/***** CURSOR AURA *****/
const cursor = document.getElementById('cursor');
window.addEventListener('mousemove', e => {
  gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.12, ease: 'power3.out' });
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

/***** VANILLA TILT (3D tilt on cards/chips/stats) *****/
const tiltEls = document.querySelectorAll('.tilt, .card, .chip');
if (tiltEls.length) {
  VanillaTilt.init(tiltEls, { max: 8, speed: 600, glare: true, 'max-glare': 0.18, gyroscope: true });
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
const st1 = new window.SplitType('.title-line', { types: 'chars' });
gsap.from('.char', {
  y: 100, rotateX: -90, opacity: 0, duration: 1.2, stagger: 0.02, ease: 'back.out(1.7)', delay: 0.1
});
gsap.from('.stat', { opacity: 0, scale: 0.8, duration: 0.8, stagger: 0.08, ease: 'power2.out', delay: 0.6 });

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

/***** THREE.JS — NEBULA + STARS *****/
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
camera.position.set(0, 0, 6);

function onResize(){
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', onResize); onResize();

// Nebula points (colored sphere)
const nebulaGeo = new THREE.SphereGeometry(4, 64, 64);
const nebulaMat = new THREE.PointsMaterial({ size: 0.02, vertexColors: true, transparent: true, opacity: 0.9 });
const cols = []; const pos = nebulaGeo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  // cool gradient mix
  const t = i/pos.count;
  const r = 0.2 + 0.8 * Math.abs(Math.sin(t * Math.PI));
  const g = 0.2 + 0.8 * Math.abs(Math.sin((t + 0.33) * Math.PI));
  const b = 0.2 + 0.8 * Math.abs(Math.sin((t + 0.66) * Math.PI));
  cols.push(r, g, b);
}
nebulaGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
const nebula = new THREE.Points(nebulaGeo, nebulaMat);
scene.add(nebula);

// Starfield
const starGeo = new THREE.BufferGeometry();
const starCount = 900;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 40;
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.012, transparent: true, opacity: .65 }));
scene.add(stars);

// Parallax with mouse
let targetX = 0, targetY = 0;
addEventListener('mousemove', (e)=>{
  const x = (e.clientX / innerWidth - .5) * 2;
  const y = (e.clientY / innerHeight - .5) * 2;
  targetX = x; targetY = y;
});

// Animate loop
function tick(){
  requestAnimationFrame(tick);
  nebula.rotation.y += 0.0018;
  nebula.rotation.x += 0.0009;
  stars.rotation.y += 0.0006;

  camera.position.x += (targetX - camera.position.x) * 0.03;
  camera.position.y += (-targetY - camera.position.y) * 0.03;
  camera.lookAt(0,0,0);

  renderer.render(scene, camera);
}
tick();

/***** ACCESSIBILITY / SMALL UX *****/
// Scroll indicator scrolls to About
document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
  document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
});
