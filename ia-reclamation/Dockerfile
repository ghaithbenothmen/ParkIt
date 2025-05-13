# Use a single-stage build for simplicity
FROM python:3.12-slim

WORKDIR /app

# Copy all files including dataset and model
COPY . /app

# Install system dependencies including Tkinter and Python packages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    tk \
    tk-dev \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --upgrade pip \
    && pip install torch==2.3.0 torchvision==0.18.0 -f https://download.pytorch.org/whl/cpu/torch_stable.html \
    && pip install -r requirements.txt \
    && pip install pillow-avif-plugin \
    && python -c "import pandas; print('pandas installed successfully')" \
    && python -c "import uvicorn; print('uvicorn installed successfully')"

# Expose port for FastAPI
EXPOSE 8000

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

# Command to run the entrypoint script
CMD ["/app/entrypoint.sh"]