# restaurant-order
Système de Commande de Restaurant en Ligne

Un système complet de commande en ligne pour restaurant avec backend Java Spring Boot et frontend HTML/CSS/JavaScript.



# Frontend Client
-  Catalogue de produits avec images
-  Panier interactif en temps réel
- Formulaire de commande avec validation
-  Récapitulatif et confirmation
-  Notifications WebSocket en temps réel
-  Interface responsive (mobile-friendly)

# Panneau d'Administration
-  Gestion des commandes en temps réel
-  Mise à jour des statuts (En attente → Confirmée → En préparation → Prête → Livrée)
-  Gestion du menu (CRUD)
-  Suivi du chiffre d'affaires
-  Notifications pour nouvelles commandes

# Backend
- API REST avec Spring Boot
-  Base de données H2 (embarquée)
- WebSocket pour notifications temps réel
-  Gestion automatique des stocks
-  Validation des données
-  JPA/Hibernate pour la persistance


# Prérequis

- Java JDK 17 ou supérieur
- Maven 3.6+
- Navigateur web moderne (Chrome, Firefox, Edge)
- Git(optionnel)

#  Installation
Cloner ou télécharger le projet

# Si vous avez git
git clone <url-du-repo>
cd restaurant-order-system

# Ou téléchargez et extrayez le ZIP

# Compiler le backend


cd backend
mvn clean install


Cette commande va :
- Télécharger toutes les dépendances Maven
- Compiler le code Java
- Créer le fichier JAR exécutable

# Démarrage
 Démarrer le Backend
- Option 1 : Avec Maven

cd backend
mvn spring-boot:run


- Option 2 : Avec le JAR

cd backend
java -jar target/order-system-1.0.0.jar

# Démarrer le Frontend

- Option 1 : Avec un serveur HTTP simple (Python)

cd frontend

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000


- Option 2 : Avec Node.js (http-server)

cd frontend
npx http-server -p 8000





# Interface Client

1. Ouvrir http://localhost:8000 dans votre navigateur

2. Navigation
   - Filtrer par catégorie (Pizzas, Burgers, Boissons, Desserts)
   - Cliquer sur "Ajouter" pour ajouter au panier

3. Panier
   - Cliquer sur l'icône panier (en haut à droite)
   - Modifier les quantités avec +/-
   - Supprimer des articles
   - Cliquer sur "Commander"

4. Commande
   - Remplir le formulaire (Nom, Téléphone, Adresse)
   - Ajouter des instructions spéciales (optionnel)
   - Confirmer la commande

5. Confirmation
   - Voir le numéro de commande
   - Suivre le statut en temps réel

# Panneau d'Administration

1. Ouvrir http://localhost:8000/admin.html

2. Gestion des Commandes
   - Voir toutes les commandes
   - Filtrer par statut
   - Mettre à jour le statut :
     * En attente → Confirmer
     * Confirmée → Préparer
     * En préparation → Prête
     * Prête → Livrée

3. Gestion du Menu
   - Voir tous les articles
   - Modifier les articles
   - Supprimer des articles
   - Ajouter de nouveaux articles

4. Statistiques
   - Nombre total de commandes
   - Chiffre d'affaires
   - Commandes en attente
   - Commandes livrées


# API Endpoints

# Menu Items


GET    /api/menu                    # Tous les articles
GET    /api/menu/available          # Articles disponibles
GET    /api/menu/category/{cat}     # Articles par catégorie
GET    /api/menu/{id}               # Article par ID
POST   /api/menu                    # Créer article
PUT    /api/menu/{id}               # Modifier article
DELETE /api/menu/{id}               # Supprimer article


# Orders


GET    /api/orders                  # Toutes les commandes
GET    /api/orders/{id}             # Commande par ID
GET    /api/orders/status/{status}  # Commandes par statut
GET    /api/orders/customer/{phone} # Commandes par téléphone
POST   /api/orders                  # Créer commande
PATCH  /api/orders/{id}/status      # Modifier statut
DELETE /api/orders/{id}             # Annuler commande


# WebSocket


CONNECT /ws                         # Connexion WebSocket
SUBSCRIBE /topic/orders             # Nouvelles commandes
SUBSCRIBE /topic/status/{orderId}   # Mises à jour statut


# Données de Test

Le système charge automatiquement :
- 12 articles (3 pizzas, 3 burgers, 3 boissons, 3 desserts)
- Prix entre 2.50€ et 12.99€
- Images depuis Unsplash
- Stock initial : 50-100 unités

# Catégories

- **PIZZA : Pizzas
- **BURGER : Burgers
- **BOISSON : Boissons
- **DESSERT : Desserts

# Statuts des Commandes

1. PENDING (En attente) - Nouvelle commande
2. CONFIRMED (Confirmée) - Acceptée par le restaurant
3. PREPARING (En préparation) - En cours de préparation
4. READY (Prête) - Prête pour livraison
5. DELIVERED (Livrée) - Livrée au client
6. CANCELLED (Annulée) - Commande annulée


# Améliorations Possibles

-  Authentification JWT
-  Paiement en ligne (Stripe)
-  Upload d'images pour le menu
-  Historique des commandes client
-  Système de notation/avis
-  Export PDF des factures
-  Notifications email
-  Application mobile (React Native)
-  Base de données PostgreSQL/MySQL
-  Docker containerisation








