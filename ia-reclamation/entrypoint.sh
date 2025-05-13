#!/bin/bash

echo "Checking Python environment..."
python -c "import pandas; print('pandas found')"
python -c "import uvicorn; print('uvicorn found')"

echo "Initializing model training..."
# Run helmi.py and log output
python /app/helmi.py > /app/helmi.log 2>&1
if [ $? -ne 0 ]; then
    echo "Helmi.py failed, exiting..." >> /app/helmi.log
    cat /app/helmi.log
    exit 1
else
    echo "Helmi.py completed successfully" >> /app/helmi.log
fi

# Run FastAPI server
echo "Starting FastAPI server..."
exec python -m uvicorn model_server:app --host 0.0.0.0 --port 8000 --reload