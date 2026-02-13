// Configuration
const API_URL = 'http://localhost:8080/api';
let menuItems = [];
let cart = [];
let currentOrder = null;

// WebSocket
let stompClient = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
    setupCheckoutForm();
    connectWebSocket();
});

// Charger les items du menu
async function loadMenuItems() {
    try {
        const response = await fetch(`${API_URL}/menu/available`);
        menuItems = await response.json();
        displayMenuItems(menuItems);
    } catch (error) {
        console.error('Erreur lors du chargement du menu:', error);
        document.getElementById('menuGrid').innerHTML = 
            '<p class="loading">Erreur de chargement. Vérifiez que le backend est démarré.</p>';
    }
}

// Afficher les items du menu
function displayMenuItems(items) {
    const menuGrid = document.getElementById('menuGrid');
    
    if (items.length === 0) {
        menuGrid.innerHTML = '<p class="loading">Aucun article disponible</p>';
        return;
    }
    
    menuGrid.innerHTML = items.map(item => `
        <div class="menu-item ${!item.available ? 'out-of-stock' : ''}">
            <img src="${item.imageUrl}" alt="${item.name}" class="menu-item-image">
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3 class="menu-item-name">${item.name}</h3>
                    <span class="menu-item-price">${item.price.toFixed(2)} €</span>
                </div>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <span class="category-badge">${item.category}</span>
                    ${item.available && item.stock > 0 ? 
                        `<button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                            <i class="fas fa-plus"></i> Ajouter
                        </button>` : 
                        '<span style="color: red; font-weight: bold;">Rupture</span>'
                    }
                </div>
            </div>
        </div>
    `).join('');
}

// Filtrer par catégorie
function filterByCategory(category) {
    // Mettre à jour les boutons actifs
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filtrer les items
    if (category === 'ALL') {
        displayMenuItems(menuItems);
    } else {
        const filtered = menuItems.filter(item => item.category === category);
        displayMenuItems(filtered);
    }
}

// Ajouter au panier
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification('Article ajouté au panier!');
}

// Mettre à jour le panier
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    // Nombre total d'articles
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
        cartTotal.textContent = '0.00 €';
        return;
    }
    
    // Afficher les items du panier
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toFixed(2)} €</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="decreaseQuantity(${item.id})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="increaseQuantity(${item.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Calculer le total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2) + ' €';
}

// Augmenter la quantité
function increaseQuantity(itemId) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity++;
        updateCart();
    }
}

// Diminuer la quantité
function decreaseQuantity(itemId) {
    const item = cart.find(i => i.id === itemId);
    if (item && item.quantity > 1) {
        item.quantity--;
        updateCart();
    }
}

// Retirer du panier
function removeFromCart(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    updateCart();
}

// Toggle panier
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Afficher le modal de commande
function showCheckoutModal() {
    if (cart.length === 0) {
        showNotification('Votre panier est vide!', 'error');
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('overlay');
    
    // Remplir le résumé de commande
    const orderSummary = document.getElementById('orderSummary');
    orderSummary.innerHTML = cart.map(item => `
        <div class="summary-item">
            <span>${item.name} x${item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)} €</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('finalTotal').textContent = total.toFixed(2) + ' €';
    
    modal.classList.add('active');
    overlay.classList.add('active');
}

// Fermer le modal de commande
function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

// Fermer tout
function closeAll() {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

// Setup du formulaire de commande
function setupCheckoutForm() {
    const form = document.getElementById('checkoutForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const orderData = {
            customerName: document.getElementById('customerName').value,
            customerPhone: document.getElementById('customerPhone').value,
            customerAddress: document.getElementById('customerAddress').value,
            notes: document.getElementById('orderNotes').value,
            items: cart.map(item => ({
                menuItemId: item.id,
                quantity: item.quantity
            }))
        };
        
        try {
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la création de la commande');
            }
            
            const order = await response.json();
            currentOrder = order;
            
            // Vider le panier
            cart = [];
            updateCart();
            
            // Fermer le modal de commande
            closeCheckoutModal();
            
            // Afficher le modal de succès
            showSuccessModal(order);
            
            // Réinitialiser le formulaire
            form.reset();
            
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur lors de la commande. Réessayez.', 'error');
        }
    });
}

// Afficher le modal de succès
function showSuccessModal(order) {
    const modal = document.getElementById('successModal');
    document.getElementById('orderNumber').textContent = order.id;
    document.getElementById('orderStatus').textContent = getStatusLabel(order.status);
    modal.classList.add('active');
    
    // Connecter au WebSocket pour les mises à jour
    subscribeToOrderUpdates(order.id);
}

// Fermer le modal de succès
function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
}

// Suivre la commande
function trackOrder() {
    if (currentOrder) {
        alert(`Suivi de la commande #${currentOrder.id}\nStatut actuel: ${getStatusLabel(currentOrder.status)}`);
    }
}

// Obtenir le label du statut
function getStatusLabel(status) {
    const labels = {
        'PENDING': 'EN ATTENTE',
        'CONFIRMED': 'CONFIRMÉE',
        'PREPARING': 'EN PRÉPARATION',
        'READY': 'PRÊTE',
        'DELIVERED': 'LIVRÉE',
        'CANCELLED': 'ANNULÉE'
    };
    return labels[status] || status;
}

// Notification toast
function showNotification(message, type = 'success') {
    // Créer une notification simple
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#51cf66' : '#ff6b6b'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// WebSocket pour les notifications en temps réel
function connectWebSocket() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    
    stompClient.connect({}, (frame) => {
        console.log('Connected to WebSocket');
        
        // S'abonner aux nouvelles commandes
        stompClient.subscribe('/topic/orders', (message) => {
            const order = JSON.parse(message.body);
            console.log('Nouvelle commande reçue:', order);
        });
    }, (error) => {
        console.error('WebSocket error:', error);
    });
}

// S'abonner aux mises à jour d'une commande
function subscribeToOrderUpdates(orderId) {
    if (stompClient && stompClient.connected) {
        stompClient.subscribe(`/topic/status/${orderId}`, (message) => {
            const order = JSON.parse(message.body);
            currentOrder = order;
            
            // Mettre à jour le statut dans le modal
            document.getElementById('orderStatus').textContent = getStatusLabel(order.status);
            
            // Notification
            showNotification(`Statut mis à jour: ${getStatusLabel(order.status)}`);
        });
    }
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
