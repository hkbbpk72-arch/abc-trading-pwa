// Application data from the provided JSON
const appData = {
  "distributor": {
    "name": "CrunchCraft.",
    "owner": "Rajesh Kumar",
    "location": "Mumbai, India",
    "phone": "+91 9876543210"
  },
  "dashboard": {
    "todaysSales": 45250,
    "pendingOrders": 8,
    "lowStockItems": 3,
    "outstandingPayments": 125000,
    "weeklyData": [32000, 28000, 35000, 42000, 38000, 45000, 45250]
  },
  "inventory": [
    {"id": 1, "name": "Rice Bags (25kg)", "stock": 150, "price": 1250, "minStock": 50, "expiry": "2024-06-15", "category": "Food Grains"},
    {"id": 2, "name": "Cooking Oil (1L)", "stock": 25, "price": 120, "minStock": 100, "expiry": "2024-04-30", "category": "Oils"},
    {"id": 3, "name": "Sugar (1kg)", "stock": 0, "price": 45, "minStock": 200, "expiry": "2024-08-10", "category": "Food Items"},
    {"id": 4, "name": "Tea Packets", "stock": 85, "price": 250, "minStock": 50, "expiry": "2024-12-31", "category": "Beverages"},
    {"id": 5, "name": "Wheat Flour (10kg)", "stock": 120, "price": 450, "minStock": 80, "expiry": "2024-05-20", "category": "Food Grains"}
  ],
  "orders": [
    {"id": 1001, "customer": "Sharma General Store", "items": "Rice, Oil, Sugar", "total": 15750, "status": "pending", "date": "2024-03-15", "deliveryDate": "2024-03-17"},
    {"id": 1002, "customer": "Patel Kirana Shop", "items": "Tea, Wheat Flour", "total": 8500, "status": "processing", "date": "2024-03-14", "deliveryDate": "2024-03-16"},
    {"id": 1003, "customer": "Singh Store", "items": "Rice, Sugar, Oil", "total": 22300, "status": "delivered", "date": "2024-03-13", "deliveryDate": "2024-03-15"},
    {"id": 1004, "customer": "Khan Mart", "items": "Wheat Flour, Tea", "total": 12750, "status": "pending", "date": "2024-03-15", "deliveryDate": "2024-03-18"}
  ],
  "customers": [
    {"name": "Sharma General Store", "outstanding": 15750, "contact": "+91 9876501234", "dueDate": "2024-03-25"},
    {"name": "Patel Kirana Shop", "outstanding": 8500, "contact": "+91 9876501235", "dueDate": "2024-03-22"},
    {"name": "Khan Mart", "outstanding": 25300, "contact": "+91 9876501237", "dueDate": "2024-03-20"},
    {"name": "Singh Store", "outstanding": 0, "contact": "+91 9876501236", "dueDate": null}
  ],
  "accounts": {
    "totalReceivables": 125000,
    "totalPayables": 85000,
    "netBalance": 40000
  }
};

// Global variables
let currentScreen = 'dashboard-screen';
let salesChart = null;

// Screen Navigation
function showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show selected screen
  document.getElementById(screenId).classList.add('active');
  
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  document.querySelector(`[data-screen="${screenId}"]`).classList.add('active');
  
  currentScreen = screenId;
  
  // Initialize screen-specific content
  initializeScreen(screenId);
}

// Initialize screen content
function initializeScreen(screenId) {
  switch(screenId) {
    case 'dashboard-screen':
      initializeDashboard();
      break;
    case 'inventory-screen':
      populateInventory();
      break;
    case 'orders-screen':
      populateOrders();
      break;
    case 'accounts-screen':
      populateAccounts();
      break;
  }
}

// Dashboard Functions
function initializeDashboard() {
  if (salesChart) {
    salesChart.destroy();
  }
  createSalesChart();
}

function createSalesChart() {
  const ctx = document.getElementById('salesChart').getContext('2d');
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  salesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weekDays,
      datasets: [{
        label: 'Daily Sales (₹)',
        data: appData.dashboard.weeklyData,
        backgroundColor: '#1FB8CD',
        borderColor: '#1FB8CD',
        borderWidth: 0,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + (value/1000) + 'k';
            }
          },
          grid: {
            color: 'rgba(0,0,0,0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Inventory Functions
function populateInventory() {
  const inventoryList = document.getElementById('inventoryList');
  inventoryList.innerHTML = '';
  
  appData.inventory.forEach(item => {
    const stockStatus = getStockStatus(item.stock, item.minStock);
    const stockClass = stockStatus === 'Good' ? 'stock-good' : 
                      stockStatus === 'Low' ? 'stock-low' : 'stock-out';
    
    const itemElement = document.createElement('div');
    itemElement.className = 'inventory-item';
    itemElement.innerHTML = `
      <div class="item-header">
        <h4 class="item-name">${item.name}</h4>
        <span class="stock-badge ${stockClass}">${stockStatus}</span>
      </div>
      <div class="item-details">
        <div>Stock: ${item.stock} units</div>
        <div>Price: ₹${item.price}</div>
        <div>Category: ${item.category}</div>
        <div>Min Stock: ${item.minStock}</div>
      </div>
    `;
    
    inventoryList.appendChild(itemElement);
  });
  
  // Setup search functionality
  setupInventorySearch();
}

function getStockStatus(current, minimum) {
  if (current === 0) return 'Out of Stock';
  if (current <= minimum) return 'Low';
  return 'Good';
}

function setupInventorySearch() {
  const searchInput = document.getElementById('inventorySearch');
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.inventory-item');
    
    items.forEach(item => {
      const itemName = item.querySelector('.item-name').textContent.toLowerCase();
      if (itemName.includes(searchTerm)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

// Orders Functions
function populateOrders() {
  const ordersList = document.getElementById('ordersList');
  ordersList.innerHTML = '';
  
  appData.orders.forEach(order => {
    const statusClass = `status-${order.status}`;
    const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
    
    const orderElement = document.createElement('div');
    orderElement.className = 'order-item';
    orderElement.innerHTML = `
      <div class="order-header">
        <h4 class="order-customer">${order.customer}</h4>
        <span class="order-status ${statusClass}">${statusText}</span>
      </div>
      <div class="order-details">
        <div>Items: ${order.items}</div>
        <div>Order Date: ${formatDate(order.date)}</div>
        <div>Delivery: ${formatDate(order.deliveryDate)}</div>
      </div>
      <div class="order-total">Total: ₹${order.total.toLocaleString()}</div>
    `;
    
    ordersList.appendChild(orderElement);
  });
  
  populateCustomerSelect();
}

function populateCustomerSelect() {
  const customerSelect = document.getElementById('customerSelect');
  if (customerSelect) {
    customerSelect.innerHTML = '<option value="">Select Customer</option>';
    appData.customers.forEach(customer => {
      const option = document.createElement('option');
      option.value = customer.name;
      option.textContent = customer.name;
      customerSelect.appendChild(option);
    });
  }
}

function showOrderTab(tabType) {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  const orderItems = document.querySelectorAll('.order-item');
  orderItems.forEach(item => {
    if (tabType === 'all') {
      item.style.display = 'block';
    } else if (tabType === 'active') {
      const status = item.querySelector('.order-status').textContent.toLowerCase();
      if (status === 'pending' || status === 'processing') {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    }
  });
}

// Accounts Functions
function populateAccounts() {
  const customersList = document.getElementById('customersList');
  customersList.innerHTML = '';
  
  appData.customers.forEach(customer => {
    if (customer.outstanding > 0) {
      const customerElement = document.createElement('div');
      customerElement.className = 'customer-item';
      
      const dueText = customer.dueDate ? 
        `Due: ${formatDate(customer.dueDate)}` : 
        'No due date';
      
      customerElement.innerHTML = `
        <div class="customer-header">
          <h4 class="customer-name">${customer.name}</h4>
          <div class="outstanding-amount">₹${customer.outstanding.toLocaleString()}</div>
        </div>
        <div class="customer-details">
          <div>Phone: ${customer.contact}</div>
          <div class="due-date">${dueText}</div>
        </div>
      `;
      
      customersList.appendChild(customerElement);
    }
  });
}

// Modal Functions
function showAddItemForm() {
  document.getElementById('addItemModal').classList.remove('hidden');
}

function hideAddItemForm() {
  document.getElementById('addItemModal').classList.add('hidden');
  document.getElementById('addItemForm').reset();
}

function showCreateOrderForm() {
  document.getElementById('createOrderModal').classList.remove('hidden');
}

function hideCreateOrderForm() {
  document.getElementById('createOrderModal').classList.add('hidden');
  document.getElementById('createOrderForm').reset();
}

function showRecordPaymentForm() {
  document.getElementById('recordPaymentModal').classList.remove('hidden');
}

function hideRecordPaymentForm() {
  document.getElementById('recordPaymentModal').classList.add('hidden');
  document.getElementById('recordPaymentForm').reset();
}

// Form Handlers
function handleAddItem(formData) {
  const newItem = {
    id: appData.inventory.length + 1,
    name: formData.get('name') || formData[0].value,
    stock: parseInt(formData.get('stock') || formData[1].value),
    price: parseFloat(formData.get('price') || formData[2].value),
    minStock: 50, // Default minimum stock
    category: formData.get('category') || formData[3].value,
    expiry: "2024-12-31" // Default expiry
  };
  
  appData.inventory.push(newItem);
  populateInventory();
  hideAddItemForm();
  showSuccessMessage('Item added successfully!');
}

function handleCreateOrder(formData) {
  const newOrder = {
    id: Math.max(...appData.orders.map(o => o.id)) + 1,
    customer: formData.get('customer') || formData[0].value,
    items: formData.get('items') || formData[1].value,
    total: parseFloat(formData.get('total') || formData[2].value),
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    deliveryDate: formData.get('deliveryDate') || formData[3].value
  };
  
  appData.orders.push(newOrder);
  populateOrders();
  hideCreateOrderForm();
  showSuccessMessage('Order created successfully!');
}

function handleRecordPayment(formData) {
  const customerName = formData.get('customer') || formData[0].value;
  const amount = parseFloat(formData.get('amount') || formData[1].value);
  
  const customer = appData.customers.find(c => c.name === customerName);
  if (customer) {
    customer.outstanding = Math.max(0, customer.outstanding - amount);
  }
  
  populateAccounts();
  hideRecordPaymentForm();
  showSuccessMessage('Payment recorded successfully!');
}

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
}

function showSuccessMessage(message) {
  // Create and show success message
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  
  const currentScreenEl = document.querySelector('.screen.active');
  currentScreenEl.insertBefore(successDiv, currentScreenEl.firstChild);
  
  // Remove after 3 seconds
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

function showErrorMessage(message) {
  // Create and show error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  const currentScreenEl = document.querySelector('.screen.active');
  currentScreenEl.insertBefore(errorDiv, currentScreenEl.firstChild);
  
  // Remove after 3 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

// Pull to refresh functionality
let startY = 0;
let currentY = 0;
let pullDistance = 0;
let isPulling = false;

function initializePullToRefresh() {
  const screens = document.querySelectorAll('.screen');
  
  screens.forEach(screen => {
    screen.addEventListener('touchstart', handleTouchStart, { passive: true });
    screen.addEventListener('touchmove', handleTouchMove, { passive: false });
    screen.addEventListener('touchend', handleTouchEnd, { passive: true });
  });
}

function handleTouchStart(e) {
  startY = e.touches[0].clientY;
}

function handleTouchMove(e) {
  currentY = e.touches[0].clientY;
  pullDistance = currentY - startY;
  
  if (pullDistance > 0 && window.scrollY === 0) {
    isPulling = true;
    e.preventDefault();
    
    if (pullDistance > 60) {
      // Show refresh indicator
      showPullToRefreshIndicator();
    }
  }
}

function handleTouchEnd(e) {
  if (isPulling && pullDistance > 60) {
    // Trigger refresh
    refreshCurrentScreen();
  }
  
  hidePullToRefreshIndicator();
  isPulling = false;
  pullDistance = 0;
}

function showPullToRefreshIndicator() {
  let indicator = document.querySelector('.pull-to-refresh');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'pull-to-refresh';
    indicator.textContent = 'Release to refresh';
    document.body.appendChild(indicator);
  }
  indicator.classList.add('active');
}

function hidePullToRefreshIndicator() {
  const indicator = document.querySelector('.pull-to-refresh');
  if (indicator) {
    indicator.classList.remove('active');
    setTimeout(() => indicator.remove(), 300);
  }
}

function refreshCurrentScreen() {
  initializeScreen(currentScreen);
  showSuccessMessage('Screen refreshed!');
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard by default
  initializeDashboard();
  populateInventory();
  populateOrders();
  populateAccounts();
  
  // Setup form handlers
  document.getElementById('addItemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    handleAddItem(formData);
  });
  
  document.getElementById('createOrderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    handleCreateOrder(formData);
  });
  
  document.getElementById('recordPaymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    handleRecordPayment(formData);
  });
  
  // Setup modal close on backdrop click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
  
  // Initialize pull to refresh
  initializePullToRefresh();
  
  // Setup keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      // Close any open modals
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
      });
    }
  });
});

// Handle visibility change for screen refresh
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    // Refresh current screen when app becomes visible
    initializeScreen(currentScreen);
  }
});

// Prevent zoom on double tap
document.addEventListener('touchend', function(e) {
  const now = new Date().getTime();
  const timeSince = now - lastTouchEnd;
  
  if ((timeSince < 300) && (timeSince > 0)) {
    e.preventDefault();
  }
  
  lastTouchEnd = now;
}, false);

let lastTouchEnd = 0;
