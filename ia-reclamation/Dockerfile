# Use an official Python runtime as the base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements.txt first (for caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port 8008
EXPOSE 8008

# Run the FastAPI app with Uvicorn (overridden by docker-compose command)
CMD ["uvicorn", "model_server:app", "--host", "0.0.0.0", "--port", "8008"]