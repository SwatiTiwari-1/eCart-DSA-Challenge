/* js/features/delivery.js
   Challenge 8 — Smart Delivery Route
   -------------------------------------------------------------------------
   Initial (naive) approach:
     Enumerate every simple path from `from` to `to` (DFS/backtracking over
     all orderings of intermediate stops) and keep the cheapest one.
       Time  : O(V!) worst case — explodes as the network grows.
       Space : O(V) per path on the call stack.

   Optimized approach (used here):
     Model the network as a weighted, undirected graph (adjacency list) and
     run Dijkstra's algorithm using a binary min-heap as the priority queue,
     always expanding the closest not-yet-finalized location next.
       Time  : O((V + E) log V) with a binary heap.
       Space : O(V + E) for the graph, O(V) for distances/heap.
   ------------------------------------------------------------------------- */

/** Minimal binary min-heap keyed by `.dist`. */
class MinHeap {
  constructor() {
    this.data = [];
  }
  get size() {
    return this.data.length;
  }
  push(item) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this._bubbleDown(0);
    }
    return top;
  }
  _bubbleUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[parent].dist <= this.data[i].dist) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }
  _bubbleDown(i) {
    const n = this.data.length;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < n && this.data[left].dist < this.data[smallest].dist) smallest = left;
      if (right < n && this.data[right].dist < this.data[smallest].dist) smallest = right;
      if (smallest === i) break;
      [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
      i = smallest;
    }
  }
}

/** Build an adjacency-list graph from deliveryNetwork (roads are two-way). */
function buildDeliveryGraph(network) {
  const graph = new Map();
  network.locations.forEach((loc) => graph.set(loc.id, []));
  network.roads.forEach((road) => {
    graph.get(road.from).push({ to: road.to, distance: road.distance });
    graph.get(road.to).push({ to: road.from, distance: road.distance });
  });
  return graph;
}

const deliveryGraph = buildDeliveryGraph(deliveryNetwork);
const LOCATIONS_BY_ID = new Map(deliveryNetwork.locations.map((loc) => [loc.id, loc]));

/** Dijkstra's shortest path. Returns { distance, path: [id, id, ...] } or null. */
function findShortestRoute(fromId, toId) {
  const dist = new Map();
  const prev = new Map();
  deliveryGraph.forEach((_, id) => dist.set(id, Infinity));
  dist.set(fromId, 0);

  const heap = new MinHeap();
  heap.push({ id: fromId, dist: 0 });
  const finalized = new Set();

  while (heap.size > 0) {
    const { id: current } = heap.pop();
    if (finalized.has(current)) continue; // stale heap entry, skip
    finalized.add(current);
    if (current === toId) break;

    for (const edge of deliveryGraph.get(current)) {
      if (finalized.has(edge.to)) continue;
      const candidate = dist.get(current) + edge.distance;
      if (candidate < dist.get(edge.to)) {
        dist.set(edge.to, candidate);
        prev.set(edge.to, current);
        heap.push({ id: edge.to, dist: candidate });
      }
    }
  }

  if (dist.get(toId) === Infinity) return null; // no route exists (edge case)

  const path = [];
  let step = toId;
  while (step !== undefined) {
    path.unshift(step);
    step = prev.get(step);
  }
  return { distance: dist.get(toId), path };
}

/** Rough delivery-time estimate assuming ~30 km/h average city speed. */
function estimateMinutes(distanceKm) {
  return Math.max(1, Math.round((distanceKm / 30) * 60));
}

function populateLocationSelects() {
  const fromSelect = document.getElementById("from-select");
  const toSelect = document.getElementById("to-select");
  const options = deliveryNetwork.locations
    .map((loc) => `<option value="${loc.id}">${loc.name}</option>`)
    .join("");
  fromSelect.innerHTML = options;
  toSelect.innerHTML = options;
  // sensible default so the first search shows a multi-stop route
  toSelect.selectedIndex = Math.min(3, deliveryNetwork.locations.length - 1);
}

function handleFindRoute() {
  const fromId = document.getElementById("from-select").value;
  const toId = document.getElementById("to-select").value;
  const summaryBox = document.getElementById("route-summary");
  const summaryText = document.getElementById("route-summary-text");
  const steps = document.getElementById("route-steps");

  // Edge case: same start and end
  if (fromId === toId) {
    summaryBox.hidden = true;
    steps.innerHTML = `<div class="empty-state">Pick two different locations to plan a route.</div>`;
    return;
  }

  const result = findShortestRoute(fromId, toId);

  // Edge case: no path between the two locations
  if (!result) {
    summaryBox.hidden = true;
    steps.innerHTML = `<div class="empty-state">No delivery route exists between these locations.</div>`;
    return;
  }

  const minutes = estimateMinutes(result.distance);
  summaryBox.hidden = false;
  summaryText.textContent =
    `Total Distance: ${result.distance} km` +
    ` · Stops: ${result.path.length}` +
    ` · Estimated Time: ${minutes} min`;

  steps.innerHTML = "";
  let runningTotal = 0;
  result.path.forEach((id, index) => {
    const loc = LOCATIONS_BY_ID.get(id);
    let legNote = "Starting point";
    if (index > 0) {
      const prevId = result.path[index - 1];
      const edge = deliveryGraph.get(prevId).find((e) => e.to === id);
      runningTotal += edge.distance;
      legNote = `+${edge.distance} km from ${LOCATIONS_BY_ID.get(prevId).name}`;
    }
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="row-info">
        <h4>${index + 1}. ${loc.name}</h4>
        <span>${legNote}</span>
      </div>
      <div class="row-subtotal">${runningTotal} km</div>
    `;
    steps.appendChild(row);
  });
}