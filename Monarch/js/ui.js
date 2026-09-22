/* js/ui.js
   Small, reusable presentation helpers shared by every feature.
   No feature-specific logic lives here on purpose (Rule 4: keep UI separate
   from feature logic). */

/** Format a number as Indian-Rupee currency, e.g. 68999 -> "₹68,999" */
function formatCurrency(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

/** Build a "★★★★☆" style string for a 0-5 rating. */
function renderStars(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

/** Flatten storeData (categories -> subcategories -> products) into one array.
 *  Every feature works off this flat list instead of re-walking the tree. */
function getAllProducts() {
  const all = [];
  storeData.categories.forEach((category) => {
    category.subcategories.forEach((sub) => {
      sub.products.forEach((product) => all.push(product));
    });
  });
  return all;
}

/** O(1) product lookup by id, built once and reused. */
const PRODUCTS_BY_ID = new Map(getAllProducts().map((p) => [p.id, p]));
function getProductById(id) {
  return PRODUCTS_BY_ID.get(id);
}

/** Tiny toast notification, auto-dismisses. */
let toastTimer = null;
function showToast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 1800);
}

/** Build a single product card element. onAdd receives the product. */
function buildProductCard(product, onAdd) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <span class="brand-tag">${product.brand}</span>
    <h3>${product.name}</h3>
    <div class="price-row">
      <span class="price">${formatCurrency(product.price)}</span>
      ${
        product.originalPrice > product.price
          ? `<span class="price-strike">${formatCurrency(product.originalPrice)}</span>`
          : ""
      }
    </div>
    <div class="rating-row"><span class="stars">${renderStars(product.rating)}</span> ${product.rating} · ${product.reviews.toLocaleString("en-IN")} reviews</div>
    <div class="card-footer">
      <span class="stock-note">${product.stock > 0 ? product.stock + " in stock" : "Out of stock"}</span>
      <button class="btn btn-primary btn-sm" ${product.stock === 0 ? "disabled" : ""}>Add to cart</button>
    </div>
  `;
  card.querySelector("button").addEventListener("click", () => onAdd(product));
  return card;
}
