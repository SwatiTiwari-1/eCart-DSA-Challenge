/* js/features/warehouse.js
   Challenge 10 — Warehouse Capacity Optimizer (0/1 Knapsack)
   -------------------------------------------------------------------------
   data.js has no shipping-weight field, so a weight is derived from price
   (pricier items are assumed bulkier). This is a *simulated* attribute for
   the exercise — the same idea used for the simulated user activity behind
   product recommendations — not a real product spec.

   Initial approach: try every take/skip combination recursively.
     Time  : O(2^n)
     Space : O(n) recursion depth.

   Optimized approach (used for the UI): bottom-up DP over a 2D table
   dp[i][w] = best value using the first i items with capacity w, then
   backtrack through the table to recover *which* items were chosen.
     Time  : O(n * capacity)
     Space : O(n * capacity)

   Further memory optimization: the classic 1D rolling-array knapsack
   collapses the table to O(capacity) space, but in doing so it throws away
   the per-item history needed to reconstruct the selected set. Since the
   UI needs to show which products were picked, the 1D version below is
   used only as a value-only cross-check of the 2D result, not for
   rendering the item list.
     Time  : O(n * capacity)
     Space : O(capacity)
   ------------------------------------------------------------------------- */

function deriveWeightKg(product) {
  const price = product.price;
  if (price < 5000) return 1;
  if (price < 20000) return 2;
  if (price < 50000) return 3;
  if (price < 90000) return 4;
  if (price < 120000) return 5;
  return 6;
}

const WAREHOUSE_ITEMS = getAllProducts().map((product) => ({
  product,
  weight: deriveWeightKg(product),
  value: product.price,
}));

// Which candidate ids are currently included in the optimization pool.
// Every product starts included; the UI lets a student toggle items out.
const includedIds = new Set(WAREHOUSE_ITEMS.map((item) => item.product.id));

/** Naive recursive solution (starting point from the assignment hint). */
function knapsackRecursive(items, capacity, i = 0) {
  if (i === items.length || capacity === 0) return 0;
  if (items[i].weight > capacity) return knapsackRecursive(items, capacity, i + 1);
  const skip = knapsackRecursive(items, capacity, i + 1);
  const take = items[i].value + knapsackRecursive(items, capacity - items[i].weight, i + 1);
  return Math.max(skip, take);
}

/** Optimized 2D DP with backtracking so we know exactly which items were picked. */
function knapsackWithSelection(items, capacity) {
  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];
      if (weight <= w) dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weight] + value);
    }
  }

  const selected = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(items[i - 1]);
      w -= items[i - 1].weight;
    }
  }
  selected.reverse();

  return {
    totalValue: dp[n][capacity],
    totalWeight: selected.reduce((sum, item) => sum + item.weight, 0),
    selected,
  };
}

/** Memory-optimized 1D rolling array — max value only, O(capacity) space. */
function knapsackValueOnly(items, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (const { weight, value } of items) {
    for (let w = capacity; w >= weight; w--) {
      dp[w] = Math.max(dp[w], dp[w - weight] + value);
    }
  }
  return dp[capacity];
}

function getCandidateItems() {
  return WAREHOUSE_ITEMS.filter((item) => includedIds.has(item.product.id));
}

function renderWarehouseCandidates() {
  const grid = document.getElementById("warehouse-candidates");
  grid.innerHTML = "";

  // Edge case: no products in the catalog at all
  if (WAREHOUSE_ITEMS.length === 0) {
    grid.innerHTML = `<div class="empty-state">No products available to optimize.</div>`;
    return;
  }

  WAREHOUSE_ITEMS.forEach(({ product, weight, value }) => {
    const included = includedIds.has(product.id);
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <span class="brand-tag">${product.category}</span>
      <h3>${product.name}</h3>
      <div class="rating-row">Weight: ${weight} kg &middot; Value: ${formatCurrency(value)}</div>
      <div class="card-footer">
        <span class="stock-note">${included ? "In optimization pool" : "Excluded"}</span>
        <button class="btn btn-sm ${included ? "btn-primary" : "btn-ghost"}" data-action="toggle">
          ${included ? "Included" : "Include"}
        </button>
      </div>
    `;
    card.querySelector('[data-action="toggle"]').addEventListener("click", () => {
      if (includedIds.has(product.id)) includedIds.delete(product.id);
      else includedIds.add(product.id);
      renderWarehouseCandidates();
    });
    grid.appendChild(card);
  });
}

function renderWarehouseResult(result, capacity) {
  const summaryBox = document.getElementById("warehouse-summary");
  const summaryText = document.getElementById("warehouse-summary-text");
  const list = document.getElementById("warehouse-selected");

  summaryBox.hidden = false;
  summaryText.textContent =
    `Total Weight: ${result.totalWeight} kg` +
    ` · Total Value: ${formatCurrency(result.totalValue)}` +
    ` · Remaining Capacity: ${capacity - result.totalWeight} kg`;

  // Edge case: nothing fits (capacity 0, or every included item too heavy)
  if (result.selected.length === 0) {
    list.innerHTML = `<div class="empty-state">Nothing fits in ${capacity} kg — increase capacity or include lighter items.</div>`;
    return;
  }

  list.innerHTML = "";
  result.selected.forEach(({ product, weight, value }) => {
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="row-info">
        <h4>&#10003; ${product.name}</h4>
        <span>${weight} kg</span>
      </div>
      <div class="row-subtotal">${formatCurrency(value)}</div>
    `;
    list.appendChild(row);
  });
}

function handleOptimize() {
  const input = document.getElementById("capacity-input");
  const raw = Number(input.value);

  // Edge case: invalid or negative capacity
  if (!Number.isFinite(raw) || raw < 0) {
    document.getElementById("warehouse-selected").innerHTML =
      `<div class="empty-state">Enter a valid, non-negative capacity.</div>`;
    document.getElementById("warehouse-summary").hidden = true;
    return;
  }

  // Edge case: guard against an unreasonably large capacity ("very large input")
  const capacity = Math.min(Math.floor(raw), 1000);

  const candidates = getCandidateItems();

  // Edge case: empty candidate pool
  if (candidates.length === 0) {
    document.getElementById("warehouse-selected").innerHTML =
      `<div class="empty-state">No products included — toggle at least one product above.</div>`;
    document.getElementById("warehouse-summary").hidden = true;
    return;
  }

  const result = knapsackWithSelection(candidates, capacity);
  renderWarehouseResult(result, capacity);
}