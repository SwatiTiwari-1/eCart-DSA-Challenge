/* js/app.js
   Wires the page together: tab navigation + catalog rendering.
   Feature-specific logic stays in js/features/*.js (Rule 4). */

function renderCategoryChips() {
  const chipRow = document.getElementById("category-chips");
  const categories = ["All", ...storeData.categories.map((c) => c.name)];

  chipRow.innerHTML = categories
    .map((name, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-category="${name}">${name}</button>`)
    .join("");

  chipRow.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      chipRow.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderProductGrid(chip.dataset.category);
    });
  });
}

function renderProductGrid(categoryFilter) {
  const grid = document.getElementById("product-grid");
  const all = getAllProducts();
  const filtered = categoryFilter && categoryFilter !== "All" ? all.filter((p) => p.category === categoryFilter) : all;

  grid.innerHTML = "";

  // Edge case: no products in a category
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">No products found in this category.</div>`;
    return;
  }

  filtered.forEach((product) => {
    grid.appendChild(
      buildProductCard(product, (p) => {
        cart.addProduct(p);
        showToast(`Added ${p.name} to cart`);
        renderRecommendations();
      })
    );
  });
}

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      document.getElementById(btn.dataset.view).classList.add("active");
    });
  });
}

function setupCartControls() {
  document.getElementById("undo-btn").addEventListener("click", () => {
    cart.undo();
    renderRecommendations();
  });
  document.getElementById("redo-btn").addEventListener("click", () => {
    cart.redo();
    renderRecommendations();
  });
}

function setupPriceFinderControls() {
  document.getElementById("find-closest-btn").addEventListener("click", handleFindClosest);
  document.getElementById("find-range-btn").addEventListener("click", handleFindInRange);
  handleFindClosest();
  handleFindInRange();
}

function setupWarehouseControls() {
  renderWarehouseCandidates();
  document.getElementById("optimize-btn").addEventListener("click", handleOptimize);
}

function setupDeliveryControls() {
  populateLocationSelects();
  document.getElementById("find-route-btn").addEventListener("click", handleFindRoute);
}


document.addEventListener("DOMContentLoaded", () => {
  renderCategoryChips();
  renderProductGrid("All");
  renderCart(cart); // initial empty-cart state
  renderRecommendations();
  setupTabs();
  setupPriceFinderControls();
  setupCartControls();
  setupWarehouseControls();
  setupDeliveryControls();
  document.getElementById("refresh-recs-btn").addEventListener("click", renderRecommendations);
});
