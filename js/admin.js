document.addEventListener("DOMContentLoaded", () => {
  initAdmin();
});

let currentUser = null;
let currentProducts = [];
let currentInquiries = [];
let currentBrands = [];
let currentCategories = [];
let currentColors = [];
let currentOrderMode = "inventory"; // 'inventory' or 'home'
let isOrderChanged = false;
let editingId = null;
let editingBrandId = null;
let currentGallery = [];
let currentColorVariants = []; // [{name, name_ar, hex, gallery:[]}]

const escapeHtml = (unsafe) => {
  if (unsafe === null || unsafe === undefined) return "";
  if (typeof unsafe !== "string") unsafe = String(unsafe);
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

// Optimizes remote images via wsrv.nl to fix huge memory footprint and slow loading
const optimizeImage = (url, width) => {
    if (!url) return '';
    if (url.includes('wsrv.nl')) return url;
    if (url.startsWith('https://')) {
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80`;
    }
    return url;
};
const sanitizeFilename = (name) => {
    return name.replace(/[^a-z0-9.]/gi, '-').replace(/-+/g, '-').toLowerCase();
};

async function compressImageClient(file, maxDimension = 1920) {
    if (!file || !file.type.startsWith('image/')) return file;
    if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width;
                let h = img.height;
                if (w > maxDimension || h > maxDimension) {
                    if (w > h) { h = Math.round((h * maxDimension) / w); w = maxDimension; }
                    else { w = Math.round((w * maxDimension) / h); h = maxDimension; }
                } else {
                    return resolve(file);
                }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                canvas.toBlob((blob) => {
                    if (!blob) return resolve(file);
                    resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                }, 'image/jpeg', 0.8);
            };
            img.onerror = () => resolve(file);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
}

// --- UI Utilities ---
window.showToast = function (message, type = "success") {
  const existing = document.getElementById("custom-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "custom-toast";
  toast.className =
    "fixed bottom-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-xl font-medium text-white transition-all duration-300 transform translate-y-full opacity-0 flex items-center gap-2";

  let icon = "info";
  if (type === "success") {
    toast.classList.add("bg-green-600", "dark:bg-green-700");
    icon = "check_circle";
  } else if (type === "error") {
    toast.classList.add("bg-red-600", "dark:bg-red-700");
    icon = "error";
  } else {
    toast.classList.add("bg-gray-800", "dark:bg-gray-700");
  }

  toast.innerHTML = `<span class="material-symbols-outlined">${icon}</span> <span>${escapeHtml(message)}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.remove("translate-y-full", "opacity-0"), 10);
  setTimeout(() => {
    toast.classList.add("translate-y-full", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

window.showConfirm = function (message, onConfirm) {
  const existing = document.getElementById("custom-confirm-modal");
  if (existing) existing.remove();

  const modalHtml = `
        <div id="custom-confirm-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-300">
            <div class="bg-white dark:bg-surface-card w-full max-w-sm rounded-2xl shadow-2xl p-6 transform scale-95 transition-transform duration-300">
                <div class="flex items-center gap-4 mb-4 text-slate-900 dark:text-white">
                    <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-500 flex-shrink-0">
                        <span class="material-symbols-outlined text-[24px]">warning</span>
                    </div>
                    <h3 class="text-lg font-bold">Are you sure?</h3>
                </div>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-6 ml-16">${escapeHtml(message)}</p>
                <div class="flex justify-end gap-3">
                    <button id="confirm-cancel-btn" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">Cancel</button>
                    <button id="confirm-ok-btn" class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Confirm</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
  const modal = document.getElementById("custom-confirm-modal");
  const inner = modal.querySelector("div");

  setTimeout(() => {
    modal.classList.remove("opacity-0");
    inner.classList.remove("scale-95");
  }, 10);

  const closeModal = () => {
    modal.classList.add("opacity-0");
    inner.classList.add("scale-95");
    setTimeout(() => modal.remove(), 300);
  };

  document.getElementById("confirm-cancel-btn").addEventListener("click", closeModal);
  document.getElementById("confirm-ok-btn").addEventListener("click", () => {
    closeModal();
    onConfirm();
  });
};

// DOM Elements
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const userInfo = document.getElementById("user-info");
const userEmailSpan = document.getElementById("user-email");

const tabProducts = document.getElementById("tab-products");
const tabBrands = document.getElementById("tab-brands");
const tabCategories = document.getElementById("tab-categories");
const tabInquiries = document.getElementById("tab-inquiries");
const tabSettings = document.getElementById("tab-settings");

const viewProducts = document.getElementById("view-products");
const viewBrands = document.getElementById("view-brands");
const viewCategories = document.getElementById("view-categories");
const viewInquiries = document.getElementById("view-inquiries");
const viewSettings = document.getElementById("view-settings");

const productModal = document.getElementById("product-modal");
const productForm = document.getElementById("product-form");
const brandModal = document.getElementById("brand-modal");
const brandForm = document.getElementById("brand-form");
const categoryModal = document.getElementById("category-modal");
const categoryForm = document.getElementById("category-form");

function updateTranslations() {
  const lang = localStorage.getItem("language") || "en";
  const translations = window.translationsData;
  if (!translations) return;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      if (el.tagName === "INPUT" && el.getAttribute("placeholder")) {
        el.placeholder = translations[lang][key];
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });

  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

async function initAdmin() {
  // Load translations
  try {
    const res = await fetch("data/translations.json");
    window.translationsData = await res.json();
    updateTranslations();
  } catch (e) {
    console.error("Failed to load translations", e);
  }

  window.supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      currentUser = session.user;
      showDashboard();
    } else {
      currentUser = null;
      showLogin();
    }
  });

  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document.getElementById("logout-btn").addEventListener("click", handleLogout);

  tabProducts.addEventListener("click", () => switchTab("products"));
  tabBrands.addEventListener("click", () => switchTab("brands"));
  tabCategories.addEventListener("click", () => switchTab("categories"));
  tabInquiries.addEventListener("click", () => switchTab("inquiries"));
  tabSettings.addEventListener("click", () => switchTab("settings"));

  document.getElementById("filter-inquiries")?.addEventListener("change", filterInquiries);

  document.getElementById("add-product-btn").addEventListener("click", () => openModal());
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  productForm.addEventListener("submit", handleSaveProduct);

  document.getElementById("add-brand-btn").addEventListener("click", () => openBrandModal());
  document.getElementById("brand-modal-close").addEventListener("click", closeBrandModal);
  document.getElementById("brand-modal-cancel").addEventListener("click", closeBrandModal);
  brandForm.addEventListener("submit", handleSaveBrand);

  document.getElementById("add-category-btn").addEventListener("click", () => openCategoryModal());
  document.getElementById("category-modal-close").addEventListener("click", closeCategoryModal);
  document.getElementById("category-modal-cancel").addEventListener("click", closeCategoryModal);
  categoryForm.addEventListener("submit", handleSaveCategory);

  document.getElementById("order-mode-inventory").addEventListener("click", () => switchOrderMode("inventory"));
  document.getElementById("order-mode-home").addEventListener("click", () => switchOrderMode("home"));
  document.getElementById("save-order-btn").addEventListener("click", handleSaveOrder);

  document.getElementById("settings-form").addEventListener("submit", handleSaveSettings);

  document.getElementById("p-gallery").addEventListener("change", handleGalleryUpload);
  document.getElementById("add-color-variant-btn").addEventListener("click", () => addColorVariant());
}

async function handleGalleryUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    showToast(`Uploading ${files.length} images...`);

    try {
        const urls = [];
        for (const rawFile of files) {
            const file = await compressImageClient(rawFile);
            const path = `gallery/${Date.now()}-${sanitizeFilename(file.name)}`;
            const { error } = await window.supabase.storage.from("vehicle-images").upload(path, file, { upsert: true });
            if (error) throw error;
            urls.push(window.supabase.storage.from("vehicle-images").getPublicUrl(path).data.publicUrl);
        }

        currentGallery = [...currentGallery, ...urls];
        renderGalleryPreview();
        showToast("Gallery updated");
    } catch (err) {
        console.error('Gallery upload error:', err);
        showToast("Upload failed: " + (err.message || err), "error");
    }
}

function renderGalleryPreview() {
    const container = document.getElementById("gallery-preview-container");
    container.innerHTML = currentGallery.map((url, idx) => `
        <div class="relative group aspect-video rounded-lg overflow-hidden border border-outline-variant cursor-move" draggable="true" ondragstart="handleGalleryDragStart(event, ${idx})" ondrop="handleGalleryDrop(event, ${idx})" ondragover="event.preventDefault()">
            <img src="${escapeHtml(optimizeImage(url, 400))}" class="w-full h-full object-cover">
            <button type="button" onclick="removeGalleryImage(${idx})" class="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="material-symbols-outlined text-sm">close</span>
            </button>
        </div>
    `).join('');
}

window.removeGalleryImage = (idx) => {
    currentGallery.splice(idx, 1);
    renderGalleryPreview();
};

let galleryDragIdx = null;
window.handleGalleryDragStart = (e, idx) => {
    galleryDragIdx = idx;
};

window.handleGalleryDrop = (e, idx) => {
    e.preventDefault();
    const item = currentGallery.splice(galleryDragIdx, 1)[0];
    currentGallery.splice(idx, 0, item);
    renderGalleryPreview();
};

// --- Order Management ---
function switchOrderMode(mode) {
  if (isOrderChanged && !confirm("Unsaved changes. Switch anyway?")) return;
  currentOrderMode = mode;
  const invBtn = document.getElementById("order-mode-inventory");
  const homeBtn = document.getElementById("order-mode-home");

  if (mode === "inventory") {
    invBtn.classList.add("bg-primary", "text-white");
    homeBtn.classList.remove("bg-primary", "text-white");
  } else {
    homeBtn.classList.add("bg-primary", "text-white");
    invBtn.classList.remove("bg-primary", "text-white");
  }
  loadProducts();
}

async function handleSaveOrder() {
  const btn = document.getElementById("save-order-btn");
  btn.disabled = true;
  try {
    const type = currentOrderMode === "home" ? "spotlight" : "explore";
    await Promise.all(currentProducts.map((p, index) => window.productsDb.updateOrder(p.id, type, index)));
    showToast("Order saved successfully!");
    isOrderChanged = false;
    updateSaveOrderBtnVisibility();
  } catch (err) {
    showToast("Failed to save order", "error");
  } finally { btn.disabled = false; }
}

function updateSaveOrderBtnVisibility() {
  const btn = document.getElementById("save-order-btn");
  if (isOrderChanged) btn.classList.remove("hidden");
  else btn.classList.add("hidden");
}

// --- Auth ---
function showLogin() {
  loginSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
  userInfo.classList.add("hidden");
}
function showDashboard() {
  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  userInfo.classList.remove("hidden");
  userEmailSpan.textContent = currentUser.email;
  loadProducts();
}
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await window.supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const errDiv = document.getElementById("login-error");
    errDiv.textContent = error.message;
    errDiv.classList.remove("hidden");
  }
}
async function handleLogout() { await window.supabase.auth.signOut(); }

// --- Tabs ---
function switchTab(tab) {
  [viewProducts, viewBrands, viewCategories, viewInquiries, viewSettings].forEach(v => v.classList.add("hidden"));
  [tabProducts, tabBrands, tabCategories, tabInquiries, tabSettings].forEach(t => t.classList.remove("border-primary", "text-primary"));

  if (tab === "products") { viewProducts.classList.remove("hidden"); tabProducts.classList.add("border-primary", "text-primary"); loadProducts(); }
  else if (tab === "brands") { viewBrands.classList.remove("hidden"); tabBrands.classList.add("border-primary", "text-primary"); loadBrands(); }
  else if (tab === "categories") { viewCategories.classList.remove("hidden"); tabCategories.classList.add("border-primary", "text-primary"); loadCategories(); }
  else if (tab === "inquiries") { viewInquiries.classList.remove("hidden"); tabInquiries.classList.add("border-primary", "text-primary"); loadInquiries(); }
  else if (tab === "settings") { viewSettings.classList.remove("hidden"); tabSettings.classList.add("border-primary", "text-primary"); loadSettings(); }
}

// --- Products ---
async function loadProducts() {
  const tbody = document.getElementById("products-table-body");
  tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4">Loading...</td></tr>';
  try {
    const data = currentOrderMode === 'home' ? await window.productsDb.getSpotlight() : await window.productsDb.getAll();
    currentProducts = data;
    renderProducts(data);
    isOrderChanged = false;
    updateSaveOrderBtnVisibility();
  } catch (e) {
    console.error("Error loading products:", e);
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-red-500 py-4">Error loading products</td></tr>';
    return;
  }

  // Refresh modal lists cache - separate try/catch so it doesn't break product loading
  try {
    const [brands, categories] = await Promise.all([
      window.brandsDb.getAll(),
      window.categoriesDb.getAll()
    ]);
    currentBrands = brands;
    currentCategories = categories;
  } catch (e) {
    console.error("Error refreshing brands/categories cache:", e);
  }
}

function renderProducts(products) {
  const tbody = document.getElementById("products-table-body");
  if (products.length === 0) { tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4">No products found</td></tr>'; return; }
  tbody.innerHTML = products.map((p, idx) => `
    <tr draggable="true" ondragstart="window.handleProductDragStart(event)" data-index="${idx}" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-move">
      <td class="px-6 py-4"><span class="material-symbols-outlined text-gray-400">drag_indicator</span></td>
      <td class="px-6 py-4" data-label="Preview"><img src="${escapeHtml(optimizeImage(p.image_url, 400))}" class="h-10 w-16 object-cover rounded"></td>
      <td class="px-6 py-4 font-medium" data-label="Vehicle">${escapeHtml(p.name)}<br><span class="text-xs text-gray-500">${escapeHtml(p.name_ar || '')}</span></td>
      <td class="px-6 py-4" data-label="Sold"><input type="checkbox" ${p.is_sold_out ? 'checked' : ''} onchange="toggleSoldOut(${p.id}, this)" class="rounded text-primary"></td>
      <td class="px-6 py-4" data-label="Price">${p.is_upon_request ? 'Upon Request' : (escapeHtml(p.price_egp?.toLocaleString()) + ' L.E')}</td>
      <td class="px-6 py-4" data-label="Category"><span class="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-xs">${escapeHtml(p.category)}</span></td>
      <td class="px-6 py-4" data-label="Brand">${escapeHtml(p.brands?.name || '-')}</td>
      <td class="px-6 py-4" data-label="Visibility">${p.is_spotlight ? '<span class="text-green-500 font-bold">Spotlight</span>' : 'Standard'}</td>
      <td class="px-6 py-4 text-right">
        <button onclick="editProduct(${p.id})" class="text-blue-500 mr-3">Edit</button>
        <button onclick="deleteProduct(${p.id})" class="text-red-500">Delete</button>
      </td>
    </tr>
  `).join('');
}

window.handleProductDragStart = function(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.index);
};
document.getElementById("products-table-body")?.addEventListener("dragover", e => e.preventDefault());
document.getElementById("products-table-body")?.addEventListener("drop", e => {
    e.preventDefault();
    const fromIdx = parseInt(e.dataTransfer.getData("text/plain"));
    const toIdx = parseInt(e.target.closest("tr").dataset.index);
    if (fromIdx === toIdx) return;
    const item = currentProducts.splice(fromIdx, 1)[0];
    currentProducts.splice(toIdx, 0, item);
    isOrderChanged = true;
    renderProducts(currentProducts);
    updateSaveOrderBtnVisibility();
});

window.toggleSoldOut = async (id, cb) => {
    try { await window.productsDb.update(id, { is_sold_out: cb.checked }); showToast("Status updated"); }
    catch (e) { cb.checked = !cb.checked; showToast("Update failed", "error"); }
};

window.editProduct = (id) => { const p = currentProducts.find(x => x.id === id); if (p) openModal(p); };
window.deleteProduct = (id) => showConfirm("Delete this vehicle?", async () => {
    try { await window.productsDb.delete(id); showToast("Deleted"); loadProducts(); }
    catch (e) { showToast("Delete failed", "error"); }
});

// --- Color Variants ---
function addColorVariant(variant = null) {
    const idx = currentColorVariants.length;
    const v = variant || { name: '', name_ar: '', hex: '#888888', gallery: [] };
    currentColorVariants.push(v);
    renderColorVariants();
    // Scroll to the new variant
    setTimeout(() => {
        const cards = document.querySelectorAll('.color-variant-card');
        if (cards.length) cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
}

function renderColorVariants() {
    const container = document.getElementById('color-variants-container');
    if (!container) return;
    container.innerHTML = currentColorVariants.map((v, idx) => `
        <div class="color-variant-card admin-card rounded-xl p-5 space-y-4" data-idx="${idx}">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-7 h-7 rounded-full border-2 border-white/20 shadow-lg flex-shrink-0" style="background:${escapeHtml(v.hex)}"></div>
                    <span class="text-sm font-bold text-on-surface">${escapeHtml(v.name) || 'New Color'}</span>
                </div>
                <button type="button" onclick="removeColorVariant(${idx})" class="text-red-500 hover:text-red-400 transition-colors">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                <div>
                    <label class="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Color</label>
                    <div class="flex gap-2 items-center">
                        <input type="color" value="${escapeHtml(v.hex)}" onchange="updateColorVariant(${idx}, 'hex', this.value); this.nextElementSibling.value = this.value" class="h-10 w-10 rounded cursor-pointer border-none bg-transparent p-0 flex-shrink-0" style="background:none" />
                        <input type="text" value="${escapeHtml(v.hex)}" placeholder="#000000" onchange="updateColorVariant(${idx}, 'hex', this.value); this.previousElementSibling.value = this.value; document.querySelector('[data-idx=\'${idx}\'] .color-preview').style.background = this.value" maxlength="7" class="flex-grow rounded px-2 py-2 text-xs font-mono" />
                    </div>
                </div>
                <div>
                    <label class="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Name (EN)</label>
                    <input type="text" value="${escapeHtml(v.name)}" placeholder="e.g. Midnight Black" onchange="updateColorVariant(${idx}, 'name', this.value)" class="w-full rounded px-3 py-2 text-sm" />
                </div>
                <div>
                    <label class="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Name (AR)</label>
                    <input type="text" value="${escapeHtml(v.name_ar)}" placeholder="اسم اللون" dir="rtl" onchange="updateColorVariant(${idx}, 'name_ar', this.value)" class="w-full rounded px-3 py-2 text-sm" />
                </div>
                <div>
                    <label class="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Gallery (${v.gallery.length} imgs)</label>
                    <label class="block w-full cursor-pointer">
                        <input type="file" accept="image/*" multiple class="hidden" onchange="handleVariantGalleryUpload(${idx}, this)" />
                        <span class="flex items-center gap-1 text-xs font-bold text-primary border border-primary/30 px-3 py-2 rounded hover:bg-primary/10 transition-colors">
                            <span class="material-symbols-outlined text-[14px]">add_a_photo</span> Upload
                        </span>
                    </label>
                </div>
            </div>
            ${v.gallery.length ? `
            <div class="grid grid-cols-4 md:grid-cols-6 gap-2">
                ${v.gallery.map((url, gi) => `
                    <div class="relative group aspect-video rounded overflow-hidden border border-outline-variant">
                        <img src="${escapeHtml(optimizeImage(url, 400))}" class="w-full h-full object-cover">
                        <button type="button" onclick="removeVariantGalleryImage(${idx}, ${gi})" class="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="material-symbols-outlined text-xs">close</span>
                        </button>
                    </div>
                `).join('')}
            </div>` : ''}
        </div>
    `).join('');
}

window.updateColorVariant = (idx, field, value) => {
    if (currentColorVariants[idx]) {
        currentColorVariants[idx][field] = value;
        // Update the preview circle in the card header live
        const card = document.querySelector(`.color-variant-card[data-idx="${idx}"]`);
        if (card && field === 'hex') {
            const circle = card.querySelector('.rounded-full');
            if (circle) circle.style.background = value;
        }
        if (card && field === 'name') {
            const nameEl = card.querySelector('span.text-sm.font-bold');
            if (nameEl) nameEl.textContent = value || 'New Color';
        }
    }
};

window.removeColorVariant = (idx) => {
    currentColorVariants.splice(idx, 1);
    renderColorVariants();
};

window.removeVariantGalleryImage = (variantIdx, imgIdx) => {
    currentColorVariants[variantIdx].gallery.splice(imgIdx, 1);
    renderColorVariants();
};

window.handleVariantGalleryUpload = async (variantIdx, input) => {
    const files = Array.from(input.files);
    if (!files.length) return;
    showToast(`Uploading ${files.length} image(s)...`);
    try {
        const urls = [];
        for (const rawFile of files) {
            const file = await compressImageClient(rawFile);
            const path = `gallery/${Date.now()}-${sanitizeFilename(file.name)}`;
            const { error } = await window.supabase.storage.from('vehicle-images').upload(path, file, { upsert: true });
            if (error) throw error;
            urls.push(window.supabase.storage.from('vehicle-images').getPublicUrl(path).data.publicUrl);
        }
        currentColorVariants[variantIdx].gallery = [...currentColorVariants[variantIdx].gallery, ...urls];
        renderColorVariants();
        showToast('Gallery updated');
    } catch (err) {
        showToast('Upload failed', 'error');
    }
};

async function handleSaveProduct(e) {
    e.preventDefault();
    const btn = document.getElementById("save-btn");
    btn.disabled = true;
    try {
        const payload = {
            name: document.getElementById("p-name").value,
            name_ar: document.getElementById("p-name-ar").value,
            price_egp: parseFloat(document.getElementById("p-price").value),
            discount_price: document.getElementById("p-discount").value ? parseFloat(document.getElementById("p-discount").value) : null,
            category: document.getElementById("p-category").value,
            origin: document.getElementById("p-origin").value,
            brand_id: parseInt(document.getElementById("p-brand-id").value),
            is_spotlight: document.getElementById("p-featured").checked,
            is_upon_request: document.getElementById("p-upon-request").checked,
            is_sold_out: document.getElementById("p-sold-out").checked,
            description: document.getElementById("p-desc").value,
            description_ar: document.getElementById("p-desc-ar").value,
            mileage: document.getElementById("p-mileage").value,
            transmission: document.getElementById("p-trans").value,
            fuel_type: document.getElementById("p-fuel").value,
            version: document.getElementById("p-version").value,
            color_variants: currentColorVariants
        };

        let file = document.getElementById("p-image").files[0];
        if (file) {
            file = await compressImageClient(file);
            const path = `public/${Date.now()}-${sanitizeFilename(file.name)}`;
            const { error } = await window.supabase.storage.from("vehicle-images").upload(path, file, { upsert: true });
            if (error) throw error;
            payload.image_url = window.supabase.storage.from("vehicle-images").getPublicUrl(path).data.publicUrl;
        }

        const diag = document.getElementById("p-diagnostics").files[0];
        if (diag) {
            const path = `diagnostics/${Date.now()}-${sanitizeFilename(diag.name)}`;
            const { error } = await window.supabase.storage.from("vehicle-images").upload(path, diag, { upsert: true });
            if (error) throw error;
            payload.diagnostics_url = window.supabase.storage.from("vehicle-images").getPublicUrl(path).data.publicUrl;
        }

        payload.gallery = currentGallery;

        if (editingId) await window.productsDb.update(editingId, payload);
        else await window.productsDb.create(payload);

        showToast("Vehicle saved successfully!", "success");
        closeModal();
        loadProducts();
    } catch (err) { showToast("Save failed", "error"); }
    finally { btn.disabled = false; }
}

function openModal(p = null) {
    editingId = p ? p.id : null;
    productForm.reset();
    currentGallery = p?.gallery || [];
    renderGalleryPreview();

    // Load color variants
    let rawVariants = p?.color_variants || [];
    if (typeof rawVariants === 'string') {
        try { rawVariants = JSON.parse(rawVariants); } catch(e) { rawVariants = []; }
    }
    currentColorVariants = rawVariants.map(v => ({
        name: v.name || '',
        name_ar: v.name_ar || '',
        hex: v.hex || '#888888',
        gallery: Array.isArray(v.gallery) ? v.gallery : []
    }));
    renderColorVariants();

    // Populate dynamic categories
    const catSelect = document.getElementById("p-category");
    if (catSelect) {
        catSelect.innerHTML = currentCategories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }

    document.getElementById("modal-title").textContent = p ? "Edit Vehicle" : "Add Vehicle";

    const mainImgPreview = document.getElementById("p-main-preview");
    if (p?.image_url) {
        document.getElementById("p-main-img").src = p.image_url;
        mainImgPreview.classList.remove("hidden");
    } else {
        mainImgPreview.classList.add("hidden");
    }

    if (p) {
        document.getElementById("p-name").value = p.name || "";
        document.getElementById("p-name-ar").value = p.name_ar || "";
        document.getElementById("p-price").value = p.price_egp || "";
        document.getElementById("p-discount").value = p.discount_price || "";
        document.getElementById("p-category").value = p.category || "";
        document.getElementById("p-origin").value = p.origin || "";
        document.getElementById("p-brand-id").value = p.brand_id || "";
        document.getElementById("p-featured").checked = p.is_spotlight || false;
        document.getElementById("p-upon-request").checked = p.is_upon_request || false;
        document.getElementById("p-sold-out").checked = p.is_sold_out || false;
        document.getElementById("p-desc").value = p.description || "";
        document.getElementById("p-desc-ar").value = p.description_ar || "";
        document.getElementById("p-mileage").value = p.mileage || "";
        document.getElementById("p-trans").value = p.transmission || "";
        document.getElementById("p-fuel").value = p.fuel_type || "";
        document.getElementById("p-version").value = p.version || "";
    }
    renderBrandSelector(p ? p.brand_id : null);
    productModal.classList.remove("hidden");
}
function closeModal() { productModal.classList.add("hidden"); }

function renderBrandSelector(selectedId) {
    const container = document.getElementById("p-brand-container");
    container.innerHTML = currentBrands.map(b => `
        <button type="button" onclick="selectBrand(${b.id})" class="brand-btn p-2 border-2 rounded ${selectedId == b.id ? 'border-primary' : 'border-transparent'}">
            <img src="${escapeHtml(optimizeImage(b.logo_url, 300))}" class="h-8 w-12 object-contain">
        </button>
    `).join('');
}
window.selectBrand = (id) => {
    document.getElementById("p-brand-id").value = id;
    document.querySelectorAll(".brand-btn").forEach(btn => btn.classList.remove("border-primary"));
    event.currentTarget.classList.add("border-primary");
};

// --- Categories ---
let editingCategoryId = null;
async function loadCategories() {
    try { currentCategories = await window.categoriesDb.getAll(); renderCategories(currentCategories); }
    catch (e) {
        console.error("Error loading categories:", e);
        showToast("Error loading categories", "error");
    }
}
function renderCategories(categories) {
    const tbody = document.getElementById("categories-table-body");
    tbody.innerHTML = categories.map(c => `
        <tr>
            <td class="px-8 py-5 font-medium" data-label="Category">${escapeHtml(c.name)}<br><span class="text-xs text-gray-500">${escapeHtml(c.name_ar || '')}</span></td>
            <td class="px-8 py-5 text-right">
                <button onclick="editCategory(${c.id})" class="text-blue-500 mr-3">Edit</button>
                <button onclick="deleteCategory(${c.id})" class="text-red-500">Delete</button>
            </td>
        </tr>
    `).join('');
}
window.editCategory = (id) => { const c = currentCategories.find(x => x.id === id); if (c) openCategoryModal(c); };
window.deleteCategory = (id) => showConfirm("Delete category?", async () => {
    try { await window.categoriesDb.delete(id); showToast("Deleted"); loadCategories(); }
    catch (e) { showToast("Delete failed", "error"); }
});
async function handleSaveCategory(e) {
    e.preventDefault();
    const btn = document.getElementById("save-category-btn");
    btn.disabled = true;
    try {
        const payload = {
            name: document.getElementById("cat-name").value,
            name_ar: document.getElementById("cat-name-ar").value
        };
        if (editingCategoryId) await window.categoriesDb.update(editingCategoryId, payload);
        else await window.categoriesDb.create(payload);
        showToast("Category saved");
        closeCategoryModal();
        loadCategories();
    } catch (e) { showToast("Save failed", "error"); }
    finally { btn.disabled = false; }
}
function openCategoryModal(c = null) {
    editingCategoryId = c ? c.id : null;
    categoryForm.reset();
    document.getElementById("category-modal-title").textContent = c ? "Edit Category" : "Add Category";
    if (c) {
        document.getElementById("cat-name").value = c.name;
        document.getElementById("cat-name-ar").value = c.name_ar;
    }
    categoryModal.classList.remove("hidden");
}
function closeCategoryModal() { categoryModal.classList.add("hidden"); }

// --- Brands ---
async function loadBrands() {
    try { currentBrands = await window.brandsDb.getAll(); renderBrands(currentBrands); }
    catch (e) {
        console.error("Error loading brands:", e);
        showToast("Error loading brands", "error");
    }
}
function renderBrands(brands) {
    const tbody = document.getElementById("brands-table-body");
    tbody.innerHTML = brands.map(b => `
        <tr>
            <td class="px-6 py-4" data-label="Logo"><img src="${escapeHtml(optimizeImage(b.logo_url, 300))}" class="h-10 w-16 object-contain"></td>
            <td class="px-6 py-4" data-label="Name">${escapeHtml(b.name)}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="editBrand(${b.id})" class="text-blue-500 mr-3">Edit</button>
                <button onclick="deleteBrand(${b.id})" class="text-red-500">Delete</button>
            </td>
        </tr>
    `).join('');
}
window.editBrand = (id) => { const b = currentBrands.find(x => x.id === id); if (b) openBrandModal(b); };
window.deleteBrand = (id) => showConfirm("Delete brand?", async () => {
    try { await window.brandsDb.delete(id); showToast("Deleted"); loadBrands(); }
    catch (e) { showToast("Delete failed", "error"); }
});
async function handleSaveBrand(e) {
    e.preventDefault();
    const btn = document.getElementById("save-brand-btn");
    btn.disabled = true;
    try {
        const payload = { name: document.getElementById("b-name").value };
        let file = document.getElementById("b-logo").files[0];
        if (file) {
            file = await compressImageClient(file);
            const path = `brands/${Date.now()}-${sanitizeFilename(file.name)}`;
            const { error } = await window.supabase.storage.from("vehicle-images").upload(path, file, { upsert: true });
            if (error) throw error;
            payload.logo_url = window.supabase.storage.from("vehicle-images").getPublicUrl(path).data.publicUrl;
        }
        if (editingBrandId) await window.brandsDb.update(editingBrandId, payload);
        else await window.brandsDb.create(payload);
        showToast("Brand saved");
        closeBrandModal();
        loadBrands();
    } catch (e) { showToast("Save failed", "error"); }
    finally { btn.disabled = false; }
}
function openBrandModal(b = null) {
    editingBrandId = b ? b.id : null;
    brandForm.reset();
    document.getElementById("brand-modal-title").textContent = b ? "Edit Brand" : "Add Brand";
    if (b) {
        document.getElementById("b-name").value = b.name;
        document.getElementById("b-logo-img").src = b.logo_url;
        document.getElementById("b-logo-preview").classList.remove("hidden");
    } else {
        document.getElementById("b-logo-preview").classList.add("hidden");
    }
    brandModal.classList.remove("hidden");
}
function closeBrandModal() { brandModal.classList.add("hidden"); }

// --- Inquiries ---
async function loadInquiries() {
    try { currentInquiries = await window.messagesDb.getAll(); filterInquiries(); }
    catch (e) {
        console.error("Error loading messages:", e);
        showToast("Error loading messages", "error");
    }
}
function filterInquiries() {
    const filter = document.getElementById("filter-inquiries").value;
    const filtered = currentInquiries.filter(i => filter === 'all' || (filter === 'unread' && !i.is_read) || (filter === 'read' && i.is_read));
    renderInquiries(filtered);
}
function renderInquiries(inqs) {
    const tbody = document.getElementById("inquiries-table-body");
    tbody.innerHTML = inqs.map(i => `
        <tr class="${i.is_read ? 'opacity-50' : ''}">
            <td class="px-6 py-4" data-label="Read"><input type="checkbox" ${i.is_read ? 'checked' : ''} onchange="toggleRead(${i.id}, this)" class="rounded text-primary"></td>
            <td class="px-6 py-4 text-xs" data-label="Date">${new Date(i.created_at).toLocaleDateString()}</td>
            <td class="px-6 py-4 font-medium" data-label="Customer">${escapeHtml(i.name)}</td>
            <td class="px-6 py-4 text-sm" data-label="Contact">${escapeHtml(i.email)}<br>${escapeHtml(i.phone || '')}</td>
            <td class="px-6 py-4 text-sm" data-label="Subject">${escapeHtml(i.subject || '-')}</td>
            <td class="px-6 py-4 text-sm truncate max-w-xs" data-label="Message" onclick="alert(this.textContent)">${escapeHtml(i.message)}</td>
            <td class="px-6 py-4 text-right"><button onclick="deleteInquiry(${i.id})" class="text-red-500">Delete</button></td>
        </tr>
    `).join('');
}
window.toggleRead = async (id, cb) => {
    try { if (cb.checked) await window.messagesDb.markAsRead(id); loadInquiries(); }
    catch (e) { cb.checked = !cb.checked; }
};
window.deleteInquiry = (id) => showConfirm("Delete inquiry?", async () => {
    try { await window.messagesDb.delete(id); showToast("Deleted"); loadInquiries(); }
    catch (e) { showToast("Delete failed", "error"); }
});

// --- Settings ---
async function loadSettings() {
    try {
        const s = await window.settingsDb.getAll();
        document.getElementById("setting-egp-usd").value = s.exchange_rate || "50";
        document.getElementById("setting-location-pin").value = s.location_pin || "";
        document.getElementById("setting-map-embed").value = s.map_iframe_source || "";
        document.getElementById("current-hero-image").textContent = s.hero_image ? "Set" : "Not set";

        const social = ['tiktok', 'facebook', 'instagram', 'whatsapp', 'phone'];
        social.forEach(type => {
            const container = document.querySelector(`#container-social-${type} .social-links-list`);
            container.innerHTML = "";
            const val = s[`${type}_${(type==='phone'||type==='whatsapp')?'number':'link'}`];
            if (val) {
                let links = []; try { links = JSON.parse(val); } catch(e) { links = [val]; }
                if (Array.isArray(links)) links.forEach(l => addSocialLink(type, l));
            }
        });
    } catch (e) {
        console.error("Error loading settings:", e);
        showToast("Error loading settings", "error");
    }
}
async function handleSaveSettings(e) {
    e.preventDefault();
    const btn = document.getElementById("save-settings-btn");
    btn.disabled = true;
    try {
        const updates = [
            { key: "exchange_rate", value: document.getElementById("setting-egp-usd").value },
            { key: "location_pin", value: document.getElementById("setting-location-pin").value },
            { key: "map_iframe_source", value: document.getElementById("setting-map-embed").value }
        ];

        ['tiktok', 'facebook', 'instagram', 'whatsapp', 'phone'].forEach(type => {
            const container = document.querySelector(`#container-social-${type} .social-links-list`);
            const links = Array.from(container.querySelectorAll("input")).map(i => i.value.trim()).filter(v => v);
            const key = (type === 'whatsapp' || type === 'phone') ? `${type}_number` : `${type}_link`;
            updates.push({ key, value: JSON.stringify(links) });
        });

        const hero = document.getElementById("setting-hero-image").files[0];
        if (hero) {
            const path = `settings/hero-${Date.now()}-${sanitizeFilename(hero.name)}`;
            const { error } = await window.supabase.storage.from("vehicle-images").upload(path, hero, { upsert: true });
            if (error) throw error;
            updates.push({ key: "hero_image", value: window.supabase.storage.from("vehicle-images").getPublicUrl(path).data.publicUrl });
        }

        await window.settingsDb.updateMultiple(updates);
        showToast("Settings saved");
        loadSettings();
    } catch (e) { showToast("Save failed", "error"); }
    finally { btn.disabled = false; }
}

window.addSocialLink = function(type, val = "") {
    const container = document.querySelector(`#container-social-${type} .social-links-list`);
    const div = document.createElement("div");
    div.className = "flex gap-2 mb-2";
    div.innerHTML = `
        <input type="text" value="${val}" class="flex-grow rounded border border-gray-300 dark:border-white/10 p-2 bg-transparent">
        <button type="button" onclick="this.parentElement.remove()" class="text-red-500">X</button>
    `;
    container.appendChild(div);
};


// Exports for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadSettings,
    handleSaveSettings,
    handleSaveProduct,
    renderProducts,
    escapeHtml
  };
}
