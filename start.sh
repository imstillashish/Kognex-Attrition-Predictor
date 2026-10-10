#!/bin/bash

echo "Starting Backend (FastAPI)..."
# Start the backend in the background using the virtual environment
(cd Backend && ../.venv/bin/uvicorn api:app --reload --port 8000) &
BACKEND_PID=$!

echo "Starting Frontend (Vite)..."
# Start the frontend in the foreground
cd frontend && npm run dev

# If the frontend is stopped (e.g., via Ctrl+C), kill the backend as well
trap "kill $BACKEND_PID" EXIT
