/* ============ ShopSphere – application logic (vanilla JS) ============ */
(() => {
'use strict';

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');

/* ---------- Data ---------- */
const CATS = [
  { id: 'electronics', name: 'Electronics', icon: 'fa-microchip' },
  { id: 'fashion', name: 'Fashion', icon: 'fa-shirt' },
  { id: 'home', name: 'Home & Kitchen', icon: 'fa-couch' },
  { id: 'books', name: 'Books', icon: 'fa-book' },
  { id: 'beauty', name: 'Beauty', icon: 'fa-spray-can-sparkles' },
  { id: 'sports', name: 'Sports & Fitness', icon: 'fa-dumbbell' },
  { id: 'toys', name: 'Toys & Games', icon: 'fa-puzzle-piece' },
  { id: 'grocery', name: 'Grocery', icon: 'fa-basket-shopping' }
];
const catName = id => (CATS.find(c => c.id === id) || {}).name || '';

// id, name, category, price, mrp, rating, reviews, icon, description
const RAW = [
  [1,'Nova X5 5G Smartphone (8GB RAM, 128GB)','electronics',18999,24999,4.4,12840,'fa-mobile-screen','6.7" AMOLED 120Hz display, 50MP triple camera, 5000mAh battery with 67W fast charging and a flagship-grade 5G processor.'],
  [2,'AuraBeats Pro Wireless Noise-Cancelling Headphones','electronics',3299,5999,4.5,8921,'fa-headphones','Hybrid ANC, 40-hour battery, studio-tuned 40mm drivers, multipoint Bluetooth 5.3 and a foldable, ultra-comfy design.'],
  [3,'ZenBook Air 14" Laptop (16GB, 512GB SSD)','electronics',54990,72990,4.3,3210,'fa-laptop','Ultra-light 1.2 kg aluminium body, 14" 2.8K OLED display, 12th-gen processor and all-day battery for work and play.'],
  [4,'PixelSnap 24MP Mirrorless Camera with 18-55mm Lens','electronics',38990,46990,4.6,1876,'fa-camera','24.2MP APS-C sensor, 4K video, fast hybrid autofocus, built-in Wi-Fi and a tilting touchscreen for creators.'],
  [5,'PulseFit Smartwatch with AMOLED Display & GPS','electronics',2499,6999,4.1,15432,'fa-stopwatch','1.43" AMOLED, built-in GPS, SpO2 and heart-rate tracking, 100+ sports modes, 10-day battery and 5ATM water resistance.'],
  [6,'BoomBox Mini Portable Bluetooth Speaker','electronics',1299,2999,4.2,9871,'fa-volume-high','360° room-filling sound, deep bass radiator, IPX7 waterproof, 20-hour playtime and a shock-resistant rugged build.'],
  [7,"Men's Classic Fit Cotton Formal Shirt",'fashion',799,1999,4.0,6540,'fa-shirt','Breathable 100% premium cotton, wrinkle-resistant finish, tailored classic fit — perfect from boardroom to brunch.'],
  [8,'UrbanRunner Lightweight Running Sneakers','fashion',1899,3499,4.3,11230,'fa-shoe-prints','Breathable knit upper, responsive cushioning and a grippy rubber outsole built for daily runs and street style.'],
  [9,"Women's Genuine Leather Tote Bag",'fashion',1499,2999,4.4,4320,'fa-bag-shopping','Spacious handcrafted tote with laptop sleeve, magnetic closure and durable gold-tone hardware.'],
  [10,'AeroShade Polarized UV400 Sunglasses','fashion',699,1599,4.2,7650,'fa-glasses','Polarized lenses with 100% UV400 protection, lightweight flexible frame and scratch-resistant coating.'],
  [11,'TurboBlend 600W Mixer Grinder with 3 Jars','home',2199,3999,4.3,18760,'fa-blender','Powerful copper motor, stainless-steel blades, 3 leak-proof jars and overload protection for everyday Indian cooking.'],
  [12,'BrewMaster Automatic Drip Coffee Maker','home',3499,5499,4.4,2987,'fa-mug-hot','12-cup glass carafe, programmable timer, reusable filter and keep-warm plate for café-quality coffee at home.'],
  [13,'CloudComfort 3-Seater Fabric Sofa','home',18999,29999,4.1,1243,'fa-couch','Solid-wood frame, high-density foam cushions and stain-resistant upholstery. Easy assembly, 3-year warranty.'],
  [14,'DreamyRest Orthopedic Memory Foam Mattress (Queen)','home',8999,14999,4.5,5432,'fa-bed','7-inch dual-layer memory foam with cooling gel and orthopedic support. 10-year warranty, 100-night trial.'],
  [15,'The Art of Deep Focus – Bestselling Paperback','books',349,499,4.6,21980,'fa-book','A practical guide to reclaiming your attention in a distracted world, with science-backed routines you can start today.'],
  [16,'Code Like a Pro: The Complete JavaScript Guide','books',599,899,4.7,9870,'fa-book-open','From fundamentals to async patterns and modern tooling — project-based chapters to turn you into a confident developer.'],
  [17,'Mindful Mornings – 90-Day Gratitude Journal','books',249,399,4.4,7650,'fa-book-bookmark','Lay-flat premium paper, guided daily prompts and weekly reflections to build a calmer, happier routine.'],
  [18,'GlowUp 15% Vitamin C Face Serum (30ml)','beauty',449,899,4.3,14320,'fa-spray-can-sparkles','Brightening serum with hyaluronic acid and vitamin E that fades dark spots and gives skin a healthy glow.'],
  [19,'SilkTouch Daily Moisturizing Cream (200g)','beauty',299,599,4.2,10987,'fa-pump-soap','Non-greasy, 48-hour hydration with shea butter and aloe. Dermatologically tested, suitable for all skin types.'],
  [20,'Velvet Matte Lipstick – Set of 6 Shades','beauty',599,1299,4.1,6543,'fa-palette','Long-wear creamy matte formula in six trending shades. Smudge-proof, enriched with vitamin E.'],
  [21,'FlexPro Adjustable Dumbbell Set (2 x 12 kg)','sports',2999,4999,4.4,3876,'fa-dumbbell','Quick-adjust plates, anti-slip chrome handles and a sturdy tray — a whole home gym in one compact set.'],
  [22,'StrikeForce Match Football – Size 5','sports',699,1199,4.2,5120,'fa-futbol','Thermo-bonded, water-resistant PU cover with a butyl bladder for superior air retention and true flight.'],
  [23,'TrailX 21-Speed Mountain Bicycle 26"','sports',12999,18999,4.3,2310,'fa-bicycle','Lightweight alloy frame, front suspension, dual disc brakes and a 21-speed drivetrain for trails and city.'],
  [24,'ZenFlow Extra-Thick Anti-Skid Yoga Mat','sports',599,1499,4.5,16540,'fa-spa','8mm eco-friendly NBR foam, double-sided anti-skid texture, carry strap included. Perfect for yoga and pilates.'],
  [25,'BrickMaster 500-Piece Creative Building Set','toys',999,1999,4.6,8760,'fa-puzzle-piece','Compatible, non-toxic bricks with idea booklet. Builds imagination, motor skills and hours of screen-free fun.'],
  [26,'RoboBuddy Remote Control Stunt Robot','toys',1599,2999,4.2,4321,'fa-robot','Voice-reactive robot that dances, walks and flips. Rechargeable battery with LED eyes — ages 6+.'],
  [27,'Himalayan Premium Mixed Nuts (1 kg)','grocery',799,1199,4.4,13210,'fa-cookie-bite','Fresh almonds, cashews, walnuts and pistachios in a resealable pack. No added salt or preservatives.'],
  [28,'Organic Green Tea – 100 Tea Bags','grocery',399,599,4.5,19870,'fa-leaf','Antioxidant-rich whole-leaf green tea, individually wrapped to lock in freshness. Light, refreshing and clean.'],
  [29,'Cold-Pressed Extra Virgin Olive Oil (1 L)','grocery',649,899,4.3,6540,'fa-bottle-droplet','First cold-pressed, rich in polyphenols with a fruity aroma. Ideal for dressings, sautéing and dips.']
];
const BEST = new Set([1,2,5,8,11,16,17,24,25,28]);
const PRODUCTS = RAW.map(([id, name, cat, price, mrp, rating, reviews, icon, desc]) => ({
  id, name, cat, price, mrp, rating, reviews, icon, desc,
  disc: Math.round((1 - price / mrp) * 100), best: BEST.has(id)
}));
const byId = id => PRODUCTS.find(p => p.id === +id);
const hue = id => (id * 47) % 360;
const imgBg = p => `background:linear-gradient(135deg,hsl(${hue(p.id)} 75% 92%),hsl(${hue(p.id)} 65% 76%))`;
const imgFg = p => `color:hsl(${hue(p.id)} 55% 28%)`;

/* ---------- State ---------- */
let cart = store.get('ss_cart', []);          // [{id, qty}]
let wish = store.get('ss_wish', []);          // [id]
let users = store.get('ss_users', []);
let session = store.get('ss_session', null);  // {email, name}
let orders = store.get('ss_orders', []);
let pincode = store.get('ss_pin', '');
if (!users.find(u => u.email === 'demo@shopsphere.com')) {
  users.push({ name: 'Demo User', email: 'demo@shopsphere.com', password: 'demo123' });
  store.set('ss_users', users);
}
const saveCart = () => { store.set('ss_cart', cart); updateHeader(true); };
const saveWish = () => { store.set('ss_wish', wish); updateHeader(); };

/* ---------- UI helpers ---------- */
function toast(msg, type = 'ok') {
  const t = document.createElement('div');
  t.className = 'toast ' + (type === 'err' ? 'err' : '');
  t.innerHTML = `<i class="fa-solid ${type === 'err' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i><span>${esc(msg)}</span>`;
  $('#toasts').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2600);
}
function stars(r) {
  let h = '';
  for (let i = 1; i <= 5; i++) h += `<i class="${r >= i ? 'fa-solid fa-star' : r >= i - .5 ? 'fa-solid fa-star-half-stroke' : 'fa-regular fa-star'}"></i>`;
  return `<span class="stars" aria-label="${r} out of 5">${h}</span>`;
}
const priceHTML = p => `<div class="price-row"><span class="price"><sup>₹</sup>${p.price.toLocaleString('en-IN')}</span><span class="mrp">${inr(p.mrp)}</span><span class="off">${p.disc}% off</span></div>`;
function deliveryText() {
  const d = new Date(); d.setDate(d.getDate() + 3);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}
function card(p) {
  const on = wish.includes(p.id);
  return `<article class="card">
    <a class="pimg" href="#/product/${p.id}" style="${imgBg(p)}" aria-label="${esc(p.name)}"><i class="fa-solid ${p.icon}" style="${imgFg(p)}"></i>
      ${p.disc >= 20 ? `<span class="tag">-${p.disc}%</span>` : ''}${p.best ? '<span class="tag best">Best Seller</span>' : ''}</a>
    <button class="wbtn ${on ? 'on' : ''}" data-act="wish" data-id="${p.id}" aria-label="${on ? 'Remove from' : 'Add to'} wishlist"><i class="fa-${on ? 'solid' : 'regular'} fa-heart"></i></button>
    <h3><a href="#/product/${p.id}">${esc(p.name)}</a></h3>
    <div class="rating">${stars(p.rating)}<span class="n">${p.reviews.toLocaleString('en-IN')}</span></div>
    ${priceHTML(p)}
    <div class="delivery">FREE delivery <b>${deliveryText()}</b></div>
    <button class="btn btn-primary sm" data-act="add" data-id="${p.id}"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
  </article>`;
}
const section = (title, inner, link) => `<section class="section"><div class="section-head"><h2>${title}</h2>${link ? `<a href="${link[0]}">${link[1]} ›</a>` : ''}</div>${inner}</section>`;

/* ---------- Cart / wishlist logic ---------- */
function addToCart(id, qty = 1, silent) {
  id = +id;
  const it = cart.find(c => c.id === id);
  if (it) it.qty = Math.min(10, it.qty + qty); else cart.push({ id, qty: Math.min(10, qty) });
  saveCart();
  if (!silent) toast(`Added to cart: ${byId(id).name.slice(0, 38)}…`);
}
function toggleWish(id) {
  id = +id;
  if (wish.includes(id)) { wish = wish.filter(w => w !== id); toast('Removed from wishlist'); }
  else { wish.push(id); toast('Saved to your wishlist'); }
  saveWish();
}
function totals() {
  const lines = cart.map(c => ({ ...c, p: byId(c.id) })).filter(l => l.p);
  const items = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const mrpTotal = lines.reduce((s, l) => s + l.p.mrp * l.qty, 0);
  const delivery = subtotal === 0 || subtotal >= 499 ? 0 : 40;
  return { lines, items, subtotal, savings: mrpTotal - subtotal, delivery, total: subtotal + delivery };
}
function updateHeader(bump) {
  const n = totals().items;
  const cc = $('#cartCount'); cc.textContent = n;
  if (bump) { cc.classList.remove('bump'); void cc.offsetWidth; cc.classList.add('bump'); }
  $('#wishCount').textContent = wish.length;
  $('#locText').textContent = pincode || 'Select pincode';
  const first = session ? esc(session.name.split(' ')[0]) : '';
  $('#acctArea').innerHTML = session
    ? `<div class="acct"><a class="hbtn" href="#/orders" tabindex="0"><span><small>Hello, ${first}</small><b>Account & Lists <i class="fa-solid fa-caret-down"></i></b></span></a>
        <div class="dd"><a href="#/orders"><i class="fa-solid fa-box"></i> Your Orders</a><a href="#/wishlist"><i class="fa-regular fa-heart"></i> Your Wishlist</a><a href="#/cart"><i class="fa-solid fa-cart-shopping"></i> Your Cart</a><hr><button data-act="logout"><i class="fa-solid fa-right-from-bracket"></i> Sign out</button></div></div>`
    : `<a class="hbtn" href="#/login"><span><small>Hello, sign in</small><b>Account & Lists <i class="fa-solid fa-caret-down"></i></b></span></a>`;
  $('#drawerUser').textContent = session ? 'Hello, ' + session.name.split(' ')[0] : 'Hello, sign in';
}

/* ---------- Views ---------- */
let heroTimer = null;
const views = {};

/* Home */
views.home = () => {
  const best = PRODUCTS.filter(p => p.best);
  const deals = [...PRODUCTS].sort((a, b) => b.disc - a.disc).slice(0, 8);
  const rec = PRODUCTS.filter(p => !p.best).slice().sort((a, b) => b.rating - a.rating).slice(0, 12);
  const slides = [
    ['Mega Electronics Sale', 'Up to <em>60% off</em> on top tech', 'Phones, laptops, headphones & more — with free delivery and easy returns.', '#/search?cat=electronics', 'fa-headphones-simple', 'linear-gradient(120deg,#1b2a4e,#3b2f8f 60%,#6a4cff)'],
    ['New Season Fashion', 'Style that <em>speaks</em> for you', 'Fresh arrivals in shirts, sneakers, bags and eyewear starting at just ₹699.', '#/search?cat=fashion', 'fa-bag-shopping', 'linear-gradient(120deg,#7a1f3d,#c2410c 65%,#f59e0b)'],
    ['Home & Kitchen Fest', 'Upgrade your <em>everyday</em> living', 'Smart appliances, comfy furniture and sleep essentials at unbeatable prices.', '#/search?cat=home', 'fa-couch', 'linear-gradient(120deg,#0b4f4a,#0f7b6c 60%,#34c38f)']
  ];
  return `
  <div class="hero" id="hero">
    <div class="slides" id="slides">${slides.map(s => `
      <div class="slide" style="background:${s[5]}"><div class="copy"><span class="eyebrow">${s[0]}</span><h1>${s[1]}</h1><p>${s[2]}</p><a class="btn btn-primary" href="${s[3]}">Shop now <i class="fa-solid fa-arrow-right"></i></a></div><i class="fa-solid ${s[4]} art"></i></div>`).join('')}
    </div>
    <div class="hero-nav"><button data-act="slide-prev" aria-label="Previous slide"><i class="fa-solid fa-chevron-left"></i></button><button data-act="slide-next" aria-label="Next slide"><i class="fa-solid fa-chevron-right"></i></button></div>
    <div class="dots" id="dots">${slides.map((_, i) => `<button data-act="slide-go" data-id="${i}" aria-label="Slide ${i + 1}"></button>`).join('')}</div>
  </div>
  <div class="hero-pull">
    ${section('Shop by Category', `<div class="cat-grid">${CATS.map(c => `<a class="cat-tile" href="#/search?cat=${c.id}"><i class="fa-solid ${c.icon}"></i>${c.name}<small>${PRODUCTS.filter(p => p.cat === c.id).length} products</small></a>`).join('')}</div>`)}
    ${section('Best Sellers', `<div class="row-scroll">${best.map(card).join('')}</div>`, ['#/search?sort=rating', 'See all'])}
    <div class="promo-row">
      <a class="promo p1" href="#/search?cat=electronics"><div><h3>Gadget Week</h3><p>Extra 10% off with demo UPI</p><span class="btn btn-primary sm">Explore</span></div><i class="fa-solid fa-microchip big"></i></a>
      <a class="promo p2" href="#/search?cat=grocery"><div><h3>Fresh &amp; Healthy</h3><p>Pantry staples from ₹399</p><span class="btn btn-primary sm">Stock up</span></div><i class="fa-solid fa-leaf big"></i></a>
      <a class="promo p3" href="#/search?cat=sports"><div><h3>Get Fit Fest</h3><p>Fitness gear up to 50% off</p><span class="btn btn-primary sm">Shop gear</span></div><i class="fa-solid fa-dumbbell big"></i></a>
    </div>
    ${section("Today's Deals", `<div class="grid">${deals.map(card).join('')}</div>`, ['#/search?deals=1', 'See all deals'])}
    ${section('Recommended for You', `<div class="grid">${rec.map(card).join('')}</div>`, ['#/search', 'Browse all products'])}
    <div class="trust">
      <div><i class="fa-solid fa-truck-fast"></i><p><b>Free Delivery</b><span>On orders above ₹499</span></p></div>
      <div><i class="fa-solid fa-rotate-left"></i><p><b>Easy Returns</b><span>10-day replacement</span></p></div>
      <div><i class="fa-solid fa-shield-halved"></i><p><b>Secure Payments</b><span>100% protected (demo)</span></p></div>
      <div><i class="fa-solid fa-headset"></i><p><b>24×7 Support</b><span>We're always here</span></p></div>
    </div>
  </div>`;
};
views.home.after = () => {
  const slides = $('#slides'); if (!slides) return;
  let i = 0; const n = slides.children.length;
  const go = k => { i = (k + n) % n; slides.style.transform = `translateX(-${i * 100}%)`; $$('#dots button').forEach((d, x) => d.classList.toggle('on', x === i)); };
  window.__slide = go; window.__slideIdx = () => i;
  go(0);
  heroTimer = setInterval(() => go(i + 1), 5000);
  $('#hero').addEventListener('mouseenter', () => clearInterval(heroTimer));
  $('#hero').addEventListener('mouseleave', () => { clearInterval(heroTimer); heroTimer = setInterval(() => go(i + 1), 5000); });
};

/* Search / listing */
views.search = (parts, q) => {
  const term = (q.get('q') || '').trim(), cat = q.get('cat') || '', sort = q.get('sort') || 'relevance';
  const minR = +(q.get('rating') || 0), deals = q.get('deals') === '1', maxP = +(q.get('max') || 0);
  const words = term.toLowerCase().split(/\s+/).filter(Boolean);
  let list = PRODUCTS.filter(p => {
    if (cat && p.cat !== cat) return false;
    if (deals && p.disc < 30) return false;
    if (p.rating < minR) return false;
    if (maxP && p.price > maxP) return false;
    const hay = (p.name + ' ' + catName(p.cat) + ' ' + p.desc).toLowerCase();
    return words.every(w => hay.includes(w));
  });
  const sorters = {
    'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews, discount: (a, b) => b.disc - a.disc,
    reviews: (a, b) => b.reviews - a.reviews
  };
  if (sorters[sort]) list.sort(sorters[sort]);
  const mk = (over) => { const p = new URLSearchParams({ q: term, cat, sort, rating: minR || '', max: maxP || '', deals: deals ? 1 : '' }); Object.entries(over).forEach(([k, v]) => p.set(k, v)); [...p.keys()].forEach(k => { if (!p.get(k) || (k === 'sort' && p.get(k) === 'relevance')) p.delete(k); }); return '#/search?' + p; };
  const title = deals ? "Today's Deals" : cat ? catName(cat) : term ? `Results for “${esc(term)}”` : 'All Products';
  const chips = [term && `“${esc(term)}” <a href="${mk({ q: '' })}" aria-label="clear">✕</a>`, cat && `${catName(cat)} <a href="${mk({ cat: '' })}" aria-label="clear">✕</a>`, minR && `${minR}★ & up <a href="${mk({ rating: '' })}" aria-label="clear">✕</a>`, maxP && `Under ${inr(maxP)} <a href="${mk({ max: '' })}" aria-label="clear">✕</a>`].filter(Boolean);
  return `<div class="search-layout">
    <aside class="filters" aria-label="Filters">
      <h4>Category</h4>
      <a href="${mk({ cat: '' })}" class="${!cat ? 'on' : ''}">All categories</a>
      ${CATS.map(c => `<a href="${mk({ cat: c.id })}" class="${cat === c.id ? 'on' : ''}"><i class="fa-solid ${c.icon}" style="width:18px;color:var(--navy3)"></i>${c.name}</a>`).join('')}
      <h4>Customer Rating</h4>
      ${[4, 3, 2].map(r => `<a href="${mk({ rating: minR === r ? '' : r })}" class="${minR === r ? 'on' : ''}">${stars(r)} &amp; up</a>`).join('')}
      <h4>Price</h4>
      ${[[500, 'Under ₹500'], [2000, 'Under ₹2,000'], [10000, 'Under ₹10,000'], [0, 'Any price']].map(([v, l]) => `<a href="${mk({ max: v })}" class="${maxP === v ? 'on' : ''}">${l}</a>`).join('')}
      <h4>Offers</h4>
      <a href="${mk({ deals: deals ? '' : 1 })}" class="${deals ? 'on' : ''}"><i class="fa-solid fa-tags"></i> 30%+ off deals</a>
    </aside>
    <section>
      <div class="results-bar">
        <div><b>${list.length}</b> result${list.length === 1 ? '' : 's'} · <b>${title}</b>
          ${chips.length ? `<div class="chips">${chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>` : ''}</div>
        <label>Sort by:
          <select id="sortSel" aria-label="Sort products">
            ${[['relevance', 'Featured'], ['price-asc', 'Price: Low to High'], ['price-desc', 'Price: High to Low'], ['rating', 'Avg. Customer Rating'], ['discount', 'Biggest Discount'], ['reviews', 'Most Reviewed']].map(([v, l]) => `<option value="${v}" ${sort === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select></label>
      </div>
      ${list.length ? `<div class="grid">${list.map(card).join('')}</div>`
        : `<div class="empty"><i class="fa-solid fa-magnifying-glass"></i><h2>No results found</h2><p>Try a different keyword or clear some filters.</p><a class="btn btn-primary" href="#/search">Clear all filters</a></div>`}
    </section></div>`;
};
views.search.after = (parts, q) => {
  $('#sortSel')?.addEventListener('change', e => {
    const p = new URLSearchParams(location.hash.split('?')[1] || '');
    p.set('sort', e.target.value); location.hash = '#/search?' + p;
  });
};

/* Product detail */
views.product = ([, id]) => {
  const p = byId(id); if (!p) return views.notfound();
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 6);
  const on = wish.includes(p.id);
  const names = ['Aarav S.', 'Priya M.', 'Rohan K.', 'Sneha P.', 'Vikram T.'];
  const texts = ['Absolutely worth the price. Arrived early and packaging was great.', 'Quality is better than I expected. Highly recommended for everyone.', 'Good product overall, does what it says. Would buy again.', 'Value for money! My family loves it.', 'Solid build and looks premium. Five stars from me.'];
  const feats = p.desc.split(/[,.]\s*/).filter(s => s.length > 8).slice(0, 4);
  return `<div class="crumbs"><a href="#/">Home</a> › <a href="#/search?cat=${p.cat}">${catName(p.cat)}</a> › ${esc(p.name.slice(0, 50))}</div>
  <div class="pd">
    <div class="pd-img" style="${imgBg(p)}"><i class="fa-solid ${p.icon}" style="${imgFg(p)}"></i></div>
    <div class="pd-info">
      <h1>${esc(p.name)}</h1>
      <div class="rating">${p.rating} ${stars(p.rating)}<span class="n">${p.reviews.toLocaleString('en-IN')} ratings</span></div>
      <hr>
      <div class="pd-price"><span class="off">-${p.disc}%</span><span class="price"><sup>₹</sup>${p.price.toLocaleString('en-IN')}</span></div>
      <div class="mrp">M.R.P.: ${inr(p.mrp)} · You save ${inr(p.mrp - p.price)}</div>
      <p class="muted" style="font-size:.8rem">Inclusive of all taxes</p>
      <hr>
      <h3 style="font-size:1rem;margin-bottom:6px">About this item</h3>
      <p>${esc(p.desc)}</p>
      <ul class="feat">${feats.map(f => `<li>${esc(f)}</li>`).join('')}<li>Category: ${catName(p.cat)}</li></ul>
    </div>
    <aside class="buybox">
      <div class="price"><sup style="font-size:.6em">₹</sup>${p.price.toLocaleString('en-IN')}</div>
      <p style="font-size:.88rem;margin-top:6px">FREE delivery <b>${deliveryText()}</b></p>
      <div class="stock">In stock</div>
      <label style="font-size:.88rem;font-weight:600">Quantity:&nbsp;</label>
      <div class="qty"><button data-act="pq-" aria-label="Decrease">−</button><input id="pqty" type="number" min="1" max="10" value="1" aria-label="Quantity"><button data-act="pq+" aria-label="Increase">+</button></div>
      <button class="btn btn-primary block" data-act="addq" data-id="${p.id}"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
      <button class="btn btn-buy block" data-act="buy" data-id="${p.id}"><i class="fa-solid fa-bolt"></i> Buy Now</button>
      <button class="btn btn-ghost block" data-act="wish" data-id="${p.id}"><i class="fa-${on ? 'solid' : 'regular'} fa-heart" style="${on ? 'color:var(--red)' : ''}"></i> ${on ? 'In your wishlist' : 'Add to Wishlist'}</button>
      <div class="secure"><span><i class="fa-solid fa-lock"></i> Secure transaction</span><span><i class="fa-solid fa-rotate-left"></i> 10-day returnable</span><span><i class="fa-solid fa-truck"></i> Ships from ShopSphere Fulfilment</span></div>
    </aside>
  </div>
  ${section('Customer Reviews', `<div class="reviews">${names.map((n, i) => `<div class="review"><div class="who"><span class="av">${n[0]}</span>${n}</div>${stars(Math.max(3, Math.min(5, Math.round(p.rating + (i % 2 ? -.5 : .4)))))} <b>${['Great purchase!', 'Really good', 'Satisfied', 'Love it', 'Excellent'][i]}</b><p>${texts[(i + p.id) % 5]}</p></div>`).join('')}</div>`)}
  ${section('Customers also viewed', `<div class="row-scroll">${related.map(card).join('')}</div>`)}`;
};

/* Cart */
views.cart = () => {
  const t = totals();
  if (!t.lines.length) return `<div class="page"><div class="empty"><i class="fa-solid fa-cart-shopping"></i><h2>Your ShopSphere Cart is empty</h2><p>Browse today's deals and add something you love.</p><a class="btn btn-primary" href="#/search?deals=1">Shop today's deals</a></div></div>`;
  const left = Math.max(0, 499 - t.subtotal);
  return `<div class="cart-layout">
    <div class="panel"><h1>Shopping Cart</h1><div class="sub">Price</div>
      ${t.lines.map(l => `<div class="cart-item">
        <a class="pimg" href="#/product/${l.p.id}" style="${imgBg(l.p)}"><i class="fa-solid ${l.p.icon}" style="${imgFg(l.p)}"></i></a>
        <div><h3><a href="#/product/${l.p.id}">${esc(l.p.name)}</a></h3>
          <div class="stock" style="font-size:.85rem;margin:2px 0">In stock</div>
          <div class="muted" style="font-size:.8rem">Eligible for FREE delivery · ${catName(l.p.cat)}</div>
          <div class="ci-actions">
            <div class="qty"><button data-act="dec" data-id="${l.p.id}" aria-label="Decrease quantity">${l.qty === 1 ? '<i class="fa-regular fa-trash-can" style="font-size:.8rem"></i>' : '−'}</button><input value="${l.qty}" readonly aria-label="Quantity"><button data-act="inc" data-id="${l.p.id}" aria-label="Increase quantity">+</button></div>
            <span class="sep"></span><button class="link-btn" data-act="remove" data-id="${l.p.id}">Delete</button>
            <span class="sep"></span><button class="link-btn" data-act="towish" data-id="${l.p.id}">Save for later</button>
          </div></div>
        <div class="ci-price">${inr(l.p.price * l.qty)}<div class="mrp" style="font-weight:400">${inr(l.p.mrp * l.qty)}</div></div></div>`).join('')}
      <div style="text-align:right;padding-top:14px;font-size:1.1rem">Subtotal (${t.items} item${t.items > 1 ? 's' : ''}): <b>${inr(t.subtotal)}</b></div>
      <button class="link-btn" style="margin-top:8px" data-act="clearcart">Clear cart</button>
    </div>
    <aside class="panel summary">
      ${left > 0 ? `<p style="font-size:.85rem">Add <b>${inr(left)}</b> more for <b style="color:var(--green)">FREE delivery</b></p><div class="ship-bar"><span style="width:${Math.min(100, t.subtotal / 499 * 100)}%"></span></div>`
        : `<p style="font-size:.88rem;color:var(--green)"><i class="fa-solid fa-circle-check"></i> Your order qualifies for FREE delivery</p>`}
      <div class="sum-line"><span>Items (${t.items})</span><span>${inr(t.subtotal)}</span></div>
      <div class="sum-line"><span>Delivery</span><span class="${t.delivery ? '' : 'free'}">${t.delivery ? inr(t.delivery) : 'FREE'}</span></div>
      <div class="sum-line total"><span>Order Total</span><span>${inr(t.total)}</span></div>
      <div class="save-note"><i class="fa-solid fa-piggy-bank"></i> You're saving ${inr(t.savings)} on this order</div>
      <a class="btn btn-primary block" href="#/checkout">Proceed to Buy</a>
    </aside></div>`;
};

/* Wishlist */
views.wishlist = () => {
  const items = wish.map(byId).filter(Boolean);
  if (!items.length) return `<div class="page"><div class="empty"><i class="fa-regular fa-heart"></i><h2>Your wishlist is empty</h2><p>Tap the heart on any product to save it here.</p><a class="btn btn-primary" href="#/search">Discover products</a></div></div>`;
  return `<div class="page"><div class="panel"><div class="section-head"><h1>Your Wishlist <small class="muted" style="font-size:.9rem">(${items.length})</small></h1></div>
    <div class="grid">${items.map(p => `<article class="card">
      <a class="pimg" href="#/product/${p.id}" style="${imgBg(p)}"><i class="fa-solid ${p.icon}" style="${imgFg(p)}"></i>${p.disc >= 20 ? `<span class="tag">-${p.disc}%</span>` : ''}</a>
      <h3><a href="#/product/${p.id}">${esc(p.name)}</a></h3>
      <div class="rating">${stars(p.rating)}<span class="n">${p.reviews.toLocaleString('en-IN')}</span></div>${priceHTML(p)}
      <button class="btn btn-primary sm" data-act="tocart" data-id="${p.id}"><i class="fa-solid fa-cart-plus"></i> Move to Cart</button>
      <button class="btn btn-ghost sm" style="margin-top:8px" data-act="unwish" data-id="${p.id}"><i class="fa-regular fa-trash-can"></i> Remove</button>
    </article>`).join('')}</div></div></div>`;
};

/* Auth */
const pwField = (id, label, ph = '') => `<div class="field"><label for="${id}">${label}</label><div class="pw"><input id="${id}" name="${id}" type="password" placeholder="${ph}" autocomplete="${id === 'password' ? 'current-password' : 'new-password'}"><button type="button" data-act="pwtoggle" aria-label="Show or hide password"><i class="fa-regular fa-eye"></i></button></div><div class="msg"></div></div>`;
const authLogo = '<a href="#/" class="logo"><span class="logo-orb"><i class="fa-solid fa-bag-shopping"></i></span>shop<b>sphere</b></a>';
views.login = (p, q) => `<div class="auth-wrap"><div class="auth-card">${authLogo}<h1>Sign in</h1>
  <div id="formAlert"></div>
  <div class="demo-box"><b>Demo account:</b> demo@shopsphere.com / demo123 <button class="link-btn" type="button" data-act="fill-demo">Autofill</button></div>
  <form data-form="login" novalidate>
    <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com"><div class="msg"></div></div>
    ${pwField('password', 'Password', 'At least 6 characters')}
    <button class="btn btn-primary block" type="submit">Sign in</button>
  </form>
  <p class="form-note">By continuing, you agree to ShopSphere's demo Conditions of Use. Data is stored only in your browser.</p>
  <div class="divider">New to ShopSphere?</div>
  <a class="btn btn-ghost block" href="#/signup${q.get('next') ? '?next=' + encodeURIComponent(q.get('next')) : ''}">Create your ShopSphere account</a></div></div>`;
views.signup = (p, q) => `<div class="auth-wrap"><div class="auth-card">${authLogo}<h1>Create account</h1>
  <div id="formAlert"></div>
  <form data-form="signup" novalidate>
    <div class="field"><label for="name">Your name</label><input id="name" name="name" autocomplete="name" placeholder="First and last name"><div class="msg"></div></div>
    <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com"><div class="msg"></div></div>
    ${pwField('password', 'Password', 'At least 6 characters, with a number')}
    <div class="strength" aria-hidden="true"><span id="pwBar"></span></div>
    ${pwField('confirm', 'Re-enter password')}
    <button class="btn btn-primary block" type="submit">Create your account</button>
  </form>
  <div class="divider">Already a customer?</div>
  <a class="btn btn-ghost block" href="#/login${q.get('next') ? '?next=' + encodeURIComponent(q.get('next')) : ''}">Sign in</a></div></div>`;

/* Checkout */
views.checkout = () => {
  const t = totals();
  if (!t.lines.length) { location.hash = '#/cart'; return ''; }
  if (!session) { toast('Please sign in to continue to checkout', 'err'); location.hash = '#/login?next=' + encodeURIComponent('#/checkout'); return ''; }
  const saved = store.get('ss_addr', {});
  const v = k => esc(saved[k] || (k === 'name' ? session.name : k === 'pin' ? pincode : ''));
  const fld = (id, label, ph, cls = '', type = 'text') => `<div class="field ${cls}"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" placeholder="${ph}" value="${v(id)}"><div class="msg"></div></div>`;
  return `<div class="co-layout"><form data-form="checkout" novalidate>
    <div class="panel" style="margin-bottom:16px"><h2><span class="num">1</span> Delivery address</h2>
      <div class="form-grid">
        ${fld('name', 'Full name', 'Full name', 'full')}
        ${fld('phone', 'Mobile number', '10-digit mobile number', '', 'tel')}
        ${fld('pin', 'Pincode', '6-digit pincode')}
        ${fld('address', 'Flat / House no., Street, Area', 'Address', 'full')}
        ${fld('city', 'Town / City', 'City')}
        <div class="field"><label for="state">State</label><select id="state" name="state"><option value="">Select state</option>${['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'].map(s => `<option ${saved.state === s ? 'selected' : ''}>${s}</option>`).join('')}</select><div class="msg"></div></div>
      </div></div>
    <div class="panel"><h2><span class="num">2</span> Payment method</h2>
      <label class="pay-opt on" data-pay><input type="radio" name="pay" value="cod" checked><i class="fa-solid fa-money-bill-wave ic"></i><span><b>Cash on Delivery</b><small>Pay with cash or card when your order arrives.</small></span></label>
      <label class="pay-opt" data-pay><input type="radio" name="pay" value="upi"><i class="fa-solid fa-mobile-screen-button ic"></i><span style="flex:1"><b>Demo UPI</b><small>Simulated payment – no real money is charged.</small>
        <div class="upi-field field"><label for="upi">UPI ID</label><input id="upi" name="upi" placeholder="name@bank"><div class="msg"></div></div></span></label>
    </div>
  </form>
  <aside class="panel summary"><h2 style="font-size:1.1rem;margin-bottom:10px">Order Summary</h2>
    ${t.lines.map(l => `<div class="mini-item"><div class="pimg" style="${imgBg(l.p)}"><i class="fa-solid ${l.p.icon}" style="${imgFg(l.p)}"></i></div><span>${esc(l.p.name)} × ${l.qty}</span><b>${inr(l.p.price * l.qty)}</b></div>`).join('')}
    <div class="sum-line" style="margin-top:8px"><span>Items</span><span>${inr(t.subtotal)}</span></div>
    <div class="sum-line"><span>Delivery</span><span class="${t.delivery ? '' : 'free'}">${t.delivery ? inr(t.delivery) : 'FREE'}</span></div>
    <div class="sum-line total"><span>Order Total</span><span>${inr(t.total)}</span></div>
    <button class="btn btn-primary block" style="margin-top:12px" data-act="place"><i class="fa-solid fa-lock"></i> Place your order</button>
    <p class="form-note">By placing your order, you agree to ShopSphere's demo terms. No real payment is taken.</p>
  </aside></div>`;
};

views.confirm = ([, id]) => {
  const o = orders.find(x => x.id === id);
  if (!o) return views.notfound();
  return `<div class="panel confirm"><div class="tick"><i class="fa-solid fa-check"></i></div>
    <h1>Order placed, thank you!</h1><p class="muted">Confirmation sent to ${esc(o.email)}. Your items will arrive by <b>${esc(o.eta)}</b>.</p>
    <div class="order-meta"><span><b>Order ID:</b> ${o.id}</span><span><b>Total:</b> ${inr(o.total)}</span><span><b>Payment:</b> ${o.pay === 'cod' ? 'Cash on Delivery' : 'Demo UPI (' + esc(o.upi) + ')'}</span><span><b>Ship to:</b> ${esc(o.addr.name)}, ${esc(o.addr.address)}, ${esc(o.addr.city)} – ${esc(o.addr.pin)}</span></div>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn btn-primary" href="#/orders">View your orders</a><a class="btn btn-ghost" href="#/">Continue shopping</a></div></div>`;
};

views.orders = () => {
  if (!session) { location.hash = '#/login?next=' + encodeURIComponent('#/orders'); return ''; }
  const mine = orders.filter(o => o.email === session.email);
  if (!mine.length) return `<div class="page"><div class="empty"><i class="fa-solid fa-box-open"></i><h2>No orders yet</h2><p>When you place an order, it will show up here.</p><a class="btn btn-primary" href="#/">Start shopping</a></div></div>`;
  return `<div class="page"><div class="panel"><h1 style="margin-bottom:16px">Your Orders</h1>${mine.map(o => `<div class="order-card"><header>
    <div>ORDER PLACED<b>${new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</b></div><div>TOTAL<b>${inr(o.total)}</b></div><div>SHIP TO<b>${esc(o.addr.name)}</b></div><div>ORDER # <b>${o.id}</b></div></header>
    <div class="body"><span class="badge">Confirmed · arriving ${esc(o.eta)}</span>${o.items.map(i => { const p = byId(i.id) || {}; return `<div class="mini-item"><div class="pimg" style="${p.id ? imgBg(p) : ''}"><i class="fa-solid ${p.icon || 'fa-box'}" style="${p.id ? imgFg(p) : ''}"></i></div><span><a href="#/product/${i.id}">${esc(i.name)}</a> × ${i.qty}</span><b>${inr(i.price * i.qty)}</b></div>`; }).join('')}</div></div>`).join('')}</div></div>`;
};

views.about = () => `<div class="page"><div class="panel prose"><h1>About ShopSphere</h1>
  <p>ShopSphere is an Amazon-inspired demo e-commerce experience designed to showcase modern front-end craft: fast, accessible and delightful shopping built entirely with HTML5, CSS3 and vanilla JavaScript.</p>
  <div class="stats"><div><b>29+</b>Products</div><div><b>8</b>Categories</div><div><b>0</b>Frameworks</div><div><b>100%</b>Vanilla JS</div></div>
  <h2>Our mission</h2><p>To make online shopping simple, transparent and joyful — from discovering a product to the moment it reaches your door.</p>
  <h2>Why shoppers love us</h2><p>Curated products, honest pricing with clear discounts, a smooth checkout and a wishlist that remembers what you love. Everything you do here — cart, wishlist, account and orders — is saved locally in your browser.</p>
  <h2>Disclaimer</h2><p>ShopSphere is a portfolio/demo project. Products are fictional, payments are simulated and no personal data leaves your device.</p>
  <a class="btn btn-primary" href="#/contact">Contact us</a></div></div>`;
views.contact = () => `<div class="page"><div class="panel prose" style="max-width:1000px"><h1>Contact Us</h1><p>We're here to help. Send us a message and we'll reply within 24 hours.</p>
  <div class="contact-grid"><div class="contact-info">
    <p><i class="fa-solid fa-location-dot"></i><span><b>Head office</b><br>42 Sphere Tower, MG Road, Bengaluru 560001</span></p>
    <p><i class="fa-solid fa-phone"></i><span><b>Phone</b><br>1800-123-4567 (Mon–Sat, 9am–9pm)</span></p>
    <p><i class="fa-solid fa-envelope"></i><span><b>Email</b><br>support@shopsphere.demo</span></p>
    <p><i class="fa-solid fa-clock"></i><span><b>Support hours</b><br>24×7 chat support</span></p></div>
  <form data-form="contact" novalidate>
    <div class="field"><label for="cname">Name</label><input id="cname" name="cname"><div class="msg"></div></div>
    <div class="field"><label for="cemail">Email</label><input id="cemail" name="cemail" type="email"><div class="msg"></div></div>
    <div class="field"><label for="cmsg">Message</label><textarea id="cmsg" name="cmsg" rows="5"></textarea><div class="msg"></div></div>
    <button class="btn btn-primary" type="submit"><i class="fa-solid fa-paper-plane"></i> Send message</button>
  </form></div></div></div>`;
views.notfound = () => `<div class="page"><div class="empty"><i class="fa-solid fa-triangle-exclamation"></i><h2>Page not found</h2><p>The page you're looking for doesn't exist.</p><a class="btn btn-primary" href="#/">Go home</a></div></div>`;

/* ---------- Router ---------- */
let lastView = '';
function route(forceScroll) {
  clearInterval(heroTimer);
  const h = location.hash.slice(1) || '/';
  const [path, qs] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  const name = parts[0] || 'home';
  const q = new URLSearchParams(qs || '');
  const view = views[name] || views.notfound;
  const html = view(parts, q);
  if (html === '') return; // view redirected
  $('#app').innerHTML = html;
  if (view.after) view.after(parts, q);
  // sync header search box
  $('#searchInput').value = name === 'search' ? (q.get('q') || '') : '';
  $('#searchCat').value = name === 'search' ? (q.get('cat') || '') : '';
  if (forceScroll !== false && !(name === 'search' && lastView === 'search')) window.scrollTo({ top: 0 });
  lastView = name;
  document.body.classList.remove('drawer-open');
  document.title = ({ home: 'ShopSphere – Shop Everything You Love', cart: 'Shopping Cart | ShopSphere', search: 'Search | ShopSphere', wishlist: 'Wishlist | ShopSphere', login: 'Sign in | ShopSphere', signup: 'Create account | ShopSphere', checkout: 'Checkout | ShopSphere' })[name] || 'ShopSphere';
  if (name === 'product') { const p = byId(parts[1]); if (p) document.title = p.name + ' | ShopSphere'; }
}
const rerender = () => route(false);

/* ---------- Validation ---------- */
function setErr(form, name, msg) {
  const inp = form.elements[name]; if (!inp) return;
  const f = inp.closest('.field');
  f.classList.toggle('bad', !!msg);
  const m = $('.msg', f); if (m) m.textContent = msg || '';
}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function validate(form, rules) {
  let ok = true, first = null;
  Object.entries(rules).forEach(([name, fn]) => {
    const msg = fn(form.elements[name].value.trim(), form);
    setErr(form, name, msg);
    if (msg) { ok = false; first = first || form.elements[name]; }
  });
  if (first) first.focus();
  return ok;
}
const formAlert = (msg, type = 'err') => { const a = $('#formAlert'); if (a) a.innerHTML = msg ? `<div class="alert ${type}">${esc(msg)}</div>` : ''; };
const nextHash = () => new URLSearchParams((location.hash.split('?')[1]) || '').get('next') || '#/';

const forms = {
  login(form) {
    const ok = validate(form, {
      email: v => !v ? 'Enter your email' : !EMAIL.test(v) ? 'Enter a valid email address' : '',
      password: v => !v ? 'Enter your password' : v.length < 6 ? 'Password must be at least 6 characters' : ''
    });
    if (!ok) return;
    const email = form.email.value.trim().toLowerCase();
    const u = users.find(x => x.email === email && x.password === form.password.value);
    if (!u) return formAlert('Incorrect email or password.');
    session = { email: u.email, name: u.name }; store.set('ss_session', session);
    updateHeader(); toast(`Welcome back, ${u.name.split(' ')[0]}!`);
    location.hash = nextHash();
  },
  signup(form) {
    const ok = validate(form, {
      name: v => v.length < 2 ? 'Enter your name (at least 2 characters)' : '',
      email: v => !v ? 'Enter your email' : !EMAIL.test(v) ? 'Enter a valid email address' : '',
      password: v => v.length < 6 ? 'Password must be at least 6 characters' : !/\d/.test(v) ? 'Include at least one number' : '',
      confirm: (v, f) => !v ? 'Type your password again' : v !== f.password.value.trim() ? 'Passwords must match' : ''
    });
    if (!ok) return;
    const email = form.email.value.trim().toLowerCase();
    if (users.find(u => u.email === email)) return formAlert('An account with this email already exists. Try signing in.');
    const u = { name: form.name.value.trim(), email, password: form.password.value };
    users.push(u); store.set('ss_users', users);
    session = { email, name: u.name }; store.set('ss_session', session);
    updateHeader(); toast('Account created. Welcome to ShopSphere!');
    location.hash = nextHash();
  },
  checkout(form) {
    const upi = form.pay.value === 'upi';
    return validate(form, {
      name: v => v.length < 2 ? 'Enter the recipient name' : '',
      phone: v => !/^[6-9]\d{9}$/.test(v) ? 'Enter a valid 10-digit mobile number' : '',
      pin: v => !/^\d{6}$/.test(v) ? 'Enter a valid 6-digit pincode' : '',
      address: v => v.length < 6 ? 'Enter your full address' : '',
      city: v => v.length < 2 ? 'Enter your city' : '',
      state: v => !v ? 'Select your state' : '',
      upi: v => upi && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v) ? 'Enter a valid UPI ID, e.g. name@bank' : ''
    });
  },
  contact(form) {
    const ok = validate(form, {
      cname: v => v.length < 2 ? 'Please enter your name' : '',
      cemail: v => !EMAIL.test(v) ? 'Enter a valid email' : '',
      cmsg: v => v.length < 10 ? 'Message should be at least 10 characters' : ''
    });
    if (!ok) return;
    form.reset(); toast("Thanks! We've received your message.");
  }
};

function placeOrder() {
  const form = $('form[data-form="checkout"]');
  if (!form || !forms.checkout(form)) return;
  const t = totals(); if (!t.lines.length) return;
  const addr = { name: form.name.value.trim(), phone: form.phone.value.trim(), pin: form.pin.value.trim(), address: form.address.value.trim(), city: form.city.value.trim(), state: form.state.value };
  store.set('ss_addr', addr);
  const eta = new Date(); eta.setDate(eta.getDate() + 3);
  const order = {
    id: 'SS' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10),
    email: session.email, date: Date.now(), total: t.total, addr,
    pay: form.pay.value, upi: form.upi.value.trim(),
    eta: eta.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }),
    items: t.lines.map(l => ({ id: l.p.id, name: l.p.name, price: l.p.price, qty: l.qty }))
  };
  orders.unshift(order); store.set('ss_orders', orders);
  cart = []; saveCart();
  location.hash = '#/confirm/' + order.id;
}

/* ---------- Events ---------- */
document.addEventListener('click', e => {
  const pay = e.target.closest('[data-pay]');
  if (pay) { $$('[data-pay]').forEach(x => x.classList.remove('on')); pay.classList.add('on'); }

  const t = e.target.closest('[data-act]'); if (!t) return;
  const act = t.dataset.act, id = +t.dataset.id;
  const qtyInput = $('#pqty');
  switch (act) {
    case 'add': addToCart(id); break;
    case 'addq': addToCart(id, Math.max(1, Math.min(10, +qtyInput.value || 1))); break;
    case 'buy': addToCart(id, Math.max(1, Math.min(10, +qtyInput.value || 1)), true); location.hash = '#/checkout'; break;
    case 'wish': e.preventDefault(); toggleWish(id); rerender(); break;
    case 'unwish': wish = wish.filter(w => w !== id); saveWish(); toast('Removed from wishlist'); rerender(); break;
    case 'tocart': wish = wish.filter(w => w !== id); saveWish(); addToCart(id, 1, true); toast('Moved to cart'); rerender(); break;
    case 'towish': if (!wish.includes(id)) { wish.push(id); saveWish(); } cart = cart.filter(c => c.id !== id); saveCart(); toast('Saved for later in wishlist'); rerender(); break;
    case 'inc': { const c = cart.find(x => x.id === id); if (c) { if (c.qty >= 10) toast('Maximum 10 per order', 'err'); else c.qty++; } saveCart(); rerender(); break; }
    case 'dec': { const c = cart.find(x => x.id === id); if (c) { c.qty--; if (c.qty <= 0) cart = cart.filter(x => x.id !== id); } saveCart(); rerender(); break; }
    case 'remove': cart = cart.filter(c => c.id !== id); saveCart(); toast('Item removed from cart'); rerender(); break;
    case 'clearcart': cart = []; saveCart(); rerender(); break;
    case 'pq+': qtyInput.value = Math.min(10, (+qtyInput.value || 1) + 1); break;
    case 'pq-': qtyInput.value = Math.max(1, (+qtyInput.value || 1) - 1); break;
    case 'place': placeOrder(); break;
    case 'logout': session = null; store.set('ss_session', null); updateHeader(); toast('You have been signed out'); location.hash = '#/'; rerender(); break;
    case 'pwtoggle': { const i = t.parentElement.querySelector('input'); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; t.innerHTML = `<i class="fa-regular ${show ? 'fa-eye-slash' : 'fa-eye'}"></i>`; break; }
    case 'fill-demo': { const f = $('form[data-form="login"]'); f.email.value = 'demo@shopsphere.com'; f.password.value = 'demo123'; break; }
    case 'drawer': document.body.classList.toggle('drawer-open'); break;
    case 'top': e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
    case 'location': { const d = $('#locDlg'); $('#locInput').value = pincode; $('#locErr').textContent = ''; d.showModal(); break; }
    case 'slide-next': window.__slide?.(window.__slideIdx() + 1); break;
    case 'slide-prev': window.__slide?.(window.__slideIdx() - 1); break;
    case 'slide-go': window.__slide?.(id); break;
  }
});

document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]');
  if (f) { e.preventDefault(); if (f.dataset.form === 'checkout') placeOrder(); else forms[f.dataset.form](f); }
});
// live validation clean-up
document.addEventListener('input', e => {
  const f = e.target.closest('.field'); if (f) f.classList.remove('bad');
  if (e.target.id === 'password' && e.target.form?.dataset.form === 'signup') {
    const v = e.target.value; let s = 0;
    if (v.length >= 6) s++; if (v.length >= 10) s++; if (/\d/.test(v)) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/[^\w]/.test(v)) s++;
    const bar = $('#pwBar'); bar.style.width = (s * 20) + '%'; bar.style.background = s <= 2 ? '#cc0c39' : s <= 3 ? '#f3a847' : '#0f9d6e';
  }
});

$('#searchForm').addEventListener('submit', e => {
  e.preventDefault();
  const p = new URLSearchParams();
  const term = $('#searchInput').value.trim(), cat = $('#searchCat').value;
  if (term) p.set('q', term); if (cat) p.set('cat', cat);
  location.hash = '#/search' + (p.toString() ? '?' + p : '');
});
$('#locCancel').addEventListener('click', () => $('#locDlg').close());
$('#locForm').addEventListener('submit', e => {
  e.preventDefault();
  const v = $('#locInput').value.trim();
  if (!/^\d{6}$/.test(v)) { $('#locErr').textContent = 'Please enter a valid 6-digit pincode.'; return; }
  pincode = v; store.set('ss_pin', v); $('#locDlg').close(); updateHeader(); toast('Delivery location updated');
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.body.classList.remove('drawer-open'); });
window.addEventListener('hashchange', () => route());
window.addEventListener('storage', () => { cart = store.get('ss_cart', []); wish = store.get('ss_wish', []); updateHeader(); });

/* ---------- Init ---------- */
$('#searchCat').insertAdjacentHTML('beforeend', CATS.map(c => `<option value="${c.id}">${c.name}</option>`).join(''));
$('#navCats').innerHTML = CATS.map(c => `<a href="#/search?cat=${c.id}">${c.name}</a>`).join('');
$('#drawerCats').innerHTML = CATS.map(c => `<a href="#/search?cat=${c.id}"><i class="fa-solid ${c.icon}"></i>${c.name}</a>`).join('');
updateHeader();
route();
})();
