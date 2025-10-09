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
  VanillaTilt.init(tiltEls, {
    max: 8,
    speed: 600,
    glare: true,
    'max-glare': 0.2,
    gyroscope: true
  });
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
    if (show) gsap.fromTo(c, {opacity:0, y:20}, {opacity:1, y:0, duration:.35, overwrite:true});
  });
}));

/***** GSAP SCROLL REVEALS *****/
gsap.registerPlugin(ScrollTrigger);
gsap.utils.toArray('.reveal').forEach(el => {
  gsap.to(el, {
    opacity: 1, y: 0, duration: .7, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 85%' }
  });
});
gsap.from('.stat', {opacity:0, y:20, duration:.6, stagger:.08, ease:'power2.out', delay:.2});

/***** NAV GLASS OPACITY ON SCROLL *****/
const nav = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  const op = Math.min(0.9, 0.25 + window.scrollY / 500);
  nav.style.background = `rgba(0,0,0,${op})`;
});

/***** THREE.JS — MINIMAL 3D ORB *****/
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
camera.position.set(0, 0, 6);

// Resize
function onResize(){
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', onResize); onResize();

// Geometry (wireframe torus + points)
const torus = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.4, .38, 140, 32),
  new THREE.MeshBasicMaterial({ color: 0x00e7ff, wireframe: true, transparent:true, opacity: .22 })
);
const starsGeom = new THREE.BufferGeometry();
const starCount = 600;
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) positions[i] = (Math.random() - .5) * 30;
starsGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const stars = new THREE.Points(
  starsGeom,
  new THREE.PointsMaterial({ color: 0xffffff, size: .012, transparent:true, opacity:.6 })
);
scene.add(torus, stars);

// Parallax
let targetX = 0, targetY = 0;
addEventListener('mousemove', (e)=>{
  const x = (e.clientX / innerWidth - .5) * 2;
  const y = (e.clientY / innerHeight - .5) * 2;
  targetX = x; targetY = y;
});

// Animate
function tick(){
  requestAnimationFrame(tick);
  torus.rotation.x += 0.0025;
  torus.rotation.y += 0.004;

  // gentle parallax
  camera.position.x += (targetX - camera.position.x) * 0.03;
  camera.position.y += (-targetY - camera.position.y) * 0.03;
  camera.lookAt(0,0,0);

  // twinkle
  stars.rotation.y += 0.0008;
  renderer.render(scene, camera);
}
tick();
