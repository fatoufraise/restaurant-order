// Configuration
const API_URL = 'http://localhost:8080/api';
let orders = [];
let menuItems = [];
let currentFilter = 'ALL';
let stompClient = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    loadMenuItems();
    loadStats();
    connectWebSocket();
});

// Charger les commandes
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`);
        orders = await response.json();
        displayOrders(orders);
        updateCounts();
    } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
    }
}

// Afficher les commandes
function displayOrders(ordersToDisplay) {
    const ordersGrid = document.getElementById('ordersGrid');
    
    if (ordersToDisplay.length === 0) {
        ordersGrid.innerHTML = '<p style="text-align: center; padding: 2rem;">Aucune commande</p>';
        return;
    }
    
    ordersGrid.innerHTML = ordersToDisplay.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-number">#${order.id}</div>
                <span class="order-status status-${order.status}">
                    ${getStatusLabel(order.status)}
                </span>
            </div>
            
            <div class="order-customer">
                <p><i class="fas fa-user"></i> ${order.customerName}</p>
                <p><i class="fas fa-phone"></i> ${order.customerPhone}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${order.customerAddress}</p>
                <p><i class="fas fa-clock"></i> ${formatDate(order.orderDate)}</p>
            </div>
            
            <div class="order-items">
                ${order.orderItems.slice(0, 3).map(item => `
                    <div class="order-item">
                        <span>${item.menuItem.name} x${item.quantity}</span>
                        <span>${item.subtotal.toFixed(2)} €</span>
                    </div>
                `).join('')}
                ${order.orderItems.length > 3 ? 
                    `<div style="text-align: center; margin-top: 10px; color: #666;">
                        +${order.orderItems.length - 3} autres articles
                    </div>` : ''}
            </div>
            
            <div class="order-total">
                <span>Total:</span>
                <span>${order.totalAmount.toFixed(2)} €</span>
            </div>
            
            ${order.notes ? `
                <div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong>Note:</strong> ${order.notes}
                </div>
            ` : ''}
            
            <div class="order-actions">
                ${getOrderActions(order)}
            </div>
        </div>
    `).join('');
}

// Obtenir les actions selon le statut
function getOrderActions(order) {
    switch (order.status) {
        case 'PENDING':
            return `
                <button class="btn btn-confirm" onclick="updateStatus(${order.id}, 'CONFIRMED')">
                    <i class="fas fa-check"></i> Confirmer
                </button>
                <button class="btn btn-cancel" onclick="updateStatus(${order.id}, 'CANCELLED')">
                    <i class="fas fa-times"></i> Annuler
                </button>
            `;
        case 'CONFIRMED':
            return `
                <button class="btn btn-prepare" onclick="updateStatus(${order.id}, 'PREPARING')">
                    <i class="fas fa-fire"></i> Préparer
                </button>
            `;
        case 'PREPARING':
            return `
                <button class="btn btn-ready" onclick="updateStatus(${order.id}, 'READY')">
                    <i class="fas fa-check-circle"></i> Prête
                </button>
            `;
        case 'READY':
            return `
                <button class="btn btn-deliver" onclick="updateStatus(${order.id}, 'DELIVERED')">
                    <i class="fas fa-truck"></i> Livrée
                </button>
            `;
        default:
            return `
                <button class="btn btn-details" onclick="showOrderDetails(${order.id})">
                    <i class="fas fa-eye"></i> Détails
                </button>
            `;
    }
}

// Mettre à jour le statut d'une commande
async function updateStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}/status?status=${newStatus}`, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            showNotification(`Statut mis à jour: ${getStatusLabel(newStatus)}`);
            loadOrders();
            loadStats();
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        showNotification('Erreur lors de la mise à jour', 'error');
    }
}

// Filtrer les commandes
function filterOrders(status) {
    currentFilter = status;
    
    // Mettre à jour les boutons actifs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (status === 'ALL') {
        displayOrders(orders);
    } else {
        const filtered = orders.filter(order => order.status === status);
        displayOrders(filtered);
    }
}

// Mettre à jour les compteurs
function updateCounts() {
    document.getElementById('allCount').textContent = orders.length;
    document.getElementById('pendingCount').textContent = 
        orders.filter(o => o.status === 'PENDING').length;
    document.getElementById('confirmedCount').textContent = 
        orders.filter(o => o.status === 'CONFIRMED').length;
    document.getElementById('preparingCount').textContent = 
        orders.filter(o => o.status === 'PREPARING').length;
    document.getElementById('readyCount').textContent = 
        orders.filter(o => o.status === 'READY').length;
}

// Charger les items du menu
async function loadMenuItems() {
    try {
        const response = await fetch(`${API_URL}/menu`);
        menuItems = await response.json();
        displayMenuItems();
    } catch (error) {
        console.error('Erreur lors du chargement du menu:', error);
    }
}

// Afficher les items du menu
function displayMenuItems() {
    const menuTable = document.getElementById('menuTable');
    
    menuTable.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Disponible</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${menuItems.map(item => `
                    <tr>
                        <td><img src="${item.imageUrl}" class="item-image" alt="${item.name}"></td>
                        <td>${item.name}</td>
                        <td>${item.category}</td>
                        <td>${item.price.toFixed(2)} €</td>
                        <td>${item.stock}</td>
                        <td>
                            <span class="availability-badge ${item.available ? 'available' : 'unavailable'}">
                                ${item.available ? 'Disponible' : 'Indisponible'}
                            </span>
                        </td>
                        <td class="table-actions">
                            <button class="btn-icon edit" onclick="editMenuItem(${item.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" onclick="deleteMenuItem(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Charger les statistiques
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/orders`);
        const allOrders = await response.json();
        
        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const pendingOrders = allOrders.filter(o => o.status === 'PENDING').length;
        const completedOrders = allOrders.filter(o => o.status === 'DELIVERED').length;
        
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2) + ' €';
        document.getElementById('pendingOrders').textContent = pendingOrders;
        document.getElementById('completedOrders').textContent = completedOrders;
        
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Afficher les détails d'une commande
function showOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('orderModal');
    document.getElementById('modalOrderId').textContent = order.id;
    
    const details = document.getElementById('orderDetails');
    details.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h4>Informations Client</h4>
            <p><strong>Nom:</strong> ${order.customerName}</p>
            <p><strong>Téléphone:</strong> ${order.customerPhone}</p>
            <p><strong>Adresse:</strong> ${order.customerAddress}</p>
            <p><strong>Date:</strong> ${formatDate(order.orderDate)}</p>
            <p><strong>Statut:</strong> <span class="order-status status-${order.status}">${getStatusLabel(order.status)}</span></p>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4>Articles Commandés</h4>
            <table style="width: 100%; margin-top: 1rem;">
                <thead>
                    <tr>
                        <th>Article</th>
                        <th>Prix Unit.</th>
                        <th>Quantité</th>
                        <th>Sous-total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.orderItems.map(item => `
                        <tr>
                            <td>${item.menuItem.name}</td>
                            <td>${item.price.toFixed(2)} €</td>
                            <td>${item.quantity}</td>
                            <td>${item.subtotal.toFixed(2)} €</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="text-align: right;">
            <h3>Total: ${order.totalAmount.toFixed(2)} €</h3>
        </div>
        
        ${order.notes ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 1rem;">
                <strong>Instructions spéciales:</strong><br>
                ${order.notes}
            </div>
        ` : ''}
    `;
    
    modal.classList.add('active');
}

// Fermer le modal
function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

// Changer de section
function showSection(section) {
    // Cacher toutes les sections
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Afficher la section sélectionnée
    const sectionMap = {
        'orders': { id: 'ordersSection', title: 'Gestion des Commandes' },
        'menu': { id: 'menuSection', title: 'Gestion du Menu' },
        'stats': { id: 'statsSection', title: 'Statistiques' }
    };
    
    const selected = sectionMap[section];
    document.getElementById(selected.id).classList.add('active');
    document.getElementById('sectionTitle').textContent = selected.title;
}

// Actualiser les données
function refreshData() {
    loadOrders();
    loadMenuItems();
    loadStats();
    showNotification('Données actualisées');
}

// Formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Obtenir le label du statut
function getStatusLabel(status) {
    const labels = {
        'PENDING': 'En attente',
        'CONFIRMED': 'Confirmée',
        'PREPARING': 'En préparation',
        'READY': 'Prête',
        'DELIVERED': 'Livrée',
        'CANCELLED': 'Annulée'
    };
    return labels[status] || status;
}

// Notification
function showNotification(message, type = 'success') {
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
            showNotification(`Nouvelle commande #${order.id} reçue!`);
            loadOrders();
            loadStats();
        });
    }, (error) => {
        console.error('WebSocket error:', error);
    });
}

// Fonctions supplémentaires pour la gestion du menu
function showAddItemModal() {
    alert('Fonctionnalité d\'ajout d\'article à implémenter');
}

function editMenuItem(id) {
    alert(`Édition de l'article #${id} à implémenter`);
}

async function deleteMenuItem(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
        try {
            await fetch(`${API_URL}/menu/${id}`, { method: 'DELETE' });
            showNotification('Article supprimé avec succès');
            loadMenuItems();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

// Animations CSS
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
