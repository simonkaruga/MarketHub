#!/bin/bash

# MarketHub Start Script
# Starts both backend (Flask) and frontend (Vite) development servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend/market-app"

# Log file locations
LOG_DIR="$PROJECT_ROOT/logs"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# PID file locations
PID_DIR="$PROJECT_ROOT/.pids"
BACKEND_PID="$PID_DIR/backend.pid"
FRONTEND_PID="$PID_DIR/frontend.pid"

# Create necessary directories
mkdir -p "$LOG_DIR"
mkdir -p "$PID_DIR"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to cleanup on exit
cleanup() {
    print_info "Shutting down servers..."

    if [ -f "$BACKEND_PID" ]; then
        BACKEND_PROCESS=$(cat "$BACKEND_PID")
        if ps -p "$BACKEND_PROCESS" > /dev/null 2>&1; then
            print_info "Stopping backend server (PID: $BACKEND_PROCESS)"
            kill "$BACKEND_PROCESS" 2>/dev/null || true
        fi
        rm -f "$BACKEND_PID"
    fi

    if [ -f "$FRONTEND_PID" ]; then
        FRONTEND_PROCESS=$(cat "$FRONTEND_PID")
        if ps -p "$FRONTEND_PROCESS" > /dev/null 2>&1; then
            print_info "Stopping frontend server (PID: $FRONTEND_PROCESS)"
            kill "$FRONTEND_PROCESS" 2>/dev/null || true
        fi
        rm -f "$FRONTEND_PID"
    fi

    print_success "Servers stopped"
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend directory not found: $BACKEND_DIR"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

# Check if .env file exists in backend
if [ ! -f "$BACKEND_DIR/.env" ]; then
    print_warning ".env file not found in backend directory"
    print_info "Creating .env from .env.example..."
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        print_warning "Please configure $BACKEND_DIR/.env with your settings"
    else
        print_error ".env.example not found. Please create .env manually"
        exit 1
    fi
fi

print_info "Starting MarketHub Development Servers..."
echo ""

# Start Backend Server
print_info "Starting Backend (Flask) on http://localhost:5000..."
cd "$BACKEND_DIR"

# Check if Pipenv is available
if command -v pipenv &> /dev/null; then
    print_info "Using Pipenv to start backend..."
    pipenv run python run.py > "$BACKEND_LOG" 2>&1 &
    BACKEND_PROCESS=$!
else
    print_warning "Pipenv not found, using virtual environment..."
    source venv/bin/activate && python run.py > "$BACKEND_LOG" 2>&1 &
    BACKEND_PROCESS=$!
fi

echo "$BACKEND_PROCESS" > "$BACKEND_PID"
print_success "Backend started (PID: $BACKEND_PROCESS)"
print_info "Backend logs: $BACKEND_LOG"
echo ""

# Wait a moment for backend to start
sleep 2

# Start Frontend Server
print_info "Starting Frontend (Vite) on http://localhost:3000..."
cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Running npm install..."
    npm install
fi

npm run dev > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PROCESS=$!
echo "$FRONTEND_PROCESS" > "$FRONTEND_PID"
print_success "Frontend started (PID: $FRONTEND_PROCESS)"
print_info "Frontend logs: $FRONTEND_LOG"
echo ""

# Display server information
echo "=========================================="
echo -e "${GREEN}MarketHub Servers Running${NC}"
echo "=========================================="
echo -e "${BLUE}Backend:${NC}  http://localhost:5000"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo "=========================================="
echo ""
print_info "Press Ctrl+C to stop both servers"
echo ""

# Monitor logs
print_info "Showing live logs (Ctrl+C to stop)..."
echo ""

# Tail both log files
tail -f "$BACKEND_LOG" "$FRONTEND_LOG" 2>/dev/null &
TAIL_PID=$!

# Wait for user interrupt
wait $TAIL_PID
