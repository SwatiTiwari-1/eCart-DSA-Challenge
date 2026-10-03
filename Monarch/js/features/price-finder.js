/* js/features/price-finder.js
   Challenge 1 — Smart Price Finder (Binary Search)
   -------------------------------------------------------------------------
   Initial (naive) approach:
     Scan every product and compute |price - target| for each one (or check
     min <= price <= max for a range), keeping whatever matches.
       Time  : O(n) per search.
       Space : O(1) extra.

   Optimized approach (used here):
     Products are sorted once by price ascending (O(n log n), done a single
     time up front). Every search then exploits that order:
       - Closest-to-target: binary search locates where the target would
         sit in the sorted array (O(log n)), then a two-pointer expansion
         outward collects the k closest by price difference (O(k)).
       - Price range: two binary searches find the lower and upper bounds
         of the range (O(log n) each); matches are just the array slice
         between them (O(m) to read out m results) — no full scan needed.
       Time  : O(log n + k) for closest-price, O(log n + m) for a range,
               versus O(n) for the naive scan.
       Space : O(n) once for the sorted array, shared by every search.
   ------------------------------------------------------------------------- */

const PRODUCTS_BY_PRICE = getAllProducts().slice().sort((a, b) => a.price - b.price);

/** Index of the first product whose price is >= target. */
function lowerBound(target) {
  let lo = 0, hi = PRODUCTS_BY_PRICE.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (PRODUCTS_BY_PRICE[mid].price < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Index just past the last product whose price is <= target. */
function upperBound(target) {
  let lo = 0, hi = PRODUCTS_BY_PRICE.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (PRODUCTS_BY_PRICE[mid].price <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** k products whose price is closest to `target`. */
function findClosestByPrice(target, k = 5) {
  const n = PRODUCTS_BY_PRICE.length;
  if (n === 0) return [];

  let left = lowerBound(target) - 1;
  let right = left + 1;
  const result = [];

  while (result.length < k && (left >= 0 || right < n)) {
    const leftDiff = left >= 0 ? Math.abs(PRODUCTS_BY_PRICE[left].price - target) : Infinity;
    const rightDiff = right < n ? Math.abs(PRODUCTS_BY_PRICE[right].price - target) : Infinity;

    if (leftDiff <= rightDiff) {
      result.push(PRODUCTS_BY_PRICE[left]);
      left--;
    } else {
      result.push(PRODUCTS_BY_PRICE[right]);
      right++;
    }
  }
  return result;
}

/** Products priced between min and max (inclusive), via two binary searches. */
function findInPriceRange(min, max) {
  if (min > max) return [];
  const start = lowerBound(min);
  const end = upperBound(max);
  return PRODUCTS_BY_PRICE.slice(start, end);
}

function buildPriceResultCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <span class="brand-tag">${product.brand}</span>
    <h3>${product.name}</h3>
    <div class="price-row"><span class="price">${formatCurrency(product.price)}</span></div>
    <div class="rating-row"><span class="stars">${renderStars(product.rating)}</span> ${product.rating}</div>
    <div class="card-footer">
      <span class="stock-note">${product.category}</span>
      <button class="btn btn-primary btn-sm" data-action="view">View Product</button>
    </div>
  `;
  card.querySelector('[data-action="view"]').addEventListener("click", () => {
    showToast(`${product.name} — ${formatCurrency(product.price)}`);
  });
  return card;
}

function renderPriceResults(containerId, products, emptyMessage) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  // Edge case: zero results
  if (products.length === 0) {
    container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
    return;
  }
  products.forEach((p) => container.appendChild(buildPriceResultCard(p)));
}

function handleFindClosest() {
  const target = Number(document.getElementById("target-price-input").value);

  // Edge case: invalid input
  if (!Number.isFinite(target) || target < 0) {
    renderPriceResults("price-finder-results", [], "Enter a valid target price.");
    return;
  }

  renderPriceResults("price-finder-results", findClosestByPrice(target, 5), "No products found.");
}

function handleFindInRange() {
  const min = Number(document.getElementById("min-price-input").value);
  const max = Number(document.getElementById("max-price-input").value);

  // Edge case: invalid input
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < 0) {
    renderPriceResults("price-range-results", [], "Enter a valid price range.");
    return;
  }
  // Edge case: inverted range
  if (min > max) {
    renderPriceResults("price-range-results", [], "Minimum price can't be greater than maximum price.");
    return;
  }

  renderPriceResults("price-range-results", findInPriceRange(min, max), "No products found in this range.");
}
