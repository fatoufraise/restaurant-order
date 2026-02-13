#!/bin/bash

echo "🍕 Démarrage du Système de Commande Restaurant"
echo "=============================================="
echo ""

# Vérifier Java
if ! command -v java &> /dev/null; then
    echo "❌ Java n'est pas installé. Veuillez installer Java 17+."
    exit 1
fi

echo "✅ Java détecté: $(java -version 2>&1 | head -n 1)"
echo ""

# Démarrer le backend
echo "🚀 Démarrage du backend..."
cd backend

# Vérifier si le projet a été compilé
if [ ! -f "target/order-system-1.0.0.jar" ]; then
    echo "📦 Compilation du projet..."
    mvn clean install
fi

# Démarrer le backend en arrière-plan
nohup mvn spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!

echo "✅ Backend démarré (PID: $BACKEND_PID)"
echo "📝 Logs disponibles dans backend.log"
echo ""

# Attendre que le backend soit prêt
echo "⏳ Attente du démarrage du backend..."
sleep 10

# Vérifier si le backend est en cours d'exécution
if curl -s http://localhost:8080/api/menu > /dev/null 2>&1; then
    echo "✅ Backend prêt sur http://localhost:8080"
else
    echo "⚠️  Le backend met du temps à démarrer, consultez backend.log"
fi

echo ""
cd ../frontend

# Démarrer le frontend
echo "🚀 Démarrage du frontend..."

# Vérifier si Python est disponible
if command -v python3 &> /dev/null; then
    echo "✅ Utilisation de Python 3"
    python3 -m http.server 8000 > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
elif command -v python &> /dev/null; then
    echo "✅ Utilisation de Python 2"
    python -m SimpleHTTPServer 8000 > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
else
    echo "⚠️  Python n'est pas installé"
    echo "Ouvrez manuellement frontend/index.html dans votre navigateur"
    exit 0
fi

echo "✅ Frontend démarré (PID: $FRONTEND_PID)"
echo ""

echo "=============================================="
echo "✨ Système démarré avec succès!"
echo ""
echo "📱 Interface Client:    http://localhost:8000"
echo "🔧 Panneau Admin:       http://localhost:8000/admin.html"
echo "🔌 API Backend:         http://localhost:8080/api"
echo ""
echo "Pour arrêter:"
echo "  Backend:  kill $BACKEND_PID"
echo "  Frontend: kill $FRONTEND_PID"
echo ""
echo "Ou utilisez: ./stop.sh"
echo "=============================================="

# Sauvegarder les PIDs
cd ..
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# Ouvrir le navigateur (optionnel)
if command -v xdg-open &> /dev/null; then
    sleep 2
    xdg-open http://localhost:8000
elif command -v open &> /dev/null; then
    sleep 2
    open http://localhost:8000
fi
