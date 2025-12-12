#!/bin/bash
# Start portfolio server accessible from Windows

# Kill any existing servers
pkill -f "python3 -m http.server" 2>/dev/null
pkill -f "http.server" 2>/dev/null

# Start server bound to all interfaces (accessible from Windows)
cd /home/ethan/ethanstoner-portfolio
python3 -m http.server 3001 --bind 0.0.0.0

echo "Server started on http://localhost:3001"
echo "Access from Windows: http://localhost:3001"
