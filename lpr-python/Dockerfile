FROM python:3.7.4-slim

# Install system libraries required for OpenCV and other dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libopencv-dev \
    gcc \
    g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python dependencies and install them
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the source code
COPY . .

# Expose the Flask default port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
