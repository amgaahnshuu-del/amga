function scrollToMenu() {
  window.scrollTo({
    top: document.body.scrollHeight / 2,
    behavior: 'smooth'
  });
}

// Scroll animation
const aboutSection = document.querySelector('.about');
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + window.innerHeight;
  if(scrollPos > aboutSection.offsetTop + 100){
    aboutSection.style.opacity = 1;
    aboutSection.style.transform = 'translateY(0)';
  }
});
aboutSection.style.opacity = 0;
aboutSection.style.transform = 'translateY(50px)';
aboutSection.style.transition = 'all 1s ease-out';