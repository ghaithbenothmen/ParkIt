FROM python:3.7.4-slim

# Installer les bibliothèques système nécessaires pour OpenCV et autres dépendances
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les dépendances Python et installer
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste du code source
COPY . .

# Exposer le port Flask par défaut
EXPOSE 5000

# Lancer l'application
CMD ["python", "app.py"]
