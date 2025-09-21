// Application data from the provided JSON
const appData = {
    distributor: {
        name: "ABC Trading Co.",
        owner: "Rajesh Kumar",
        location: "Mumbai, India",
        phone: "+91 9876543210"
    },
    dashboard: {
        todaysSales: 45250,
        pendingOrders: 8,
        lowStockItems: 3,
        outstandingPayments: 125000,
        weeklyData: [32000, 28000, 35000, 42000, 38000, 45000, 45250]
    },
    inventory: [
        {id: 1, name: "Rice Bags (25kg)", stock: 150, price: 1250, minStock: 50, expiry: "2024-06-15", category: "Food Grains"},
        {id: 2, name: "Cooking Oil (1L)", stock: 25, price: 120, minStock: 100, expiry: "2024-04-30", category: "Oils"},
        {id: 3, name: "Sugar (1kg)", stock: 0, price: 45, minStock: 200, expiry: "2024-08-10", category: "Food Items"},
        {id: 4, name: "Tea Packets", stock: 85, price: 250, minStock: 50, expiry: "2024-12-31", category: "Beverages"},
        {id: 5, name: "Wheat Flour (10kg)", stock: 120, price: 450, minStock: 80, expiry: "2024-05-20", category: "Food Grains"}
    ],
    orders: [
        {id: 1001, customer: "Sharma General Store", items: "Rice, Oil, Sugar", total: 15750, status: "pending", date: "2024-03-15", deliveryDate: "2024-03-17"},
        {id: 1002, customer: "Patel Kirana Shop", items: "Tea, Wheat Flour", total: 8500, status: "processing", date: "2024-03-14", deliveryDate: "2024-03-16"},
        {id: 1003, customer: "Singh Store", items: "Rice, Sugar, Oil", total: 22300, status: "delivered", date: "2024-03-13", deliveryDate: "2024-03-15"},
        {id: 1004, customer: "Khan Mart", items: "Wheat Flour, Tea", total: 12750, status: "pending", date: "2024-03-15", deliveryDate: "2024-03-18"}
    ],
    customers: [
        {name: "Sharma General Store", outstanding: 15750, contact: "+91 9876501234", dueDate: "2024-03-25"},
        {name: "Patel Kirana Shop", outstanding: 8500, contact: "+91 9876501235", dueDate: "2024-03-22"},
        {name: "Khan Mart", outstanding: 25300, contact: "+91 9876501237", dueDate: "2024-03-20"},
        {name: "Singh Store", outstanding: 0, contact: "+91 9876501236", dueDate: null}
    ],
    accounts: {
        totalReceivables: 125000,
        totalPayables: 85000,
        netBalance: 40000
    }
};

// PWA Variables
let deferredPrompt = null;
let salesChart = null;
let currentScreen = 'dashboard-screen';

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully');
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// PWA Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
});

window.addEventListener('appinstalled', () => {
    hideInstallBanner();
    console.log('PWA was installed');
});

function showInstallBanner() {
    const banner = document.getElementById('installBanner');
    if (banner && !sessionStorage.getItem('installDismissed')) {
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
        console.log('User response to the install prompt: ', outcome);
        deferredPrompt = null;
        hideInstallBanner();
    }
}

function dismissInstall() {
    hideInstallBanner();
    sessionStorage.setItem('installDismissed', 'true');
}

// Screen Navigation
function showScreen(screenId) {
    console.log('Navigating to:', screenId);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    } else {
        console.error('Screen not found:', screenId);
        return;
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
    // Destroy existing chart if it exists
    if (salesChart) {
        salesChart.destroy();
        salesChart = null;
    }
    
    // Create chart after a short delay to ensure canvas is ready
    setTimeout(() => {
        createSalesChart();
    }, 300);
}

function createSalesChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas) {
        console.error('Sales chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    try {
        salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Daily Sales (₹)',
                    data: appData.dashboard.weeklyData,
                    backgroundColor: '#2563eb',
                    borderColor: '#1d4ed8',
                    borderWidth: 0,
                    borderRadius: {
                        topLeft: 6,
                        topRight: 6,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                    borderSkipped: false
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
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 8,
                        displayColors: false,
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
                        border: {
                            display: false
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                return '₹' + (value/1000) + 'k';
                            }
                        }
                    },
                    x: {
                        border: {
                            display: false
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                elements: {
                    bar: {
                        borderRadius: 6
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
        const stockClass = stockStatus === 'Good' ? 'good' : 
                          stockStatus === 'Low' ? 'low' : 'out';
        
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.innerHTML = `
            <div class="item-info">
                <h4 class="item-name">${item.name}</h4>
                <p>Stock: <span class="stock-${stockClass}">${item.stock} units</span></p>
                <p>Price: ₹${item.price.toLocaleString()}</p>
                <p>Category: ${item.category}</p>
                <p>Min Stock: ${item.minStock}</p>
            </div>
            <div class="item-status ${stockClass}">${stockStatus}</div>
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
                item.style.display = 'flex';
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
        const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
        
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.innerHTML = `
            <div class="order-info">
                <h4>${order.customer}</h4>
                <p>Items: ${order.items}</p>
                <p>Order Date: ${formatDate(order.date)}</p>
                <p>Delivery: ${formatDate(order.deliveryDate)}</p>
                <p><strong>Total: ₹${order.total.toLocaleString()}</strong></p>
            </div>
            <div class="order-status ${order.status}">${statusText}</div>
        `;
        
        ordersList.appendChild(orderElement);
    });
}

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
                <div class="customer-info">
                    <h4>${customer.name}</h4>
                    <p>Phone: ${customer.contact}</p>
                    <p>${dueText}</p>
                </div>
                <div class="amount">₹${customer.outstanding.toLocaleString()}</div>
            `;
            
            customersList.appendChild(customerElement);
        }
    });
}

// Modal Functions
function showAddItemForm() {
    const modal = document.getElementById('addItemModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideAddItemForm() {
    const modal = document.getElementById('addItemModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showCreateOrderForm() {
    const modal = document.getElementById('createOrderModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideCreateOrderForm() {
    const modal = document.getElementById('createOrderModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showRecordPaymentForm() {
    const modal = document.getElementById('recordPaymentModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideRecordPaymentForm() {
    const modal = document.getElementById('recordPaymentModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Tab Functions
function showOrderTab(tabType) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    event.target.classList.add('active');
    
    const orderItems = document.querySelectorAll('.order-item');
    orderItems.forEach(item => {
        if (tabType === 'all') {
            item.style.display = 'flex';
        } else if (tabType === 'active') {
            const status = item.querySelector('.order-status').textContent.toLowerCase();
            if (status === 'pending' || status === 'processing') {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

// Form Handlers
function handleAddItem(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newItem = {
        id: appData.inventory.length + 1,
        name: formData.get('itemName'),
        stock: parseInt(formData.get('stock')),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        minStock: 50,
        expiry: "2024-12-31"
    };
    
    appData.inventory.push(newItem);
    populateInventory();
    hideAddItemForm();
    showSuccessMessage('Item added successfully!');
    e.target.reset();
}

function handleCreateOrder(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newOrder = {
        id: Math.max(...appData.orders.map(o => o.id)) + 1,
        customer: formData.get('customer'),
        items: formData.get('items'),
        total: parseFloat(formData.get('total')),
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        deliveryDate: formData.get('deliveryDate')
    };
    
    appData.orders.push(newOrder);
    populateOrders();
    hideCreateOrderForm();
    showSuccessMessage('Order created successfully!');
    e.target.reset();
}

function handleRecordPayment(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const customerName = formData.get('customer');
    const amount = parseFloat(formData.get('amount'));
    
    const customer = appData.customers.find(c => c.name === customerName);
    if (customer) {
        customer.outstanding = Math.max(0, customer.outstanding - amount);
    }
    
    populateAccounts();
    hideRecordPaymentForm();
    showSuccessMessage('Payment recorded successfully!');
    e.target.reset();
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
    const toast = document.createElement('div');
    toast.className = 'success-message';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// Make functions globally accessible
window.showScreen = showScreen;
window.showAddItemForm = showAddItemForm;
window.hideAddItemForm = hideAddItemForm;
window.showCreateOrderForm = showCreateOrderForm;
window.hideCreateOrderForm = hideCreateOrderForm;
window.showRecordPaymentForm = showRecordPaymentForm;
window.hideRecordPaymentForm = hideRecordPaymentForm;
window.showOrderTab = showOrderTab;
window.installApp = installApp;
window.dismissInstall = dismissInstall;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('ABC Trading Co. PWA initializing...');
    
    // Initialize all screens
    populateInventory();
    populateOrders();
    populateAccounts();
    
    // Show dashboard by default
    showScreen('dashboard-screen');
    
    // Setup install banner event listeners
    const installBtn = document.getElementById('installBtn');
    const dismissBtn = document.getElementById('dismissBtn');
    
    if (installBtn) {
        installBtn.addEventListener('click', installApp);
    }
    
    if (dismissBtn) {
        dismissBtn.addEventListener('click', dismissInstall);
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
    
    // Check if already installed (hide banner if standalone)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        hideInstallBanner();
    }
    
    console.log('ABC Trading Co. PWA initialized successfully!');
});

console.log('ABC Trading Co. PWA script loaded!');
