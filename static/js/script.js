/**
 * E-MENU - PREMIUM RESTAURANT ORDERING WEB APPLICATION
 * Core Application Script (Vanilla JS ES6)
 */

// ==========================================================================
// 1. INITIAL RESTAURANT MENU DATA ENGINE
// ==========================================================================

// Default sample initial orders for kitchen dashboard demonstration
const INITIAL_ORDERS = [
  {
    id: "ORD-1042",
    time: "12:45 PM",
    status: "Preparing",
    priority: "High",
    tableNumber: "Table 4",
    customerName: "Siddharth Sharma",
    items: [
      { id: "f8", name: "Old Delhi Style Butter Chicken", price: 420, qty: 1 },
      { id: "f6", name: "Slow Cooked Dal Makhani", price: 270, qty: 1 },
      { id: "f5", name: "Butter Naan", price: 50, qty: 3 }
    ],
    specialInstructions: "Make Butter Chicken extra spicy, light cream on Dal Makhani.",
    subtotal: 840,
    gst: 42,
    discount: 0,
    grandTotal: 882,
    paymentStatus: "Paid",
    paymentMethod: "UPI"
  },
  {
    id: "ORD-1041",
    time: "12:38 PM",
    status: "Received",
    priority: "Normal",
    tableNumber: "Table 8",
    customerName: "Ananya Roy",
    items: [
      { id: "f1", name: "Paneer Tikka Smokey Grill", price: 280, qty: 1 },
      { id: "f13", name: "Crispy Cheese Masala Dosa", price: 180, qty: 2 }
    ],
    specialInstructions: "Extra coconut chutney requested.",
    subtotal: 640,
    gst: 32,
    discount: 64,
    grandTotal: 608,
    paymentStatus: "Pending",
    paymentMethod: "Cash"
  }
];

// ==========================================================================
// 2. STATE MANAGER & LOCAL STORAGE CONTROLLER
// ==========================================================================
class EMenuState {
  static getCart() {
    return JSON.parse(localStorage.getItem('emenu_cart') || '[]');
  }

  static setCart(cart) {
    localStorage.setItem('emenu_cart', JSON.stringify(cart));
    EMenuState.updateCartBadge();
  }

  static addToCart(foodId, qty = 1, specialNote = "") {
    const item = MENU_DATA.find(f => f.id === foodId);
    if (!item) return;

    let cart = EMenuState.getCart();
    const existingIndex = cart.findIndex(c => c.id === foodId);

    if (existingIndex > -1) {
      cart[existingIndex].qty += qty;
      if (specialNote) cart[existingIndex].specialNote = specialNote;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        type: item.type,
        qty: qty,
        specialNote: specialNote
      });
    }

    EMenuState.setCart(cart);
    showToast(`Added "${item.name}" to your cart!`, 'success');
  }

  static updateCartQty(foodId, delta) {
    let cart = EMenuState.getCart();
    const index = cart.findIndex(c => c.id === foodId);
    if (index > -1) {
      cart[index].qty += delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
      EMenuState.setCart(cart);
    }
  }

  static removeCartItem(foodId) {
    let cart = EMenuState.getCart();
    cart = cart.filter(c => c.id !== foodId);
    EMenuState.setCart(cart);
    showToast('Item removed from cart', 'info');
  }

  static clearCart() {
    localStorage.removeItem('emenu_cart');
    EMenuState.updateCartBadge();
  }

  static getSelectedTable() {
    return localStorage.getItem('emenu_table') || 'Table 4';
  }

  static setSelectedTable(table) {
    localStorage.setItem('emenu_table', table);
    const badge = document.getElementById('tablePillNav');
    if (badge) badge.innerText = table;
  }

  static getFavorites() {
    return JSON.parse(localStorage.getItem('emenu_favorites') || '["f1", "f8", "f15"]');
  }

  static toggleFavorite(foodId) {
    let favs = EMenuState.getFavorites();
    if (favs.includes(foodId)) {
      favs = favs.filter(id => id !== foodId);
      showToast('Removed from favorites', 'info');
    } else {
      favs.push(foodId);
      showToast('Added to favorites!', 'success');
    }
    localStorage.setItem('emenu_favorites', JSON.stringify(favs));
    return favs.includes(foodId);
  }

  static getOrders() {
    let orders = JSON.parse(localStorage.getItem('emenu_orders'));
    if (!orders || orders.length === 0) {
      orders = INITIAL_ORDERS;
      localStorage.setItem('emenu_orders', JSON.stringify(orders));
    }
    return orders;
  }

  static saveOrders(orders) {
    localStorage.setItem('emenu_orders', JSON.stringify(orders));
  }

  static getActiveOrderId() {
    return localStorage.getItem('emenu_active_order_id') || (EMenuState.getOrders()[0]?.id);
  }

  static setActiveOrderId(id) {
    localStorage.setItem('emenu_active_order_id', id);
  }

  static updateCartBadge() {
    const cart = EMenuState.getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(b => {
      b.innerText = totalCount;
      if (totalCount > 0) {
        b.classList.remove('d-none');
      } else {
        b.classList.add('d-none');
      }
    });
  }
}

// ==========================================================================
// 3. TOAST NOTIFICATION UTILITY
// ==========================================================================
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
  }

  const toastId = 'toast-' + Date.now();
  const bgClass = type === 'success' ? 'bg-success text-white' : type === 'danger' ? 'bg-danger text-white' : 'bg-dark text-white';
  const icon = type === 'success' ? 'bi-check-circle-fill' : type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';

  const html = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icon} fs-5"></i>
          <div>${message}</div>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', html);
  const toastElem = document.getElementById(toastId);
  const bsToast = new bootstrap.Toast(toastElem, { delay: 3000 });
  bsToast.show();

  toastElem.addEventListener('hidden.bs.toast', () => {
    toastElem.remove();
  });
}

// ==========================================================================
// 4. COMMON UI COMPONENTS & MODAL RENDERERS
// ==========================================================================

// Render Food Card HTML
function createFoodCardHTML(item) {
  const isFav = EMenuState.getFavorites().includes(item.id);
  const dietClass = item.type === 'veg' ? 'veg' : 'non-veg';

  return `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3 animate-slide-up">
      <div class="food-card" onclick="openFoodDetailModal('${item.id}')">
        <div class="food-card-img-wrapper">
          <div class="diet-badge ${dietClass}" title="${item.type.toUpperCase()}"></div>
          <button class="fav-btn ${isFav ? 'active' : ''}" onclick="handleFavClick(event, '${item.id}')">
            <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
          </button>
          <img src="${item.image}" alt="${item.name}" class="food-card-img" loading="lazy">
          <div class="prep-time-badge">
            <i class="bi bi-clock"></i> ${item.prepTime}
          </div>
        </div>
        <div class="food-card-body">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <span class="badge bg-light text-secondary border fs-xs fw-semibold">${item.category}</span>
            <span class="food-rating"><i class="bi bi-star-fill"></i> ${item.rating}</span>
          </div>
          <h3 class="food-title">${item.name}</h3>
          <p class="food-desc">${item.description}</p>
          <div class="food-card-footer">
            <div class="food-price">₹${item.price}</div>
            <div class="d-flex gap-2">
              <button class="btn-add-cart" onclick="event.stopPropagation(); EMenuState.addToCart('${item.id}')">
                <i class="bi bi-plus-lg me-1"></i> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Toggle Favorite Heart
function handleFavClick(event, foodId) {
  event.stopPropagation();
  const btn = event.currentTarget;
  const isNowFav = EMenuState.toggleFavorite(foodId);
  const icon = btn.querySelector('i');
  if (isNowFav) {
    btn.classList.add('active');
    icon.className = 'bi bi-heart-fill';
  } else {
    btn.classList.remove('active');
    icon.className = 'bi bi-heart';
  }
}

// Food Details Modal Popup
function openFoodDetailModal(foodId) {
  const item = MENU_DATA.find(f => f.id === foodId);
  if (!item) return;

  let modalElem = document.getElementById('foodDetailModal');
  if (!modalElem) {
    const modalHTML = `
      <div class="modal fade" id="foodDetailModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            <div class="modal-body p-3 p-md-4" id="foodModalContent">
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modalElem = document.getElementById('foodDetailModal');
  }

  const container = document.getElementById('foodModalContent');
  const isFav = EMenuState.getFavorites().includes(item.id);

  container.innerHTML = `
    <div class="row g-3 g-md-4">
      <div class="col-md-6">
        <div class="position-relative rounded-4 overflow-hidden shadow-sm" style="height: 220px; max-height: 280px;">
          <div class="diet-badge ${item.type === 'veg' ? 'veg' : 'non-veg'}" style="top: 12px; left: 12px;"></div>
          <img src="${item.image}" alt="${item.name}" class="w-100 h-100 object-fit-cover">
          <div class="prep-time-badge" style="bottom: 12px; right: 12px;">
            <i class="bi bi-clock"></i> ${item.prepTime}
          </div>
        </div>
      </div>
      <div class="col-md-6 d-flex flex-column justify-content-between">
        <div>
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="badge bg-warning text-dark px-3 py-1 rounded-pill"><i class="bi bi-star-fill text-dark me-1"></i> ${item.rating} / 5.0</span>
            <span class="text-muted fs-xs"><i class="bi bi-tag-fill me-1"></i>${item.category}</span>
          </div>
          <h2 class="h4 fw-bold mb-2">${item.name}</h2>
          <p class="text-muted fs-xs mb-3">${item.description}</p>
          <div class="bg-light p-2.5 p-md-3 rounded-3 mb-3">
            <div class="fw-semibold text-dark fs-xs uppercase tracking-wider mb-1">Ingredients:</div>
            <div class="fs-xs text-secondary">${item.ingredients}</div>
          </div>
        </div>

        <div>
          <div class="mb-3">
            <label class="form-label fs-xs fw-semibold text-muted mb-1">Special Chef Instructions</label>
            <input type="text" id="modalSpecialNotes" class="form-control form-control-sm rounded-pill" placeholder="e.g. Less spicy, extra sauce, no onions...">
          </div>
          <div class="d-flex align-items-center justify-content-between border-top pt-3">
            <div>
              <span class="fs-xs text-muted d-block">Price</span>
              <span class="fs-4 fw-extrabold text-primary">₹${item.price}</span>
            </div>
            <div class="d-flex align-items-center gap-2 gap-sm-3">
              <div class="qty-control">
                <button class="qty-btn" onclick="adjustModalQty(-1)"><i class="bi bi-dash"></i></button>
                <span class="qty-val" id="modalQtyVal">1</span>
                <button class="qty-btn" onclick="adjustModalQty(1)"><i class="bi bi-plus"></i></button>
              </div>
              <button class="btn btn-primary-gradient px-3 px-sm-4" onclick="addModalItemToCart('${item.id}')">
                <i class="bi bi-cart-plus me-1"></i> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const bsModal = bootstrap.Modal.getOrCreateInstance(modalElem);
  bsModal.show();
}

let modalCurrentQty = 1;
function adjustModalQty(delta) {
  modalCurrentQty = Math.max(1, modalCurrentQty + delta);
  const qtyElem = document.getElementById('modalQtyVal');
  if (qtyElem) qtyElem.innerText = modalCurrentQty;
}

function addModalItemToCart(foodId) {
  const notes = document.getElementById('modalSpecialNotes')?.value || '';
  EMenuState.addToCart(foodId, modalCurrentQty, notes);
  const modalElem = document.getElementById('foodDetailModal');
  if (modalElem) {
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalElem);
    bsModal.hide();
  }
  modalCurrentQty = 1;
}

// Table Selection Selector Handler
function initTablePicker() {
  const currentTable = EMenuState.getSelectedTable();
  const tableBtn = document.getElementById('tablePillNav');
  if (tableBtn) tableBtn.innerHTML = `<i class="bi bi-geo-alt-fill text-primary"></i> ${currentTable}`;
  const tableBtnMobile = document.getElementById('tablePillNavMobile');
  if (tableBtnMobile) tableBtnMobile.innerHTML = `<i class="bi bi-geo-alt-fill"></i> ${currentTable}`;
  const mobileDrawerTableText = document.getElementById('mobileDrawerTableText');
  if (mobileDrawerTableText) mobileDrawerTableText.innerHTML = `<i class="bi bi-geo-alt-fill text-primary me-1"></i>${currentTable}`;
}

function changeTable(tableName) {
  EMenuState.setSelectedTable(tableName);
  initTablePicker();
  showToast(`Table changed to ${tableName}`, 'info');
  const modalElem = document.getElementById('tableSelectModal');
  if (modalElem) {
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalElem);
    bsModal.hide();
  }
}

// Global Call Waiter Action
function callWaiterAction() {
  const currentTable = EMenuState.getSelectedTable();
  showToast(`🔔 Staff Alerted! A waiter is heading to ${currentTable}.`, 'success');
  
  // Play subtle chime sound using Web Audio API
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }
  } catch(e) {
    // Audio fallback
  }

  // Update button UI temporarily
  const waiterBtns = document.querySelectorAll('.call-waiter-trigger-btn, .call-waiter-btn');
  waiterBtns.forEach(btn => {
    btn.classList.add('calling');
    const origHTML = btn.innerHTML;
    btn.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> Waiter Notified!`;
    setTimeout(() => {
      btn.classList.remove('calling');
      btn.innerHTML = origHTML;
    }, 6000);
  });
}

// Smartphone Navigation Controller Setup
function setupSmartphoneNavigation() {
  const pathname = window.location.pathname.toLowerCase();
  
  const isHome = pathname.endsWith('index.html') || pathname.endsWith('dashboard.html') || pathname === '/' || pathname.endsWith('/');
  const isMenu = pathname.includes('menu.html');
  const isTables = pathname.includes('tables.html');
  const isCart = pathname.includes('cart.html');
  const isTracking = pathname.includes('order-tracking.html');
  const isKitchen = pathname.includes('kitchen-dashboard.html');
  const isBill = pathname.includes('bill.html');
  const isProfile = pathname.includes('profile.html');

  // 1. Inject Call Waiter button into Navbar top mobile controls if missing
  const navMobileControls = document.querySelector('.navbar .d-lg-none');
  if (navMobileControls && !document.querySelector('.call-waiter-btn-top')) {
    const waiterBtnTop = document.createElement('button');
    waiterBtnTop.className = 'call-waiter-btn call-waiter-btn-top me-1';
    waiterBtnTop.setAttribute('onclick', 'callWaiterAction()');
    waiterBtnTop.setAttribute('title', 'Call Waiter to Table');
    waiterBtnTop.innerHTML = `<i class="bi bi-bell-fill"></i> <span class="d-none d-sm-inline">Waiter</span>`;
    navMobileControls.insertBefore(waiterBtnTop, navMobileControls.firstChild);
  }

  // 2. Make top navbar togglers trigger the offcanvas drawer
  const togglers = document.querySelectorAll('.navbar-toggler');
  togglers.forEach(toggler => {
    toggler.setAttribute('data-bs-toggle', 'offcanvas');
    toggler.setAttribute('data-bs-target', '#mobileNavDrawer');
  });

  // 3. Inject Bottom Navigation Bar if missing
  if (!document.getElementById('mobileBottomNav')) {
    const bottomNav = document.createElement('nav');
    bottomNav.className = 'mobile-bottom-nav d-lg-none';
    bottomNav.id = 'mobileBottomNav';
    bottomNav.innerHTML = `
      <a href="index.html" class="mobile-nav-item ${isHome ? 'active' : ''}">
        <i class="bi ${isHome ? 'bi-house-door-fill' : 'bi-house-door'}"></i>
        <span>Home</span>
      </a>
      <a href="menu.html" class="mobile-nav-item ${isMenu ? 'active' : ''}">
        <i class="bi ${isMenu ? 'bi-journal-richtext' : 'bi-book'}"></i>
        <span>Menu</span>
      </a>
      <a href="tables.html" class="mobile-nav-item ${isTables ? 'active' : ''}">
        <i class="bi ${isTables ? 'bi-grid-3x3-gap-fill' : 'bi-grid-3x3-gap'}"></i>
        <span>Tables</span>
      </a>
      <a href="cart.html" class="mobile-nav-item ${isCart ? 'active' : ''}">
        <i class="bi ${isCart ? 'bi-cart-fill' : 'bi-cart3'}"></i>
        <span>Cart</span>
        <span class="mobile-nav-badge cart-count-badge d-none">0</span>
      </a>
      <a href="#mobileNavDrawer" class="mobile-nav-item" data-bs-toggle="offcanvas" role="button" aria-controls="mobileNavDrawer">
        <i class="bi bi-grid-fill"></i>
        <span>More</span>
      </a>
    `;
    document.body.appendChild(bottomNav);
  }

  // 4. Inject Offcanvas Drawer if missing
  if (!document.getElementById('mobileNavDrawer')) {
    const drawer = document.createElement('div');
    drawer.className = 'offcanvas offcanvas-end offcanvas-mobile-drawer';
    drawer.tabIndex = -1;
    drawer.id = 'mobileNavDrawer';
    drawer.setAttribute('aria-labelledby', 'mobileNavDrawerLabel');
    
    const currentTable = EMenuState.getSelectedTable();

    drawer.innerHTML = `
      <div class="offcanvas-header mobile-drawer-header">
        <div class="d-flex align-items-center gap-2">
          <div class="brand-icon" style="width: 34px; height: 34px; font-size: 1rem;">
            <i class="bi bi-qr-code-scan"></i>
          </div>
          <div>
            <h5 class="offcanvas-title font-heading fw-bold text-dark fs-6 mb-0" id="mobileNavDrawerLabel">E-Menu Dining</h5>
            <span class="fs-xs text-muted">Smart Table Ordering</span>
          </div>
        </div>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body p-3 d-flex flex-column">
        <!-- Table Card -->
        <div class="bg-light p-3 rounded-4 mb-3 border d-flex justify-content-between align-items-center">
          <div>
            <span class="fs-xs text-muted d-block fw-semibold">Dining Location</span>
            <span class="fw-extrabold text-dark" id="mobileDrawerTableText"><i class="bi bi-geo-alt-fill text-primary me-1"></i>${currentTable}</span>
          </div>
          <a href="tables.html" class="btn btn-xs btn-outline-primary rounded-pill px-3 py-1.5 fw-semibold" data-bs-dismiss="offcanvas">
            <i class="bi bi-arrow-repeat me-1"></i> Tables Map
          </a>
        </div>

        <!-- Quick Call Waiter Button -->
        <button class="btn btn-primary-gradient w-100 mb-3 py-2.5 rounded-pill shadow-sm call-waiter-trigger-btn" onclick="callWaiterAction()">
          <i class="bi bi-bell-fill me-2"></i> Call Waiter to Table
        </button>

        <!-- Navigation Links -->
        <div class="mb-3">
          <div class="text-uppercase text-muted fs-xs fw-bold px-2 mb-2 tracking-wider">Navigation Menu</div>
          <a href="index.html" class="mobile-drawer-link ${isHome ? 'active' : ''}">
            <i class="bi bi-house-door"></i> Home Dashboard
          </a>
          <a href="menu.html" class="mobile-drawer-link ${isMenu ? 'active' : ''}">
            <i class="bi bi-journal-text"></i> Explore Full Menu
          </a>
          <a href="tables.html" class="mobile-drawer-link ${isTables ? 'active' : ''}">
            <i class="bi bi-grid-3x3-gap"></i> Available Tables & Map
          </a>
          <a href="cart.html" class="mobile-drawer-link ${isCart ? 'active' : ''}">
            <i class="bi bi-cart3"></i> My Food Cart <span class="badge bg-danger rounded-pill ms-auto cart-count-badge d-none">0</span>
          </a>
          <a href="order-tracking.html" class="mobile-drawer-link ${isTracking ? 'active' : ''}">
            <i class="bi bi-clock-history"></i> Track Live Orders
          </a>
          <a href="bill.html" class="mobile-drawer-link ${isBill ? 'active' : ''}">
            <i class="bi bi-receipt"></i> Bill & Payment
          </a>
          <a href="kitchen-dashboard.html" class="mobile-drawer-link ${isKitchen ? 'active' : ''}">
            <i class="bi bi-cup-hot"></i> Chef Kitchen Display
          </a>
          <a href="profile.html" class="mobile-drawer-link ${isProfile ? 'active' : ''}">
            <i class="bi bi-person-circle"></i> Profile & History
          </a>
        </div>

        <div class="border-top pt-3 mt-auto">
          <div class="d-flex align-items-center justify-content-between text-muted fs-xs">
            <span>Digital Dining Suite</span>
            <a href="profile.html" class="text-primary fw-bold text-decoration-none">Guest Profile</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  // Sync mobile drawer table text whenever table changes
  initTablePicker();

  // Update cart badge across mobile bottom nav & drawer
  EMenuState.updateCartBadge();
}

// Global Event Delegate for Modal Dismissal & Close Buttons
document.addEventListener('click', (e) => {
  const dismissBtn = e.target.closest('[data-bs-dismiss="modal"], .btn-close, .btn-close-custom');
  if (dismissBtn) {
    const modalElem = dismissBtn.closest('.modal');
    if (modalElem) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalElem);
      bsModal.hide();
    }
  }
});

// ==========================================================================
// 5. PAGE SPECIFIC CONTROLLER LOGIC
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupSmartphoneNavigation();
  EMenuState.updateCartBadge();
  initTablePicker();

  const pathname = window.location.pathname;

  if (pathname.includes('tables.html')) {
    initTablesPage();
  } else if (pathname.includes('dashboard.html') || pathname.includes('menu.html') || pathname === '/' || pathname.endsWith('index.html')) {
    initMenuPage();
  } else if (pathname.includes('cart.html')) {
    initCartPage();
  } else if (pathname.includes('order-tracking.html')) {
    initOrderTrackingPage();
  } else if (pathname.includes('kitchen-dashboard.html')) {
    initKitchenDashboardPage();
  } else if (pathname.includes('bill.html')) {
    initBillingPage();
  } else if (pathname.includes('profile.html')) {
    initProfilePage();
  }
});



// --------------------------------------------------------------------------
// MENU & DASHBOARD PAGE CONTROLLER
// --------------------------------------------------------------------------
let activeCategory = 'All';
let activeDiet = 'all'; // all, veg, non-veg
let searchQuery = '';

function initMenuPage() {
  const menuContainer = document.getElementById('menuGridContainer');
  if (!menuContainer) return;

  renderCategoryButtons();
  renderFilteredMenu();

  // Search input listener
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderFilteredMenu();
    });
  }

  // Diet filter buttons
  const dietBtns = document.querySelectorAll('.diet-filter-btn');
  dietBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dietBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeDiet = btn.dataset.diet;
      renderFilteredMenu();
    });
  });
}

function renderCategoryButtons() {
  const slider = document.getElementById('categorySlider');
  if (!slider) return;

  const categories = ['All', 'Starters', 'Veg', 'Non Veg', 'Chinese', 'South Indian', 'Drinks', 'Desserts'];
  const icons = {
    'All': 'bi-grid-fill',
    'Starters': 'bi-egg-fried',
    'Veg': 'bi-flower1',
    'Non Veg': 'bi-fire',
    'Chinese': 'bi-cup-hot-fill',
    'South Indian': 'bi-disc',
    'Drinks': 'bi-cup-straw',
    'Desserts': 'bi-pie-chart-fill'
  };

  slider.innerHTML = categories.map(cat => `
    <button class="category-btn ${cat === activeCategory ? 'active' : ''}" onclick="selectCategory('${cat}')">
      <i class="bi ${icons[cat] || 'bi-bookmark'}"></i> ${cat}
    </button>
  `).join('');
}

function selectCategory(cat) {
  activeCategory = cat;
  renderCategoryButtons();
  renderFilteredMenu();
}

function renderFilteredMenu() {
  const container = document.getElementById('menuGridContainer');
  if (!container) return;

  let filtered = MENU_DATA.filter(item => {
    const matchCat = activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchDiet = activeDiet === 'all' || item.type === activeDiet;
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery) || item.description.toLowerCase().includes(searchQuery);
    return matchCat && matchDiet && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="mb-3 text-muted display-1"><i class="bi bi-search"></i></div>
        <h4 class="fw-bold">No Dishes Found</h4>
        <p class="text-muted">Try clearing your filters or search term to see delicious food items.</p>
        <button class="btn btn-outline-custom mt-2" onclick="resetFilters()">Reset Search</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => createFoodCardHTML(item)).join('');
}

function resetFilters() {
  activeCategory = 'All';
  activeDiet = 'all';
  searchQuery = '';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  renderCategoryButtons();
  renderFilteredMenu();
}

// --------------------------------------------------------------------------
// CART PAGE CONTROLLER
// --------------------------------------------------------------------------
let appliedDiscount = 0;
let appliedCouponCode = '';

function initCartPage() {
  renderCartView();
}

function renderCartView() {
  const container = document.getElementById('cartItemsContainer');
  if (!container) return;

  const cart = EMenuState.getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 bg-white rounded-4 shadow-sm p-4">
        <div class="display-3 text-warning mb-3"><i class="bi bi-cart-x"></i></div>
        <h3 class="fw-bold">Your Cart is Empty</h3>
        <p class="text-muted">Explore our appetizing menu and add your favorite dishes to get started.</p>
        <a href="menu.html" class="btn btn-primary-gradient px-4 py-2 mt-2">
          <i class="bi bi-menu-app me-1"></i> Browse Menu
        </a>
      </div>
    `;
    updateCartSummary(0, 0, 0, 0);
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    return `
      <div class="card mb-3 border-0 shadow-sm rounded-4 overflow-hidden animate-slide-up">
        <div class="card-body p-3">
          <div class="row align-items-center g-3">
            <div class="col-3 col-sm-2">
              <img src="${item.image}" alt="${item.name}" class="rounded-3 w-100 object-fit-cover" style="height: 70px;">
            </div>
            <div class="col-9 col-sm-4">
              <div class="d-flex align-items-center gap-2">
                <span class="diet-badge ${item.type === 'veg' ? 'veg' : 'non-veg'}" style="position:static;"></span>
                <h5 class="fw-bold fs-6 mb-0 text-truncate">${item.name}</h5>
              </div>
              <div class="text-muted fs-xs mt-1">₹${item.price} each</div>
              ${item.specialNote ? `<div class="text-primary fs-xs mt-1"><i class="bi bi-pencil-fill me-1"></i>"${item.specialNote}"</div>` : ''}
            </div>
            <div class="col-6 col-sm-3 d-flex align-items-center justify-content-start justify-content-sm-center">
              <div class="qty-control">
                <button class="qty-btn" onclick="EMenuState.updateCartQty('${item.id}', -1); renderCartView();"><i class="bi bi-dash"></i></button>
                <span class="qty-val">${item.qty}</span>
                <button class="qty-btn" onclick="EMenuState.updateCartQty('${item.id}', 1); renderCartView();"><i class="bi bi-plus"></i></button>
              </div>
            </div>
            <div class="col-6 col-sm-3 d-flex align-items-center justify-content-between justify-content-sm-end gap-3">
              <span class="fw-bold fs-6 text-dark">₹${itemTotal}</span>
              <button class="btn btn-sm text-danger" onclick="EMenuState.removeCartItem('${item.id}'); renderCartView();" title="Remove Item">
                <i class="bi bi-trash-fill fs-5"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const gst = Math.round(subtotal * 0.05); // 5% GST
  const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  const grandTotal = Math.max(0, subtotal + gst - discountAmount);

  updateCartSummary(subtotal, gst, discountAmount, grandTotal);
}

function updateCartSummary(subtotal, gst, discount, grandTotal) {
  const subtotalElem = document.getElementById('cartSubtotal');
  const gstElem = document.getElementById('cartGst');
  const discountElem = document.getElementById('cartDiscount');
  const totalElem = document.getElementById('cartGrandTotal');

  if (subtotalElem) subtotalElem.innerText = `₹${subtotal}`;
  if (gstElem) gstElem.innerText = `₹${gst}`;
  if (discountElem) discountElem.innerText = `-₹${discount}`;
  if (totalElem) totalElem.innerText = `₹${grandTotal}`;
}

function applyCoupon() {
  const couponInput = document.getElementById('couponInput');
  if (!couponInput) return;

  const code = couponInput.value.trim().toUpperCase();
  if (code === 'WELCOME20') {
    appliedDiscount = 20;
    appliedCouponCode = code;
    showToast('Coupon WELCOME20 Applied! 20% Discount unlocked.', 'success');
  } else if (code === 'EMENU10') {
    appliedDiscount = 10;
    appliedCouponCode = code;
    showToast('Coupon EMENU10 Applied! 10% Discount unlocked.', 'success');
  } else {
    showToast('Invalid Coupon Code. Try WELCOME20', 'danger');
  }
  renderCartView();
}

function proceedToCheckout() {
  const cart = EMenuState.getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'danger');
    return;
  }

  const tableNum = EMenuState.getSelectedTable();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const gst = Math.round(subtotal * 0.05);
  const discount = Math.round((subtotal * appliedDiscount) / 100);
  const grandTotal = subtotal + gst - discount;

  const newOrder = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Received',
    priority: 'Normal',
    tableNumber: tableNum,
    customerName: 'Guest Diner',
    items: cart,
    specialInstructions: document.getElementById('orderNotes')?.value || 'None',
    subtotal: subtotal,
    gst: gst,
    discount: discount,
    grandTotal: grandTotal,
    paymentStatus: 'Pending',
    paymentMethod: 'UPI'
  };

  const orders = EMenuState.getOrders();
  orders.unshift(newOrder);
  EMenuState.saveOrders(orders);
  EMenuState.setActiveOrderId(newOrder.id);
  EMenuState.clearCart();

  showToast('Order Placed Successfully! Redirecting to Kitchen Status...', 'success');
  setTimeout(() => {
    window.location.href = 'order-tracking.html';
  }, 1200);
}

// --------------------------------------------------------------------------
// ORDER TRACKING CONTROLLER
// --------------------------------------------------------------------------
function initOrderTrackingPage() {
  const orders = EMenuState.getOrders();
  const activeId = EMenuState.getActiveOrderId();
  const activeOrder = orders.find(o => o.id === activeId) || orders[0];

  if (!activeOrder) return;

  renderOrderTrackingView(activeOrder);
}

function renderOrderTrackingView(order) {
  const idElem = document.getElementById('trackingOrderId');
  const tableElem = document.getElementById('trackingTable');
  const timeElem = document.getElementById('trackingTime');
  const totalElem = document.getElementById('trackingTotal');
  const itemsContainer = document.getElementById('trackingItemsContainer');

  if (idElem) idElem.innerText = order.id;
  if (tableElem) tableElem.innerText = order.tableNumber;
  if (timeElem) timeElem.innerText = order.time;
  if (totalElem) totalElem.innerText = `₹${order.grandTotal}`;

  if (itemsContainer) {
    itemsContainer.innerHTML = order.items.map(item => `
      <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
        <div>
          <span class="fw-semibold">${item.name}</span>
          <span class="text-muted ms-2">x ${item.qty}</span>
        </div>
        <span class="fw-bold">₹${item.price * item.qty}</span>
      </div>
    `).join('');
  }

  // Update Progress Bar & Steps
  const statuses = ['Received', 'Accepted', 'Preparing', 'Cooking', 'Ready to Serve', 'Served'];
  const currentIndex = statuses.indexOf(order.status);

  const fillBar = document.getElementById('trackingFillBar');
  if (fillBar) {
    const percent = Math.min(100, Math.max(10, ((currentIndex + 1) / statuses.length) * 100));
    fillBar.style.width = `${percent}%`;
  }

  const stepElements = document.querySelectorAll('.tracking-step');
  stepElements.forEach((step, idx) => {
    step.classList.remove('completed', 'active');
    if (idx < currentIndex) {
      step.classList.add('completed');
    } else if (idx === currentIndex) {
      step.classList.add('active');
    }
  });
}

// --------------------------------------------------------------------------
// KITCHEN DASHBOARD CONTROLLER
// --------------------------------------------------------------------------
let kitchenStatusFilter = 'All';

function initKitchenDashboardPage() {
  renderKitchenDashboard();

  // Listen for filter buttons
  const filterBtns = document.querySelectorAll('.kitchen-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('btn-dark'));
      filterBtns.forEach(b => b.classList.add('btn-outline-dark'));
      btn.classList.remove('btn-outline-dark');
      btn.classList.add('btn-dark');
      kitchenStatusFilter = btn.dataset.status;
      renderKitchenDashboard();
    });
  });
}

function renderKitchenDashboard() {
  const container = document.getElementById('kitchenCardsContainer');
  if (!container) return;

  const orders = EMenuState.getOrders();
  let filtered = orders.filter(o => {
    if (kitchenStatusFilter === 'All') return o.status !== 'Completed';
    return o.status === kitchenStatusFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="display-3 text-muted mb-2"><i class="bi bi-check-circle"></i></div>
        <h4>No Orders in "${kitchenStatusFilter}"</h4>
        <p class="text-muted">All customer orders for this view have been processed.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(order => `
    <div class="col-12 col-md-6 col-lg-4 animate-slide-up">
      <div class="kitchen-card ${order.priority === 'High' ? 'priority-high' : ''}">
        <div class="kitchen-header">
          <div>
            <span class="table-badge">${order.tableNumber}</span>
            <span class="ms-2 fw-bold text-dark fs-sm">${order.id}</span>
          </div>
          <span class="status-badge ${order.status.toLowerCase().replace(/\s+/g, '')}">${order.status}</span>
        </div>
        <div class="card-body p-3">
          <div class="d-flex justify-content-between fs-xs text-muted mb-2">
            <span><i class="bi bi-person me-1"></i>${order.customerName}</span>
            <span><i class="bi bi-clock me-1"></i>${order.time}</span>
          </div>

          <div class="bg-light p-2 rounded-3 mb-3">
            ${order.items.map(item => `
              <div class="kitchen-item-row">
                <span class="fw-bold">${item.qty}x</span>
                <span class="flex-grow-1 ms-2 text-dark">${item.name}</span>
              </div>
            `).join('')}
          </div>

          ${order.specialInstructions && order.specialInstructions !== 'None' ? `
            <div class="alert alert-warning py-1 px-2 fs-xs mb-3">
              <strong>Note:</strong> ${order.specialInstructions}
            </div>
          ` : ''}

          <div class="d-flex gap-2">
            ${getKitchenActionButtons(order)}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function getKitchenActionButtons(order) {
  if (order.status === 'Received') {
    return `<button class="btn btn-sm btn-primary w-100" onclick="updateOrderStatus('${order.id}', 'Preparing')">Accept Order</button>`;
  } else if (order.status === 'Preparing') {
    return `<button class="btn btn-sm btn-warning text-dark w-100" onclick="updateOrderStatus('${order.id}', 'Cooking')">Cooking</button>`;
  } else if (order.status === 'Cooking') {
    return `<button class="btn btn-sm btn-info text-white w-100" onclick="updateOrderStatus('${order.id}', 'Ready to Serve')">Ready to Serve</button>`;
  } else if (order.status === 'Ready to Serve') {
    return `<button class="btn btn-sm btn-success w-100" onclick="updateOrderStatus('${order.id}', 'Served')">Mark Served</button>`;
  } else {
    return `<button class="btn btn-sm btn-secondary w-100" onclick="updateOrderStatus('${order.id}', 'Completed')">Complete & Archive</button>`;
  }
}

function updateOrderStatus(orderId, newStatus) {
  const orders = EMenuState.getOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    EMenuState.saveOrders(orders);
    showToast(`Order ${orderId} updated to "${newStatus}"`, 'info');
    renderKitchenDashboard();
  }
}

// --------------------------------------------------------------------------
// BILLING PAGE CONTROLLER
// --------------------------------------------------------------------------
function initBillingPage() {
  const orders = EMenuState.getOrders();
  const activeId = EMenuState.getActiveOrderId();
  const order = orders.find(o => o.id === activeId) || orders[0];

  if (!order) return;

  renderInvoiceView(order);
}

function renderInvoiceView(order) {
  const invoiceNum = document.getElementById('invoiceNum');
  const invoiceTable = document.getElementById('invoiceTable');
  const invoiceCustomer = document.getElementById('invoiceCustomer');
  const invoiceSubtotal = document.getElementById('invoiceSubtotal');
  const invoiceGst = document.getElementById('invoiceGst');
  const invoiceDiscount = document.getElementById('invoiceDiscount');
  const invoiceGrandTotal = document.getElementById('invoiceGrandTotal');

  if (invoiceNum) invoiceNum.innerText = order.id;
  if (invoiceTable) invoiceTable.innerText = order.tableNumber;
  if (invoiceCustomer) invoiceCustomer.innerText = order.customerName;

  const itemsContainer = document.getElementById('invoiceItemsList');
  if (itemsContainer) {
    itemsContainer.innerHTML = order.items.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>₹${item.price}</td>
        <td>${item.qty}</td>
        <td class="text-end fw-bold">₹${item.price * item.qty}</td>
      </tr>
    `).join('');
  }

  if (invoiceSubtotal) invoiceSubtotal.innerText = `₹${order.subtotal}`;
  if (invoiceGst) invoiceGst.innerText = `₹${order.gst}`;
  if (invoiceDiscount) invoiceDiscount.innerText = `-₹${order.discount}`;
  if (invoiceGrandTotal) invoiceGrandTotal.innerText = `₹${order.grandTotal}`;
}

function selectPaymentMethod(elem, method) {
  document.querySelectorAll('.payment-method-card').forEach(card => card.classList.remove('selected'));
  elem.classList.add('selected');
  showToast(`Payment method selected: ${method}`, 'info');
}

function processBillPayment() {
  const modalElem = document.getElementById('paymentSuccessModal');
  if (modalElem) {
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalElem);
    bsModal.show();
  }

  const orders = EMenuState.getOrders();
  const activeId = EMenuState.getActiveOrderId();
  const order = orders.find(o => o.id === activeId);
  if (order) {
    order.paymentStatus = 'Paid';
    EMenuState.saveOrders(orders);
  }
}

// --------------------------------------------------------------------------
// PROFILE PAGE CONTROLLER
// --------------------------------------------------------------------------
function initProfilePage() {
  renderProfileHistory();
  renderProfileFavorites();
}

function renderProfileHistory() {
  const container = document.getElementById('profileHistoryContainer');
  if (!container) return;

  const orders = EMenuState.getOrders();
  if (orders.length === 0) {
    container.innerHTML = `<p class="text-muted">No past order history found.</p>`;
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="card border-0 shadow-sm rounded-4 mb-3">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <span class="fw-bold">${order.id}</span>
            <span class="badge bg-light text-dark ms-2">${order.tableNumber}</span>
          </div>
          <span class="badge bg-success">${order.status}</span>
        </div>
        <div class="fs-xs text-muted mb-2">Ordered on ${order.time} • ${order.items.length} Items</div>
        <div class="d-flex justify-content-between align-items-center border-top pt-2">
          <span class="fw-bold text-primary">₹${order.grandTotal}</span>
          <a href="bill.html" onclick="EMenuState.setActiveOrderId('${order.id}')" class="btn btn-sm btn-outline-custom">View Bill</a>
        </div>
      </div>
    </div>
  `).join('');
}

function renderProfileFavorites() {
  const container = document.getElementById('profileFavContainer');
  if (!container) return;

  const favIds = EMenuState.getFavorites();
  const favItems = MENU_DATA.filter(m => favIds.includes(m.id));

  if (favItems.length === 0) {
    container.innerHTML = `<p class="text-muted">No favorite dishes added yet.</p>`;
    return;
  }

  container.innerHTML = favItems.map(item => `
    <div class="col-6 col-md-4 mb-3">
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
        <img src="${item.image}" class="card-img-top" style="height: 120px; object-fit: cover;">
        <div class="card-body p-2 text-center">
          <h6 class="fw-bold fs-xs text-truncate mb-1">${item.name}</h6>
          <div class="text-primary fw-bold fs-xs mb-2">₹${item.price}</div>
          <button class="btn btn-xs btn-primary-gradient w-100 py-1" style="font-size: 0.75rem;" onclick="EMenuState.addToCart('${item.id}')">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}
