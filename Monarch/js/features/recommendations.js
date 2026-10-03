/* js/features/recommendations.js
   Challenge 5 — Personalized Recommendations
   -------------------------------------------------------------------------
   data.js has no per-user browsing history, so a small set of *simulated*
   other-user sessions is hardcoded below — each session is one simulated
   user's list of products viewed together. This is the same kind of
   simulated attribute used for the shipping weight in Challenge 10.

   "Viewed" is approximated here by "added to cart" (reusing the Cart
   feature's `cart` object from cart.js). A product in the cart both
   (a) contributes to the current user's recommendation profile and
   (b) is automatically excluded from being recommended again — satisfying
   the follow-up rule ("don't recommend already-viewed/purchased items")
   with one signal instead of two separate tracking mechanisms.

   Approach (per the assignment's hint):
     Product -> users who viewed it -> other products those users viewed
     -> count frequency
   This is classic item-to-item collaborative filtering via co-occurrence
   counts, built once from the simulated sessions.

   Initial (naive) approach:
     On every recommendation request, re-scan every session from scratch
     looking for sessions containing a viewed product, and tally counts.
       Time  : O(sessions * itemsPerSession) per request.
       Space : O(1) extra (aside from the tally).

   Optimized approach (used here):
     Build a co-view map once up front: productId -> Map(otherProductId ->
     count). Every recommendation request then only touches the small
     number of entries for the products the current user has actually
     viewed.
       Time to build  : O(sessions * itemsPerSession^2), once at load.
       Time per request: O(v * d), where v = products the user has viewed
         and d = average number of products co-viewed with each — both
         small and independent of the total number of sessions.
       Space : O(p^2) worst case for the co-view map (p = distinct
         products that ever co-occur), sparser in practice.
   ------------------------------------------------------------------------- */

const SIMULATED_SESSIONS = [
  ["p-101", "p-301", "p-302", "p-303"],
  ["p-102", "p-301", "p-302", "p-304"],
  ["p-102", "p-301", "p-303"],
  ["p-103", "p-301", "p-302"],
  ["p-104", "p-302", "p-303", "p-304"],
  ["p-105", "p-601", "p-602", "p-603"],
  ["p-105", "p-602", "p-603"],
  ["p-201", "p-304", "p-303"],
  ["p-202", "p-304", "p-301"],
  ["p-203", "p-304"],
  ["p-204", "p-304", "p-303"],
  ["p-401", "p-402", "p-403"],
  ["p-402", "p-403", "p-404"],
  ["p-501", "p-502", "p-403"],
  ["p-501", "p-401", "p-502"],
];

/** productId -> Map(otherProductId -> co-view count). Built once. */
function buildCoViewMap(sessions) {
  const map = new Map();
  sessions.forEach((session) => {
    for (let i = 0; i < session.length; i++) {
      for (let j = 0; j < session.length; j++) {
        if (i === j) continue;
        const a = session[i], b = session[j];
        if (!map.has(a)) map.set(a, new Map());
        const inner = map.get(a);
        inner.set(b, (inner.get(b) || 0) + 1);
      }
    }
  });
  return map;
}

const CO_VIEW_MAP = buildCoViewMap(SIMULATED_SESSIONS);

/** Top `topN` recommendations for a set of viewed product ids, excluding
 *  anything already in `excludeIds`. */
function getRecommendations(viewedIds, excludeIds, topN = 3) {
  const scores = new Map(); // otherId -> { score, reasonId, reasonScore }

  viewedIds.forEach((viewedId) => {
    const related = CO_VIEW_MAP.get(viewedId);
    if (!related) return; // edge case: product never appears in simulated sessions
    related.forEach((count, otherId) => {
      if (excludeIds.has(otherId)) return; // edge case: already viewed/purchased
      const entry = scores.get(otherId) || { score: 0, reasonId: null, reasonScore: 0 };
      entry.score += count;
      if (count > entry.reasonScore) {
        entry.reasonScore = count;
        entry.reasonId = viewedId;
      }
      scores.set(otherId, entry);
    });
  });

  return [...scores.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, topN)
    .map(([productId, info]) => ({
      product: getProductById(productId),
      reasonProduct: getProductById(info.reasonId),
    }))
    .filter((entry) => entry.product && entry.reasonProduct); // edge case: unknown/missing id
}

function buildRecommendationCard(product, reasonProduct) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <span class="brand-tag">${product.brand}</span>
    <h3>${product.name}</h3>
    <div class="price-row"><span class="price">${formatCurrency(product.price)}</span></div>
    <div class="rating-row">Often viewed with ${reasonProduct.name}</div>
    <div class="card-footer">
      <span class="stock-note">${product.stock > 0 ? product.stock + " in stock" : "Out of stock"}</span>
      <button class="btn btn-primary btn-sm" ${product.stock === 0 ? "disabled" : ""} data-action="add">Add to cart</button>
    </div>
  `;
  card.querySelector('[data-action="add"]').addEventListener("click", () => {
    cart.addProduct(product);
    showToast(`Added ${product.name} to cart`);
  });
  return card;
}

function renderRecommendations() {
  const grid = document.getElementById("recommendation-results");
  const hint = document.getElementById("recommendation-hint");

  const viewedIds = new Set(cart.items.keys()); // "viewed" == "added to cart", see header note

  // Edge case: nothing viewed yet
  if (viewedIds.size === 0) {
    grid.innerHTML = `<div class="empty-state">Add a product to your cart to get personalized recommendations.</div>`;
    hint.textContent = "Recommendations appear once you've added something to your cart.";
    return;
  }

  const recs = getRecommendations(viewedIds, viewedIds, 3);

  // Edge case: nothing related found for what's been viewed so far
  if (recs.length === 0) {
    grid.innerHTML = `<div class="empty-state">No related products found yet for what's in your cart.</div>`;
    hint.textContent = "";
    return;
  }

  grid.innerHTML = "";
  recs.forEach(({ product, reasonProduct }) => grid.appendChild(buildRecommendationCard(product, reasonProduct)));
  hint.textContent = `Based on ${viewedIds.size} item${viewedIds.size === 1 ? "" : "s"} in your cart.`;
}
