const year = document.querySelector('#year')
if (year) year.textContent = String(new Date().getFullYear())

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const CATALOG_PREVIEW = 8

const formatPrice = (value) =>
  `${new Intl.NumberFormat('ru-RU').format(value)}\u00a0₽`

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .trim()

let allProducts = []
let filteredProducts = []
let catalogExpanded = false
let revealObserver = null

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

const updateToggle = () => {
  const toggle = document.querySelector('#catalog-toggle')
  if (!toggle) return

  const needsToggle = filteredProducts.length > CATALOG_PREVIEW
  toggle.hidden = !needsToggle
  toggle.setAttribute('aria-expanded', String(catalogExpanded))

  if (!needsToggle) return

  toggle.textContent = catalogExpanded
    ? 'Свернуть'
    : `Показать все · ${filteredProducts.length}`
}

const paintCatalog = () => {
  const grid = document.querySelector('#catalog-grid')
  const countEl = document.querySelector('#catalog-count')
  const emptyEl = document.querySelector('#catalog-empty')
  if (!grid) return

  const visible =
    catalogExpanded || filteredProducts.length <= CATALOG_PREVIEW
      ? filteredProducts
      : filteredProducts.slice(0, CATALOG_PREVIEW)

  if (countEl) {
    if (filteredProducts.length === allProducts.length) {
      countEl.textContent = catalogExpanded
        ? String(allProducts.length)
        : `${Math.min(CATALOG_PREVIEW, allProducts.length)} из ${allProducts.length}`
    } else {
      countEl.textContent = `${filteredProducts.length} из ${allProducts.length}`
    }
  }

  if (emptyEl) emptyEl.hidden = filteredProducts.length > 0

  grid.replaceChildren(...visible.map(createProductCard))
  updateToggle()

  if (!reduceMotion && revealObserver) {
    grid.querySelectorAll('.product').forEach((el) => {
      el.classList.add('reveal', 'is-visible')
    })
  }
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

const applyFilter = (query, { resetExpand = false } = {}) => {
  filteredProducts = filterProducts(query)
  if (resetExpand) catalogExpanded = false
  // While searching, show all matches so results aren't hidden
  if (normalize(query)) catalogExpanded = true
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
    catalogExpanded = false
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
  const toggle = document.querySelector('#catalog-toggle')
  if (!form || !input) return

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    applyFilter(input.value, { resetExpand: true })
    input.focus()
  })

  input.addEventListener('input', () => {
    applyFilter(input.value, { resetExpand: true })
  })

  toggle?.addEventListener('click', () => {
    catalogExpanded = !catalogExpanded
    paintCatalog()
    if (!catalogExpanded) {
      document.querySelector('#catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
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
