// PWA functionality for ABC Trading Co.
let deferredPrompt;

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW failed:', error));
    });
}

// Install prompt handling
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installPrompt').classList.add('show');
});

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            console.log(choiceResult.outcome);
            deferredPrompt = null;
        });
    }
    document.getElementById('installPrompt').classList.remove('show');
}

// Sample app data
const appData = {
    sales: { today: 45250, weekly: [32000, 28000, 35000, 42000, 38000, 45000, 45250] },
    orders: { pending: 8, processing: 3, delivered: 12 },
    inventory: { lowStock: 3, outOfStock: 1, total: 45 },
    accounts: { receivables: 125000, payables: 85000 }
};

console.log('ABC Trading App initialized', appData);

// Navigation handling
document.querySelectorAll('.nav button').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        console.log(`Navigated to section ${index}`);
    });
});
