const year = document.querySelector('#year')
if (year) year.textContent = String(new Date().getFullYear())

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!reduceMotion) {
  const targets = document.querySelectorAll(
    '.section__head, .service, .feature__copy, .feature__figure, .works-grid figure, .product, .review, .contacts__panel, .contacts__visual',
  )

  targets.forEach((el) => el.classList.add('reveal'))

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
  )

  targets.forEach((el) => observer.observe(el))
}

const beam = document.querySelector('.hero__beam')
if (beam && !reduceMotion) {
  window.addEventListener(
    'scroll',
    () => {
      const y = Math.min(window.scrollY, 480)
      beam.style.translate = `0 ${y * -0.08}px`
    },
    { passive: true },
  )
}
