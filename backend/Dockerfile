# Use official Python 3.11 slim image
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Cloud Run expects the container to listen on the port defined by the PORT environment variable.
# We default to 8080 if not set.
ENV PORT 8080

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
