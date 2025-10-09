// Scroll Reveal Animations
const reveals = document.querySelectorAll('.reveal');
function revealOnScroll() {
  for (let i = 0; i < reveals.length; i++) {
    const windowHeight = window.innerHeight;
    const elementTop = reveals[i].getBoundingClientRect().top;
    const elementVisible = 150;
    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add('active');
    }
  }
}
window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

// Navbar glow on scroll
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  header.style.background = window.scrollY > 50 ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.6)';
});
