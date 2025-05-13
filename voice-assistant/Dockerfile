# Dockerfile for FastAPI application
FROM python:3.9-slim

WORKDIR /app

# Copy your requirements file and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . /app/

# Expose the port FastAPI runs on
EXPOSE 8000

# Command to run FastAPI (Uvicorn)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
