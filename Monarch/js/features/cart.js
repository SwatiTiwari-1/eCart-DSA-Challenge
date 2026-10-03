/* js/features/cart.js
   Challenge 4 — Undo / Redo Cart
   -------------------------------------------------------------------------
   Initial (naive) approach:
     Push a deep copy of the *entire* cart onto a history array after every
     action. Undo = pop the last snapshot and re-render from it.
       Time  : O(n) per action to clone n cart items.
       Space : O(n) per action, O(n * k) for k actions -> grows fast.

   Optimized approach (used here):
     - Cart items live in a Map<productId, {product, qty}> so add/remove/
       update are O(1) instead of O(n) array scans.
     - Every action pushes a tiny *command* object (a few fields, O(1) space)
       onto an `undoStack`, instead of a full snapshot. The command carries
       just enough information (previous quantity / removed item) to reverse
       itself, and enough to be re-applied on redo.
     - `redo` uses a second stack. Any new action clears it (once you branch
       off after an undo, the old "future" is no longer valid).
       Time  : O(1) per add/remove/increase/decrease/undo/redo.
       Space : O(k) for k actions total, O(1) per command.
   ------------------------------------------------------------------------- */

class Cart {
  constructor() {
    this.items = new Map(); // productId -> { product, qty }
    this.undoStack = [];
    this.redoStack = [];
    this.opLog = []; // { text, kind } for the on-screen history panel
  }

  // ---------- public actions ----------

  addProduct(product) {
    const existing = this.items.get(product.id);
    const prevQty = existing ? existing.qty : 0;

    if (existing) existing.qty += 1;
    else this.items.set(product.id, { product, qty: 1 });

    this._pushCommand({ type: "ADD", productId: product.id, product, prevQty });
    this._log(`Added ${product.name}`, "do");
  }

  removeProduct(productId) {
    const existing = this.items.get(productId);
    if (!existing) return;

    this.items.delete(productId);
    this._pushCommand({
      type: "REMOVE",
      productId,
      product: existing.product,
      removedQty: existing.qty,
    });
    this._log(`Removed ${existing.product.name}`, "do");
  }

  increaseQty(productId) {
    const existing = this.items.get(productId);
    if (!existing) return;
    const prevQty = existing.qty;
    existing.qty += 1;

    this._pushCommand({ type: "INCREASE", productId, product: existing.product, prevQty });
    this._log(`Increased ${existing.product.name} quantity`, "do");
  }

  decreaseQty(productId) {
    const existing = this.items.get(productId);
    if (!existing) return;
    const prevQty = existing.qty;

    if (prevQty <= 1) this.items.delete(productId);
    else existing.qty -= 1;

    this._pushCommand({ type: "DECREASE", productId, product: existing.product, prevQty });
    this._log(`Decreased ${existing.product.name} quantity`, "do");
  }

  undo() {
    if (this.undoStack.length === 0) return;
    const cmd = this.undoStack.pop();
    this._reverse(cmd);
    this.redoStack.push(cmd);
    this._log(`Undo: ${this._describe(cmd)}`, "undo");
    this._render();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const cmd = this.redoStack.pop();
    this._forward(cmd);
    this.undoStack.push(cmd);
    this._log(`Redo: ${this._describe(cmd)}`, "redo");
    this._render();
  }

  getTotal() {
    let total = 0;
    for (const { product, qty } of this.items.values()) total += product.price * qty;
    return total;
  }

  getItemCount() {
    let count = 0;
    for (const { qty } of this.items.values()) count += qty;
    return count;
  }

  // ---------- internals ----------

  _pushCommand(cmd) {
    this.undoStack.push(cmd);
    this.redoStack = []; // a fresh action invalidates the redo timeline
    this._render();
  }

  /** Reverse a command (used by undo). */
  _reverse(cmd) {
    switch (cmd.type) {
      case "ADD":
        if (cmd.prevQty === 0) this.items.delete(cmd.productId);
        else this.items.get(cmd.productId).qty = cmd.prevQty;
        break;
      case "REMOVE":
        this.items.set(cmd.productId, { product: cmd.product, qty: cmd.removedQty });
        break;
      case "INCREASE":
        this.items.get(cmd.productId).qty = cmd.prevQty;
        break;
      case "DECREASE":
        if (this.items.has(cmd.productId)) this.items.get(cmd.productId).qty = cmd.prevQty;
        else this.items.set(cmd.productId, { product: cmd.product, qty: cmd.prevQty });
        break;
    }
  }

  /** Re-apply a command's original effect (used by redo). */
  _forward(cmd) {
    switch (cmd.type) {
      case "ADD": {
        const existing = this.items.get(cmd.productId);
        if (existing) existing.qty = cmd.prevQty + 1;
        else this.items.set(cmd.productId, { product: cmd.product, qty: cmd.prevQty + 1 });
        break;
      }
      case "REMOVE":
        this.items.delete(cmd.productId);
        break;
      case "INCREASE":
        this.items.get(cmd.productId).qty = cmd.prevQty + 1;
        break;
      case "DECREASE": {
        if (cmd.prevQty <= 1) this.items.delete(cmd.productId);
        else this.items.get(cmd.productId).qty = cmd.prevQty - 1;
        break;
      }
    }
  }

  _describe(cmd) {
    const verb = { ADD: "add", REMOVE: "remove", INCREASE: "increase", DECREASE: "decrease" }[cmd.type];
    return `${verb} ${cmd.product.name}`;
  }

  _log(text, kind) {
    this.opLog.unshift({ text, kind });
    if (this.opLog.length > 8) this.opLog.pop();
  }

  // ---------- rendering ----------

  _render() {
    renderCart(this);
    renderRecommendations();
  }
}

const cart = new Cart();

function renderCart(cartInstance) {
  const container = document.getElementById("cart-items");
  const undoBtn = document.getElementById("undo-btn");
  const redoBtn = document.getElementById("redo-btn");
  const countEl = document.getElementById("cart-item-count");
  const totalEl = document.getElementById("cart-total");
  const badge = document.getElementById("cart-count-badge");
  const historyList = document.getElementById("op-history-list");

  // Edge case: empty cart
  if (cartInstance.items.size === 0) {
    container.innerHTML = `<div class="empty-state">Your cart is empty. Add something from the Catalog tab.</div>`;
  } else {
    container.innerHTML = "";
    for (const { product, qty } of cartInstance.items.values()) {
      const row = document.createElement("div");
      row.className = "cart-row";
      row.innerHTML = `
        <div class="row-info">
          <h4>${product.name}</h4>
          <span>${formatCurrency(product.price)} each</span>
        </div>
        <div class="qty-control">
          <button class="qty-btn" data-action="decrease">−</button>
          <span>${qty}</span>
          <button class="qty-btn" data-action="increase">+</button>
        </div>
        <div class="row-subtotal">${formatCurrency(product.price * qty)}</div>
        <button class="btn btn-danger btn-sm" data-action="remove">Remove</button>
      `;
      row.querySelector('[data-action="increase"]').addEventListener("click", () => cartInstance.increaseQty(product.id));
      row.querySelector('[data-action="decrease"]').addEventListener("click", () => cartInstance.decreaseQty(product.id));
      row.querySelector('[data-action="remove"]').addEventListener("click", () => cartInstance.removeProduct(product.id));
      container.appendChild(row);
    }
  }

  undoBtn.disabled = cartInstance.undoStack.length === 0;
  redoBtn.disabled = cartInstance.redoStack.length === 0;

  const itemCount = cartInstance.getItemCount();
  countEl.textContent = `${itemCount} item${itemCount === 1 ? "" : "s"}`;
  totalEl.textContent = formatCurrency(cartInstance.getTotal());

  badge.hidden = itemCount === 0;
  badge.textContent = itemCount;

  historyList.innerHTML = cartInstance.opLog.length
    ? cartInstance.opLog.map((entry) => `<li class="${entry.kind === "undo" ? "undo-op" : entry.kind === "redo" ? "redo-op" : ""}">${entry.text}</li>`).join("")
    : `<li>No actions yet.</li>`;
}
