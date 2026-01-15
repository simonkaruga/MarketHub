#!/bin/bash

# MarketHub Stop Script
# Stops both backend and frontend development servers

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$PROJECT_ROOT/.pids"
BACKEND_PID="$PID_DIR/backend.pid"
FRONTEND_PID="$PID_DIR/frontend.pid"

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info "Stopping MarketHub servers..."

# Stop backend
if [ -f "$BACKEND_PID" ]; then
    BACKEND_PROCESS=$(cat "$BACKEND_PID")
    if ps -p "$BACKEND_PROCESS" > /dev/null 2>&1; then
        print_info "Stopping backend server (PID: $BACKEND_PROCESS)"
        kill "$BACKEND_PROCESS" 2>/dev/null
        print_success "Backend stopped"
    else
        print_info "Backend server not running"
    fi
    rm -f "$BACKEND_PID"
else
    print_info "No backend PID file found"
fi

# Stop frontend
if [ -f "$FRONTEND_PID" ]; then
    FRONTEND_PROCESS=$(cat "$FRONTEND_PID")
    if ps -p "$FRONTEND_PROCESS" > /dev/null 2>&1; then
        print_info "Stopping frontend server (PID: $FRONTEND_PROCESS)"
        kill "$FRONTEND_PROCESS" 2>/dev/null
        print_success "Frontend stopped"
    else
        print_info "Frontend server not running"
    fi
    rm -f "$FRONTEND_PID"
else
    print_info "No frontend PID file found"
fi

# Kill any orphaned processes
print_info "Checking for orphaned processes..."

# Kill any Flask processes on port 5000
FLASK_PID=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$FLASK_PID" ]; then
    print_info "Found Flask process on port 5000 (PID: $FLASK_PID)"
    kill $FLASK_PID 2>/dev/null
    print_success "Stopped Flask on port 5000"
fi

# Kill any Vite processes on port 3000
VITE_PID=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$VITE_PID" ]; then
    print_info "Found Vite process on port 3000 (PID: $VITE_PID)"
    kill $VITE_PID 2>/dev/null
    print_success "Stopped Vite on port 3000"
fi

print_success "All servers stopped"
