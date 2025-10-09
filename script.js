// PARTICLE STARFIELD BACKGROUND
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
let w, h, stars = [];

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function initStars(count = 100) {
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    z: Math.random() * w,
  }));
}
initStars();

function animateStars() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#00eaff";
  for (let s of stars) {
    s.z -= 2;
    if (s.z <= 0) s.z = w;
    let k = 128.0 / s.z;
    let px = s.x * k + w / 2;
    let py = s.y * k + h / 2;
    if (px >= 0 && px <= w && py >= 0 && py <= h) {
      let size = (1 - s.z / w) * 2;
      ctx.fillRect(px, py, size, size);
    }
  }
  requestAnimationFrame(animateStars);
}
animateStars();

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", e => {
    e.preventDefault();
    document.querySelector(anchor.getAttribute("href"))
      .scrollIntoView({ behavior: "smooth" });
  });
});
