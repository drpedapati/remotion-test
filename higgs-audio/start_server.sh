#!/bin/bash
# Start script for higgs-audio HTTP server

cd "$(dirname "$0")"

echo "Starting Higgs Audio Server..."
echo ""

# Activate virtual environment
source .venv/bin/activate

# Run the server
python server.py
