// Run everything after DOM is ready (also makes typewriter robust)
document.addEventListener('DOMContentLoaded', () => {

/******** YEAR ********/
document.getElementById('y').textContent = new Date().getFullYear();

/******** THEME (reliable) ********/
const htmlEl = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const stored = localStorage.getItem('theme');
if (stored === 'light' || stored === 'dark') htmlEl.setAttribute('data-theme', stored);
themeBtn.addEventListener('click', () => {
  const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  htmlEl.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/******** CURSOR + TRAIL ********/
const cursor = document.getElementById('cursor');
const trail = document.getElementById('trail');
window.addEventListener('mousemove', (e) => {
  const x = e.clientX, y = e.clientY;
  if (window.gsap) {
    gsap.to(cursor, { x, y, duration: 0.12, ease: 'power3.out' });
  } else {
    cursor.style.transform = `translate(${x - 18}px, ${y - 18}px)`; // fallback
  }
  trail.style.setProperty('--tx', x + 'px');
  trail.style.setProperty('--ty', y + 'px');
});

/******** RIPPLE HELPER (for .ripple buttons) ********/
document.querySelectorAll('.ripple').forEach(btn=>{
  btn.addEventListener('pointerdown', (e)=>{
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    btn.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/******** TILT (cards, chips, portrait) ********/
if (window.VanillaTilt) {
  VanillaTilt.init(document.querySelectorAll('.tilt, .card, .chip'), {
    max: 10, speed: 700, glare: true, 'max-glare': 0.18, gyroscope: true
  });
}

/******** FILTERS ********/
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

/******** TYPEWRITER (no libs) ********/
const titles = [
  "Data Engineering",
  "Automation Architect",
  "Visualization Designer",
  "ETL Pipeline Builder",
  "Power BI Developer"
];
const typed = document.getElementById('typed');
let w = 0, i = 0, del = false;
function loopType(){
  if (!typed) return;
  const full = titles[i];
  typed.textContent = full.slice(0, w);
  let speed = del ? 70 : 110;
  if (!del && w === full.length){ del = true; speed = 1200; }
  else if (del && w === 0){ del = false; i = (i+1)%titles.length; speed = 450; }
  w += del ? -1 : 1;
  setTimeout(loopType, speed);
}
loopType();

/******** GSAP ANIMS (with graceful fallback) ********/
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  // Hero intro
  const tl = gsap.timeline();
  tl.from('.hero-photo', { scale: 0, opacity: 0, duration: 1.0, ease: 'back.out(1.8)' })
    .from('.title .title-line', { y: 70, opacity: 0, duration: 0.9, ease: 'power4.out' }, '-=0.4')
    .from('.lead', { opacity: 0, y: 30, duration: 0.6 }, '-=0.5')
    .from('.cta-row .btn', { opacity: 0, y: 24, stagger: 0.08, duration: 0.5 }, '-=0.4')
    .from('.stat', { opacity: 0, scale: 0.85, duration: 0.7, stagger: 0.08, ease: 'power2.out' }, '-=0.2');

  // Rings drift on scroll
  gsap.to('.ring1', { rotate: 360, ease: 'none', duration: 30, repeat: -1 });
  gsap.to('.ring2', { rotate
