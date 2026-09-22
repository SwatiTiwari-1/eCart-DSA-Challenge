# Product Explorer --- DSA + UI Development Challenges

## Project Context

You are building a **Product Explorer / Mini E-commerce Dashboard**
using:

-   HTML
-   CSS
-   JavaScript
-   The provided `data.js` dataset

The application contains nested categories, subcategories, products,
product details, inventory information, ratings, reviews, tags, and a
delivery network.

Your goal is **not only to make the UI work**. Each feature should be
implemented with clean JavaScript, appropriate data structures, reusable
functions, and a reasonable user experience.

> **Important:** Do not jump directly to advanced algorithms. First
> understand the problem, design the data flow, build the UI, and then
> optimize your solution.

------------------------------------------------------------------------

# Challenge 1 --- Smart Price Finder

### Level

Medium

### Feature

Create a **Price Finder** section where the user can enter a target
price.

Example:

``` text
Find products around: ₹70,000

[ Search ]
```

Display the closest matching products in a product-card layout.

Example:

``` text
Closest Products

Dell Inspiron 14       ₹68,999
Google Pixel 9         ₹69,999
Lenovo ThinkPad E14    ₹72,999
```

### UI Requirements

Create:

-   Search/price input
-   Search button
-   Result cards
-   Product name
-   Price
-   Brand
-   Rating
-   "View Product" button

Add basic responsive CSS.

### Student Goal

The application should efficiently find products based on price instead
of unnecessarily checking everything every time.

### Hint

First think about whether the product prices can be arranged in an
order.

If the data is ordered, can you repeatedly eliminate a large portion of
the remaining data?

### Follow-up

Add:

-   Minimum price
-   Maximum price
-   "Find products in this range"

For example:

``` text
₹50,000 ───────── ₹80,000
```

------------------------------------------------------------------------

# Challenge 2 --- Top K Popular Products

### Level

Medium → Hard

### Feature

Create a **Popular Products** section.

Display:

``` text
🔥 Popular Products

[Product Card] [Product Card] [Product Card]
```

The user can select:

``` text
Show Top:
[ 3 ▼ ]
```

The popularity of a product can be calculated using its rating and
number of reviews.

For example:

``` text
popularity = rating × reviews
```

### UI Requirements

Create:

-   Top-K dropdown
-   Product cards
-   Popularity indicator
-   Rating stars
-   Review count
-   Product ranking number

Example:

``` text
#1  Sony WH-1000XM5
    ⭐ 4.8
    5420 reviews
```

### Student Goal

Find only the best K products without unnecessarily performing a
complete sort when K is much smaller than the total number of products.

### Hint

Imagine there are:

``` text
1,000,000 products
K = 10
```

Do you really need to completely arrange all one million products?

Think about maintaining only the products that currently belong to the
top K.

### Follow-up

Allow the user to switch between:

-   Top 3
-   Top 5
-   Top 10

without reloading the page.

------------------------------------------------------------------------

# Challenge 3 --- Recently Viewed Products

### Level

Medium

### Feature

Create a **Recently Viewed** section.

Whenever a user opens a product:

``` text
Laptop
Mouse
Keyboard
Laptop
```

the history should become:

``` text
Laptop
Keyboard
Mouse
```

The most recently viewed product should appear first.

A product should not appear twice.

### UI Requirements

Create:

-   Product detail modal/page
-   "View Product" buttons
-   Recently Viewed horizontal section
-   Remove history button
-   Empty-state UI

Example:

``` text
Recently Viewed

[ Laptop ] [ Keyboard ] [ Mouse ]
```

### Student Goal

Maintain a limited browsing history efficiently.

### Hint

You need to solve two problems:

1.  Quickly determine whether a product already exists in the history.
2.  Move the product to the latest position.

Think about combining a fast lookup structure with an ordered
collection.

### Follow-up

Limit history to **5 products**.

When the sixth product is viewed, what should happen?

------------------------------------------------------------------------

# Challenge 4 --- Undo / Redo Cart

### Level

Medium

### Feature

Build a shopping cart with:

``` text
Add Product
Remove Product
Increase Quantity
Decrease Quantity
```

Now add:

``` text
Undo
Redo
```

Example:

``` text
ADD Laptop
ADD Mouse
REMOVE Mouse
```

Click:

``` text
UNDO
```

The removed mouse should return.

### UI Requirements

Create:

-   Cart sidebar or page
-   Product rows
-   Quantity controls
-   Remove button
-   Undo button
-   Redo button
-   Cart total
-   Item count

Disable buttons when there is nothing to undo/redo.

### Student Goal

Every cart operation should be reversible.

### Hint

Think about the order in which operations happen.

If:

``` text
A → B → C
```

and you undo, which operation should be reversed first?

Also consider maintaining two separate histories.

### Follow-up

Show a small operation history:

``` text
✓ Added Laptop
✓ Added Mouse
✓ Removed Mouse
```

------------------------------------------------------------------------

# Challenge 5 --- Personalized Recommendations

### Level

Medium → Hard

### Feature

Create a **Recommended For You** section.

Simulate multiple users viewing products.

For example:

``` text
User A:
Laptop
Mouse
Keyboard
Headphones

User B:
Laptop
Mouse
Monitor
Keyboard
```

If the current user views:

``` text
Laptop
```

recommend products commonly viewed by other users who also viewed
Laptop.

### UI Requirements

Create:

-   "Recommended For You" section
-   Recommendation cards
-   "Why this product?" small label
-   Refresh recommendations button

Example:

``` text
Recommended For You

Keyboard
Often viewed with Laptop

Mouse
Often viewed with Laptop
```

### Student Goal

Find relationships between products using user activity.

### Hint

Think in two stages:

``` text
Product
   ↓
Users who viewed it
   ↓
Other products those users viewed
   ↓
Count frequency
```

A product appearing more frequently can receive a higher recommendation
priority.

### Follow-up

Display only the **Top 3 recommendations**.

Also avoid recommending products the user has already purchased or
viewed.

------------------------------------------------------------------------

# Challenge 6 --- Inventory Range Dashboard

### Level

Hard

### Feature

Create an **Inventory Analytics** panel.

The user enters:

``` text
Minimum Price: ₹5,000
Maximum Price: ₹20,000
```

The application should calculate the total inventory value of products
inside that range.

Inventory value:

``` text
price × stock
```

Example:

``` text
Inventory Range

₹5,000 ───────── ₹20,000

Products: 14
Inventory Value: ₹2,45,600
```

### UI Requirements

Create:

-   Two price inputs
-   Search button
-   Summary cards
-   Number of matching products
-   Total inventory value
-   Matching product list

### Student Goal

Make repeated range queries efficient.

Imagine the user changes the range many times.

### Hint

If every query scans every product:

``` text
Query 1 → scan everything
Query 2 → scan everything
Query 3 → scan everything
```

Can you preprocess information so that future queries become much
faster?

Think about ordered values and cumulative information.

### Follow-up

Add a price-range slider:

``` text
₹0 ─────●────────●──── ₹150,000
        min      max
```

Update the results whenever the slider changes.

------------------------------------------------------------------------

# Challenge 7 --- Product Autocomplete

### Level

Hard

### Feature

Build a search box similar to a modern e-commerce website.

When the user types:

``` text
lap
```

show suggestions such as:

``` text
Laptop
MacBook Air M3
Dell Inspiron 14
HP Pavilion 15
Lenovo ThinkPad E14
ASUS ROG Gaming Laptop
```

The search should consider:

-   Product name
-   Brand
-   Tags

### UI Requirements

Create:

-   Search bar
-   Search icon
-   Live suggestions dropdown
-   Highlight matching text
-   Keyboard navigation
-   Empty-state message

Example:

``` text
┌──────────────────────────────┐
│ 🔍 lap                       │
├──────────────────────────────┤
│ Laptop                       │
│ MacBook Air M3               │
│ Dell Inspiron 14             │
│ Lenovo ThinkPad E14          │
└──────────────────────────────┘
```

### Student Goal

Build an autocomplete system that remains efficient as the number of
products grows.

### Hint

A simple approach is to scan every product every time the user types a
character.

Ask yourself:

> What if there were millions of product names?

Think about organizing words according to their prefixes.

### Follow-up

Add:

-   Arrow Up / Down navigation
-   Enter to select
-   Maximum 5 suggestions
-   Suggestions ordered by relevance

------------------------------------------------------------------------

# Challenge 8 --- Smart Delivery Route

### Level

Hard

### Feature

Use the `deliveryNetwork` data from `data.js`.

Create a delivery route planner.

The user selects:

``` text
From:
[ Main Warehouse ▼ ]

To:
[ Knowledge Park ▼ ]
```

Display:

``` text
Best Delivery Route

Main Warehouse
      ↓
Pari Chowk
      ↓
Knowledge Park

Distance: 8 km
```

### UI Requirements

Create a visual route interface.

You can initially represent the route as:

``` text
[Warehouse] → [Location] → [Customer]
```

Later, improve it using CSS.

Also display:

-   Total distance
-   Number of stops
-   Route steps
-   Estimated delivery time

### Student Goal

Find the shortest route through the delivery network.

### Hint

Think of:

``` text
Location = Node
Road = Connection
Distance = Cost
```

You need to repeatedly decide which currently reachable location gives
the cheapest known route.

### Follow-up

Add traffic values to roads.

Now calculate the fastest route instead of simply the shortest physical
distance.

------------------------------------------------------------------------

# Challenge 9 --- Product Bundle Dependency Checker

### Level

Hard

### Feature

Allow the store to define product dependencies.

Example:

``` text
Gaming Laptop
       ↓
Gaming Mouse
       ↓
Mouse Pad
```

Another example:

``` text
Laptop
  ↓
USB-C Hub
  ↓
External Monitor
```

Create a **Bundle Validator**.

The user selects several products and clicks:

``` text
[ Validate Bundle ]
```

Display:

``` text
✓ Valid Bundle
```

or:

``` text
✕ Invalid Bundle

Circular dependency detected.
```

### UI Requirements

Create:

-   Product selection UI
-   Selected products panel
-   Dependency visualization
-   Validate button
-   Success/error message

Example:

``` text
Selected Products

[ Laptop ] [ USB-C Hub ] [ Monitor ]

Dependency Flow

Laptop
  ↓
USB-C Hub
  ↓
Monitor
```

### Student Goal

Determine whether product dependencies can be processed safely.

### Hint

Think about products as connected entities.

If:

``` text
A → B
B → C
```

everything is fine.

But what happens with:

``` text
A → B
B → C
C → A
```

Can the process ever finish?

### Follow-up

If the dependencies are valid, display a valid processing order.

------------------------------------------------------------------------

# Challenge 10 --- Warehouse Capacity Optimizer

### Level

Hard / Very Hard

### Feature

Create a **Warehouse Optimization** screen.

The warehouse has limited capacity.

Example:

``` text
Warehouse Capacity: 10 kg
```

Products:

  Product        Weight     Value
  ------------ -------- ---------
  Laptop           3 kg   ₹70,000
  Monitor          5 kg   ₹30,000
  Keyboard         1 kg    ₹8,000
  Mouse            1 kg    ₹5,000
  Headphones       2 kg   ₹15,000

The system should select products that maximize total value without
exceeding the capacity.

### UI Requirements

Create:

-   Capacity input
-   Product selection table
-   Weight column
-   Value column
-   Selectable products
-   Optimize button
-   Result summary

Example:

``` text
Warehouse Capacity
[ 10 ] kg

Selected Products

✓ Laptop
✓ Keyboard
✓ Mouse
✓ Headphones

Total Weight: 7 kg
Total Value: ₹98,000

Remaining Capacity: 3 kg
```

### Student Goal

Find the best combination of products under a capacity constraint.

### Hint

For every product, you have two fundamental choices:

``` text
Take it
OR
Don't take it
```

Ask:

> What is the best answer if I have considered the first `i` products
> and have `w` capacity remaining?

Start with a straightforward recursive solution.

Then think about repeated subproblems.

### Follow-up

Implement the solution in stages:

``` text
Recursion
    ↓
Memoization
    ↓
2D Iteration
    ↓
1D Optimization
```

The final implementation should use less memory than the initial
dynamic-programming solution.

------------------------------------------------------------------------

# Student Rules

## Rule 1 --- Build the UI First

For every challenge:

``` text
Data
 ↓
UI Design
 ↓
User Interaction
 ↓
Basic Solution
 ↓
Optimization
```

Do not start by writing the algorithm without understanding the feature.

------------------------------------------------------------------------

## Rule 2 --- No Framework

For these challenges use only:

``` text
HTML
CSS
JavaScript
```

Do not use:

-   React
-   Redux
-   Tailwind
-   external UI libraries
-   DSA libraries

The purpose is to understand what JavaScript and the browser are
actually doing.

------------------------------------------------------------------------

## Rule 3 --- Think About Complexity

For every challenge, students must write:

``` text
Initial Approach:
Time Complexity:
Space Complexity:

Optimized Approach:
Time Complexity:
Space Complexity:
```

------------------------------------------------------------------------

## Rule 4 --- Keep the UI Separate From Logic

Try to maintain a structure similar to:

``` text
project/
│
├── index.html
│
├── css/
│   └── style.css
│
└── js/
    ├── data.js
    ├── app.js
    ├── ui.js
    └── features/
        ├── search.js
        ├── cart.js
        ├── recommendations.js
        └── delivery.js
```

Students may start with fewer files and refactor toward this structure
as the project grows.

------------------------------------------------------------------------

# Challenge Submission Requirements

Every challenge should contain:

### 1. Working UI

The feature must be usable from the browser.

### 2. Clean JavaScript

Avoid putting the entire application inside one function.

### 3. Data Handling

Use the provided `data.js` instead of hardcoding products into HTML.

### 4. Responsive UI

The feature should work reasonably on:

-   Desktop
-   Tablet
-   Mobile

### 5. Edge Cases

Students should consider cases such as:

``` text
No products found
Empty cart
Invalid input
Duplicate product
Zero results
Very large input
Missing data
```

### 6. Complexity Analysis

Students must document the complexity of their solution.

### 7. GitHub

Each challenge should be implemented through a separate branch:

``` text
feature/challenge-01
feature/challenge-02
feature/challenge-03
...
```

Create a Pull Request when the feature is complete.

------------------------------------------------------------------------

# Final Objective

By completing all 10 challenges, students should experience the
progression:

``` text
HTML
  ↓
CSS
  ↓
DOM
  ↓
JavaScript
  ↓
Arrays & Objects
  ↓
Data Traversal
  ↓
Efficient Searching
  ↓
Frequency & Lookup
  ↓
History Management
  ↓
Optimization
  ↓
Graph Problems
  ↓
Advanced Problem Solving
```

