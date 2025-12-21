FROM python:3.9-slim

WORKDIR /app

# Install system dependencies with newer cmake
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    python3-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install newer cmake to fix dlib build
RUN wget -O - https://apt.kitware.com/keys/kitware-archive-latest.asc 2>/dev/null | apt-key add - && \
    echo 'deb https://apt.kitware.com/ubuntu/ focal main' > /etc/apt/sources.list.d/kitware.list && \
    apt-get update && apt-get install -y cmake || true

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Create database directory
RUN mkdir -p database

EXPOSE 8080

CMD ["python", "app.py"]