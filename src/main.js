const year = document.querySelector('#year')
if (year) year.textContent = String(new Date().getFullYear())

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const PAGE_SIZE = 12

const formatPrice = (value) =>
  `${new Intl.NumberFormat('ru-RU').format(value)}\u00a0₽`

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .trim()

let allProducts = []
let filteredProducts = []
let currentPage = 1
let revealObserver = null

const pageCount = () => Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))

const createProductCard = (product) => {
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
}

const updatePager = () => {
  const pager = document.querySelector('#catalog-pager')
  const pagesEl = document.querySelector('#catalog-pages')
  const metaEl = document.querySelector('#catalog-pager-meta')
  const prevBtn = document.querySelector('#catalog-prev')
  const nextBtn = document.querySelector('#catalog-next')
  if (!pager || !pagesEl || !metaEl || !prevBtn || !nextBtn) return

  const total = filteredProducts.length
  const pages = pageCount()

  pager.hidden = total <= PAGE_SIZE
  prevBtn.disabled = currentPage <= 1
  nextBtn.disabled = currentPage >= pages

  const start = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const end = Math.min(currentPage * PAGE_SIZE, total)
  metaEl.textContent = total ? `${start}–${end} · ${total}` : ''

  pagesEl.replaceChildren(
    ...Array.from({ length: pages }, (_, index) => {
      const page = index + 1
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'catalog-pager__page'
      button.textContent = String(page)
      button.setAttribute('aria-label', `Страница ${page}`)
      if (page === currentPage) button.setAttribute('aria-current', 'page')
      button.addEventListener('click', () => goToPage(page))
      return button
    }),
  )
}

const paintCatalog = () => {
  const grid = document.querySelector('#catalog-grid')
  const countEl = document.querySelector('#catalog-count')
  const emptyEl = document.querySelector('#catalog-empty')
  if (!grid) return

  const pages = pageCount()
  currentPage = Math.min(Math.max(1, currentPage), pages)

  const start = (currentPage - 1) * PAGE_SIZE
  const visible = filteredProducts.slice(start, start + PAGE_SIZE)

  if (countEl) {
    countEl.textContent = String(filteredProducts.length)
  }

  if (emptyEl) emptyEl.hidden = filteredProducts.length > 0

  grid.replaceChildren(...visible.map(createProductCard))
  updatePager()

  if (!reduceMotion && revealObserver) {
    grid.querySelectorAll('.product').forEach((el) => {
      el.classList.add('reveal', 'is-visible')
    })
  }
}

const goToPage = (page) => {
  currentPage = page
  paintCatalog()
  document.querySelector('#catalog')?.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start',
  })
}

const filterProducts = (query) => {
  const q = normalize(query)
  if (!q) return allProducts
  const tokens = q.split(/\s+/).filter(Boolean)
  return allProducts.filter((product) => {
    const haystack = normalize(product.name)
    return tokens.every((token) => haystack.includes(token))
  })
}

const applyFilter = (query) => {
  filteredProducts = filterProducts(query)
  currentPage = 1
  paintCatalog()
}

const renderCatalog = async () => {
  const grid = document.querySelector('#catalog-grid')
  if (!grid) return

  try {
    const res = await fetch('./products.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    allProducts = await res.json()
    filteredProducts = allProducts
    currentPage = 1
    paintCatalog()
  } catch (error) {
    grid.innerHTML =
      '<p class="catalog-error">Не удалось загрузить каталог. Откройте <a href="https://vk.ru/market-77839484" target="_blank" rel="noopener noreferrer">магазин ВКонтакте</a>.</p>'
    console.error(error)
  }
}

const setupCatalogSearch = () => {
  const form = document.querySelector('#catalog-search')
  const input = document.querySelector('#catalog-query')
  const prevBtn = document.querySelector('#catalog-prev')
  const nextBtn = document.querySelector('#catalog-next')
  if (!form || !input) return

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    applyFilter(input.value)
    input.focus()
  })

  input.addEventListener('input', () => {
    applyFilter(input.value)
  })

  prevBtn?.addEventListener('click', () => {
    if (currentPage > 1) goToPage(currentPage - 1)
  })

  nextBtn?.addEventListener('click', () => {
    if (currentPage < pageCount()) goToPage(currentPage + 1)
  })

  document.querySelectorAll('[data-focus-search]').forEach((el) => {
    el.addEventListener('click', () => {
      window.setTimeout(() => {
        input.focus()
        input.select()
      }, 50)
    })
  })
}

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

setupCatalogSearch()
renderCatalog()
