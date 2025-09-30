#!/bin/bash

echo "🚀 Starting NeuroAttend AI System..."

# Kill any existing processes on ports 3000 and 8080
echo "🔄 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Start backend
echo "🐍 Starting FastAPI backend..."
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8080 --reload &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend without opening browser
echo "⚛️ Starting React frontend..."
cd ../frontend
BROWSER=none npm start &
FRONTEND_PID=$!

echo "✅ NeuroAttend is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"
echo ""

# Wait for frontend to be ready and open Chrome
echo "🌐 Opening Chrome browser..."
sleep 2
open -a "Google Chrome" http://localhost:3000 2>/dev/null || \
chrome http://localhost:3000 2>/dev/null || \
google-chrome http://localhost:3000 2>/dev/null || \
echo "⚠️ Please manually open http://localhost:3000 in your browser"

echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo "🛑 Stopping NeuroAttend..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait