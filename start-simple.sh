#!/bin/bash

# Kill any existing servers
pkill -f "node.*backend" || true
pkill -f "node.*frontend" || true

# Clear port 3000 and 5001 if anything is using them
lsof -ti:3000 | xargs kill -9 || true
lsof -ti:5001 | xargs kill -9 || true

echo "Starting backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait 3 seconds for backend to initialize
sleep 3

echo "Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Print useful information
echo "Services started! Access the app at:"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep the script running and handle cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT INT TERM
wait