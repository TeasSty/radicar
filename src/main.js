const year = document.querySelector('#year')
if (year) year.textContent = String(new Date().getFullYear())

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const formatPrice = (value) =>
  `${new Intl.NumberFormat('ru-RU').format(value)}\u00a0₽`

const renderCatalog = async () => {
  const grid = document.querySelector('#catalog-grid')
  const countEl = document.querySelector('#catalog-count')
  if (!grid) return

  try {
    const res = await fetch('./products.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const products = await res.json()
    if (countEl) countEl.textContent = String(products.length)

    grid.replaceChildren(
      ...products.map((product) => {
        const article = document.createElement('article')
        article.className = 'product'

        const link = document.createElement('a')
        link.className = 'product__link'
        link.href = product.href
        link.target = '_blank'
        link.rel = 'noopener noreferrer'

        const media = document.createElement('div')
        media.className = 'product__media'

        if (product.img) {
          const img = document.createElement('img')
          img.src = product.img
          img.alt = product.name
          img.loading = 'lazy'
          img.decoding = 'async'
          img.width = 333
          img.height = 400
          img.referrerPolicy = 'no-referrer'
          media.append(img)
        }

        const title = document.createElement('h3')
        title.textContent = product.name

        const price = document.createElement('span')
        price.className = 'product__price'
        price.textContent = product.price ? formatPrice(product.price) : 'Цена по запросу'

        link.append(media, title, price)
        article.append(link)
        return article
      }),
    )

    if (!reduceMotion) {
      grid.querySelectorAll('.product').forEach((el) => {
        el.classList.add('reveal')
        revealObserver?.observe(el)
      })
    }
  } catch (error) {
    grid.innerHTML =
      '<p class="catalog-error">Не удалось загрузить каталог. Откройте <a href="https://vk.ru/market-77839484" target="_blank" rel="noopener noreferrer">магазин ВКонтакте</a>.</p>'
    console.error(error)
  }
}

let revealObserver = null

if (!reduceMotion) {
  const targets = document.querySelectorAll(
    '.section__head, .service, .feature__copy, .feature__figure, .works-grid figure, .review, .contacts__panel, .contacts__visual',
  )

  targets.forEach((el) => el.classList.add('reveal'))

  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-visible')
        revealObserver.unobserve(entry.target)
      }
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
  )

  targets.forEach((el) => revealObserver.observe(el))
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

renderCatalog()
