#!/bin/bash

# MarketHub Status Script
# Shows the status of both backend and frontend servers

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$PROJECT_ROOT/.pids"
BACKEND_PID="$PID_DIR/backend.pid"
FRONTEND_PID="$PID_DIR/frontend.pid"

echo "=========================================="
echo -e "${BLUE}MarketHub Server Status${NC}"
echo "=========================================="
echo ""

# Check Backend
echo -e "${BLUE}Backend (Flask):${NC}"
if [ -f "$BACKEND_PID" ]; then
    BACKEND_PROCESS=$(cat "$BACKEND_PID")
    if ps -p "$BACKEND_PROCESS" > /dev/null 2>&1; then
        echo -e "  Status: ${GREEN}Running${NC}"
        echo -e "  PID: $BACKEND_PROCESS"
        echo -e "  URL: http://localhost:5000"
    else
        echo -e "  Status: ${RED}Stopped${NC} (stale PID file)"
    fi
else
    # Check if anything is running on port 5000
    PORT_5000=$(lsof -ti:5000 2>/dev/null)
    if [ ! -z "$PORT_5000" ]; then
        echo -e "  Status: ${YELLOW}Running${NC} (no PID file)"
        echo -e "  PID: $PORT_5000"
        echo -e "  URL: http://localhost:5000"
    else
        echo -e "  Status: ${RED}Stopped${NC}"
    fi
fi
echo ""

# Check Frontend
echo -e "${BLUE}Frontend (Vite):${NC}"
if [ -f "$FRONTEND_PID" ]; then
    FRONTEND_PROCESS=$(cat "$FRONTEND_PID")
    if ps -p "$FRONTEND_PROCESS" > /dev/null 2>&1; then
        echo -e "  Status: ${GREEN}Running${NC}"
        echo -e "  PID: $FRONTEND_PROCESS"
        echo -e "  URL: http://localhost:3000"
    else
        echo -e "  Status: ${RED}Stopped${NC} (stale PID file)"
    fi
else
    # Check if anything is running on port 3000
    PORT_3000=$(lsof -ti:3000 2>/dev/null)
    if [ ! -z "$PORT_3000" ]; then
        echo -e "  Status: ${YELLOW}Running${NC} (no PID file)"
        echo -e "  PID: $PORT_3000"
        echo -e "  URL: http://localhost:3000"
    else
        echo -e "  Status: ${RED}Stopped${NC}"
    fi
fi
echo ""

echo "=========================================="
echo -e "${BLUE}Commands:${NC}"
echo "  ./start.sh  - Start both servers"
echo "  ./stop.sh   - Stop both servers"
echo "  ./status.sh - Show this status"
echo "=========================================="
