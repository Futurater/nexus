# Use the official Python lightweight image
FROM python:3.11-slim

# Allow print statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED=True

# Set the working directory
WORKDIR /app

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application logic
COPY main.py .

# Run the web service on container startup using Uvicorn.
# Cloud Run expects the app to listen on the port defined by the PORT environment variable.
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT:=8080}
