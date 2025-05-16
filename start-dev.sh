#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display messages with colors
print_message() {
  echo -e "${BLUE}[MilkyPay Dev]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check for .env file in backend
if [ ! -f "./backend/.env" ]; then
  print_warning "No .env file found in backend directory."
  print_message "Creating .env from example..."
  
  if [ -f "./backend/.env.example" ]; then
    cp ./backend/.env.example ./backend/.env
    print_success "Created .env file in backend directory from example."
  else
    print_error "No .env.example file found. Please create a .env file manually."
    exit 1
  fi
fi

# Function to start backend server
start_backend() {
  print_message "Starting backend server..."
  cd backend
  npm install &> /dev/null
  npm run dev & 
  BACKEND_PID=$!
  cd ..
  print_success "Backend server started! (PID: $BACKEND_PID)"
}

# Function to start frontend server
start_frontend() {
  print_message "Starting frontend server..."
  cd frontend
  npm install &> /dev/null
  npm start &
  FRONTEND_PID=$!
  cd ..
  print_success "Frontend server started! (PID: $FRONTEND_PID)"
}

# Print banner
echo -e "
${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        🚀 MilkyPay Dev Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
"

# Start servers
start_backend
start_frontend

print_message "All services started. Press Ctrl+C to stop all services."
print_message "Frontend: http://localhost:3000"
print_message "Backend: http://localhost:5001"
print_message "To test SMS functionality: http://localhost:3000/test-sms"

# Handle cleanup on script exit
cleanup() {
  print_message "Shutting down services..."
  
  if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null
    print_success "Backend stopped."
  fi
  
  if [ ! -z "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null
    print_success "Frontend stopped."
  fi
  
  # Kill any remaining node processes
  print_message "Cleaning up any remaining processes..."
  pkill -f "node.*backend" 2>/dev/null
  pkill -f "node.*frontend" 2>/dev/null
  
  echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  print_success "All services stopped. Have a stellar day! 🌟"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM

# Keep script running
while true; do
  sleep 1
done