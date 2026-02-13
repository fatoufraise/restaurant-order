#!/bin/bash

echo "🛑 Arrêt du Système de Commande Restaurant"
echo "=============================================="
echo ""

# Lire les PIDs
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "🛑 Arrêt du backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        echo "✅ Backend arrêté"
    else
        echo "⚠️  Backend n'est pas en cours d'exécution"
    fi
    rm .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🛑 Arrêt du frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        echo "✅ Frontend arrêté"
    else
        echo "⚠️  Frontend n'est pas en cours d'exécution"
    fi
    rm .frontend.pid
fi

echo ""
echo "✅ Système arrêté avec succès!"
