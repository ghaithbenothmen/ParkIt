FROM python:3.7.4-slim

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

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install torch==1.13.1 torchvision==0.14.1

# Install ultralytics without dependencies to avoid OpenCV conflict
RUN pip install --no-deps ultralytics==8.0.20

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
