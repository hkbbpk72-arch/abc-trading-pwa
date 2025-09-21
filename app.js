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

// PWA Global Variables
let deferredPrompt = null;
let isInstalled = false;
let isOnline = navigator.onLine;
let swRegistration = null;

// App Global variables
let currentScreen = 'dashboard-screen';
let salesChart = null;
let lastTouchEnd = 0;

// CRITICAL: Create and serve manifest.json dynamically
function createManifestJson() {
  const manifestData = {
    "name": "ABC Trading Co. - Distributor Management",
    "short_name": "ABC Trading",
    "description": "Complete distributor management application for ABC Trading Co. - Manage inventory, orders, accounts, and sales analytics with real-time data synchronization and offline capabilities.",
    "start_url": "/",
    "id": "/abc-trading-distributor-app",
    "display": "standalone",
    "orientation": "portrait",
    "background_color": "#fcfcf9",
    "theme_color": "#218098",
    "icons": [
      {
        "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9IiMyMTgwOTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3QgeD0iMjQiIHk9IjQ4IiB3aWR0aD0iMTQ0IiBoZWlnaHQ9Ijk2IiByeD0iMTIiIGZpbGw9IiNmZmYiLz4KICA8dGV4dCB4PSI5NiIgeT0iODAiIGZpbGw9IiMyMTgwOTgiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSI2MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiI+QUJDPC90ZXh0PgogIDx0ZXh0IHg9Ijk2IiB5PSIxMDQiIGZpbGw9IiMyMTgwOTgiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiI+VHJhZGluZzwvdGV4dD4KICA8cGF0aCBkPSJNNDggMTM2IEw3MiAxMDggTDk2IDEzNiBMMTIwIDEwOCBMMTQ0IDEzNiIgc3Ryb2tlPSIjMjE4MDk4IiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPC9zdmc+",
        "sizes": "192x192",
        "type": "image/svg+xml",
        "purpose": "any maskable"
      },
      {
        "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9IiMyMTgwOTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3QgeD0iNjQiIHk9IjEyOCIgd2lkdGg9IjM4NCIgaGVpZ2h0PSIyNTYiIHJ4PSIzMiIgZmlsbD0iI2ZmZiIvPgogIDx0ZXh0IHg9IjI1NiIgeT0iMjEwIiBmaWxsPSIjMjE4MDk4IiBmb250LXNpemU9IjY0IiBmb250LXdlaWdodD0iNjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiPkFCQzwvdGV4dD4KICA8dGV4dCB4PSIyNTYiIHk9IjI3MCIgZmlsbD0iIzIxODA5OCIgZm9udC1zaXplPSIzNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5UcmFkaW5nPC90ZXh0PgogIDxwYXRoIGQ9Ik0xMjggMzYwIEwxOTIgMjg4IEwyNTYgMzYwIEwzMjAgMjg4IEwzODQgMzYwIiBzdHJva2U9IiMyMTgwOTgiIHN0cm9rZS13aWR0aD0iOCIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4=",
        "sizes": "512x512",
        "type": "image/svg+xml",
        "purpose": "any maskable"
      }
    ],
    "screenshots": [
      {
        "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjU2OCIgdmlld0JveD0iMCAwIDMyMCA1NjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSI1NjgiIGZpbGw9IiNmY2ZjZjkiLz4KICA8dGV4dCB4PSIyNCIgeT0iNDQiIGZpbGw9IiMyMTgwOTgiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI2MDAiPldlbGNvbWUgYmFjaywgUmFqZXNoITwvdGV4dD4KPC9zdmc+",
        "sizes": "320x568",
        "type": "image/svg+xml",
        "form_factor": "narrow",
        "label": "Dashboard view"
      }
    ],
    "categories": ["business", "finance", "productivity"],
    "lang": "en",
    "dir": "ltr",
    "scope": "/",
    "prefer_related_applications": false
  };

  return JSON.stringify(manifestData, null, 2);
}

// Serve manifest.json with correct MIME type
function serveManifestJson() {
  const manifestContent = createManifestJson();
  const blob = new Blob([manifestContent], { type: 'application/manifest+json' });
  const manifestUrl = URL.createObjectURL(blob);
  
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    manifestLink.href = manifestUrl;
  }
  
  console.log('Manifest.json served with correct MIME type');
}

// PWA Service Worker Registration
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const swCode = `
        const CACHE_NAME = 'abc-trading-v2.0.0';
        const urlsToCache = [
          '/',
          '/index.html',
          '/style.css',
          '/app.js',
          'https://cdn.jsdelivr.net/npm/chart.js'
        ];

        self.addEventListener('install', (event) => {
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then((cache) => cache.addAll(urlsToCache))
              .then(() => self.skipWaiting())
          );
        });

        self.addEventListener('fetch', (event) => {
          if (event.request.url.includes('manifest.json')) {
            event.respondWith(
              new Response(${JSON.stringify(createManifestJson())}, {
                headers: {
                  'Content-Type': 'application/manifest+json',
                  'Cache-Control': 'max-age=3600'
                }
              })
            );
            return;
          }

          event.respondWith(
            caches.match(event.request)
              .then((response) => {
                if (response) {
                  return response;
                }
                return fetch(event.request).catch(() => {
                  if (event.request.mode === 'navigate') {
                    return caches.match('/');
                  }
                });
              })
          );
        });

        self.addEventListener('activate', (event) => {
          event.waitUntil(
            caches.keys().then((cacheNames) => {
              return Promise.all(
                cacheNames.map((cacheName) => {
                  if (cacheName !== CACHE_NAME) {
                    return caches.delete(cacheName);
                  }
                })
              );
            }).then(() => self.clients.claim())
          );
        });
      `;
      
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swURL = URL.createObjectURL(blob);
      
      swRegistration = await navigator.serviceWorker.register(swURL);
      console.log('Service Worker registered successfully');
      
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }
}

// PWA Install Prompt Management
function initializeInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    isInstalled = true;
    hideInstallBanner();
    updateInstallStatus();
    showSuccessMessage('App installed successfully! 🎉');
    deferredPrompt = null;
  });

  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    isInstalled = true;
    updateInstallStatus();
  } else {
    // Force show install banner for testing if not installed
    setTimeout(() => {
      if (!sessionStorage.getItem('installDismissed')) {
        showInstallBanner();
      }
    }, 2000);
  }
}

function showInstallBanner() {
  if (isInstalled) return;
  
  const banner = document.getElementById('installBanner');
  if (banner) {
    banner.classList.remove('hidden');
  }
}

function hideInstallBanner() {
  const banner = document.getElementById('installBanner');
  if (banner) {
    banner.classList.add('hidden');
  }
}

async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Install prompt result:', outcome);
    deferredPrompt = null;
    hideInstallBanner();
  } else {
    showSuccessMessage('App installation not available in this browser');
  }
}

function updateInstallStatus() {
  const installText = document.getElementById('installText');
  const installStatus = document.getElementById('installStatus');
  const installationStatus = document.getElementById('installationStatus');
  
  if (isInstalled) {
    if (installText) installText.textContent = 'Installed';
    if (installStatus) installStatus.textContent = '✅';
    if (installationStatus) installationStatus.textContent = 'PWA';
  } else {
    if (installText) installText.textContent = 'PWA Ready';
    if (installStatus) installStatus.textContent = '📱';
    if (installationStatus) installationStatus.textContent = 'Browser';
  }
}

// Network Status Management
function initializeNetworkStatus() {
  updateConnectionStatus();
  
  window.addEventListener('online', () => {
    isOnline = true;
    updateConnectionStatus();
    hideOfflineIndicator();
    showSuccessMessage('You\'re back online! 🌐');
  });
  
  window.addEventListener('offline', () => {
    isOnline = false;
    updateConnectionStatus();
    showOfflineIndicator();
    showErrorMessage('You\'re offline. Some features may be limited. 📵');
  });
}

function updateConnectionStatus() {
  const statusElement = document.getElementById('connectionStatus');
  const offlineText = document.getElementById('offlineText');
  const offlineStatus = document.getElementById('offlineStatus');
  
  if (statusElement) {
    statusElement.textContent = isOnline ? 'Online' : 'Offline';
  }
  
  if (offlineText) {
    offlineText.textContent = isOnline ? 'Online' : 'Offline';
  }
  
  if (offlineStatus) {
    offlineStatus.textContent = isOnline ? '🌐' : '📵';
  }
  
  document.body.classList.toggle('offline', !isOnline);
}

function showOfflineIndicator() {
  const indicator = document.getElementById('offlineIndicator');
  if (indicator) {
    indicator.classList.remove('hidden');
  }
}

function hideOfflineIndicator() {
  const indicator = document.getElementById('offlineIndicator');
  if (indicator) {
    indicator.classList.add('hidden');
  }
}

// CRITICAL FIX: Screen Navigation - Global scope
function showScreen(screenId) {
  console.log('Navigating to screen:', screenId);
  
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show selected screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    console.log('Screen activated:', screenId);
  } else {
    console.error('Screen not found:', screenId);
  }
  
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeNavItem = document.querySelector(`[data-screen="${screenId}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }
  
  currentScreen = screenId;
  
  // Initialize screen-specific content
  initializeScreen(screenId);
}

// Make showScreen globally accessible
window.showScreen = showScreen;

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
    case 'profile-screen':
      updateConnectionStatus();
      updateInstallStatus();
      break;
  }
}

// Dashboard Functions
function initializeDashboard() {
  if (salesChart) {
    salesChart.destroy();
    salesChart = null;
  }
  
  setTimeout(() => {
    createSalesChart();
  }, 200);
}

function createSalesChart() {
  const canvas = document.getElementById('salesChart');
  if (!canvas) {
    console.error('Sales chart canvas not found');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  try {
    salesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: weekDays,
        datasets: [{
          label: 'Daily Sales (₹)',
          data: appData.dashboard.weeklyData,
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C'],
          borderColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C'],
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
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
              label: function(context) {
                return `Sales: ₹${context.parsed.y.toLocaleString()}`;
              }
            }
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
    console.log('Chart created successfully');
  } catch (error) {
    console.error('Error creating chart:', error);
  }
}

// Inventory Functions
function populateInventory() {
  const inventoryList = document.getElementById('inventoryList');
  if (!inventoryList) return;
  
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
  
  setupInventorySearch();
}

function getStockStatus(current, minimum) {
  if (current === 0) return 'Out of Stock';
  if (current <= minimum) return 'Low';
  return 'Good';
}

function setupInventorySearch() {
  const searchInput = document.getElementById('inventorySearch');
  if (!searchInput) return;
  
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
  if (!ordersList) return;
  
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

// Order Tab Function - Global scope
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

window.showOrderTab = showOrderTab;

// Accounts Functions
function populateAccounts() {
  const customersList = document.getElementById('customersList');
  if (!customersList) return;
  
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

// CRITICAL FIX: Modal Functions - Global scope
function showAddItemForm() {
  const modal = document.getElementById('addItemModal');
  if (modal) {
    modal.classList.remove('hidden');
    console.log('Add item modal opened');
  }
}

function hideAddItemForm() {
  const modal = document.getElementById('addItemModal');
  const form = document.getElementById('addItemForm');
  if (modal) {
    modal.classList.add('hidden');
  }
  if (form) {
    form.reset();
  }
}

function showCreateOrderForm() {
  const modal = document.getElementById('createOrderModal');
  if (modal) {
    modal.classList.remove('hidden');
    console.log('Create order modal opened');
  }
}

function hideCreateOrderForm() {
  const modal = document.getElementById('createOrderModal');
  const form = document.getElementById('createOrderForm');
  if (modal) {
    modal.classList.add('hidden');
  }
  if (form) {
    form.reset();
  }
}

function showRecordPaymentForm() {
  const modal = document.getElementById('recordPaymentModal');
  if (modal) {
    modal.classList.remove('hidden');
    console.log('Record payment modal opened');
  }
}

function hideRecordPaymentForm() {
  const modal = document.getElementById('recordPaymentModal');
  const form = document.getElementById('recordPaymentForm');
  if (modal) {
    modal.classList.add('hidden');
  }
  if (form) {
    form.reset();
  }
}

// Make modal functions globally accessible
window.showAddItemForm = showAddItemForm;
window.hideAddItemForm = hideAddItemForm;
window.showCreateOrderForm = showCreateOrderForm;
window.hideCreateOrderForm = hideCreateOrderForm;
window.showRecordPaymentForm = showRecordPaymentForm;
window.hideRecordPaymentForm = hideRecordPaymentForm;

// Other Global Functions
window.checkForUpdates = function() {
  const button = event.target;
  button.classList.add('loading');
  button.textContent = 'Checking...';
  
  setTimeout(() => {
    button.classList.remove('loading');
    button.textContent = 'Check for Updates';
    
    if (swRegistration) {
      swRegistration.update();
      showSuccessMessage('Checked for updates successfully!');
    } else {
      showErrorMessage('Unable to check for updates.');
    }
  }, 2000);
};

window.clearAppData = function() {
  if (confirm('Are you sure you want to clear all app data? This action cannot be undone.')) {
    localStorage.clear();
    sessionStorage.clear();
    showSuccessMessage('App data cleared successfully!');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};

// Form Handlers
function handleAddItem(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input, select');
  const newItem = {
    id: appData.inventory.length + 1,
    name: inputs[0].value,
    stock: parseInt(inputs[1].value),
    price: parseFloat(inputs[2].value),
    minStock: 50,
    category: inputs[3].value,
    expiry: "2024-12-31"
  };
  
  appData.inventory.push(newItem);
  populateInventory();
  hideAddItemForm();
  showSuccessMessage('Item added successfully!');
}

function handleCreateOrder(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input, select, textarea');
  const newOrder = {
    id: Math.max(...appData.orders.map(o => o.id)) + 1,
    customer: inputs[0].value,
    items: inputs[1].value,
    total: parseFloat(inputs[2].value),
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    deliveryDate: inputs[3].value
  };
  
  appData.orders.push(newOrder);
  populateOrders();
  hideCreateOrderForm();
  showSuccessMessage('Order created successfully!');
}

function handleRecordPayment(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input, select');
  const customerName = inputs[0].value;
  const amount = parseFloat(inputs[1].value);
  
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
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  
  const currentScreenEl = document.querySelector('.screen.active');
  if (currentScreenEl) {
    currentScreenEl.insertBefore(successDiv, currentScreenEl.firstChild);
    
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, 3000);
  }
}

function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  const currentScreenEl = document.querySelector('.screen.active');
  if (currentScreenEl) {
    currentScreenEl.insertBefore(errorDiv, currentScreenEl.firstChild);
    
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 3000);
  }
}

// Initialize the PWA app
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Enhanced PWA app...');
  
  // Serve manifest.json
  serveManifestJson();
  
  // Initialize PWA features
  registerServiceWorker();
  initializeInstallPrompt();
  initializeNetworkStatus();
  
  // Initialize all screens
  initializeDashboard();
  populateInventory();
  populateOrders();
  populateAccounts();
  updateInstallStatus();
  
  // Setup install banner event listeners
  const installBtn = document.getElementById('installBtn');
  const dismissBtn = document.getElementById('dismissBtn');
  
  if (installBtn) {
    installBtn.addEventListener('click', installApp);
  }
  
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      hideInstallBanner();
      sessionStorage.setItem('installDismissed', 'true');
    });
  }
  
  // Setup form handlers
  const addItemForm = document.getElementById('addItemForm');
  if (addItemForm) {
    addItemForm.addEventListener('submit', handleAddItem);
  }
  
  const createOrderForm = document.getElementById('createOrderForm');
  if (createOrderForm) {
    createOrderForm.addEventListener('submit', handleCreateOrder);
  }
  
  const recordPaymentForm = document.getElementById('recordPaymentForm');
  if (recordPaymentForm) {
    recordPaymentForm.addEventListener('submit', handleRecordPayment);
  }
  
  // Setup modal close on backdrop click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
  
  // Setup keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
      });
    }
  });
  
  console.log('Enhanced PWA app initialized successfully!');
});

console.log('ABC Trading Co. PWA loaded with complete functionality!');
