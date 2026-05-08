# Use official Python runtime as a parent image
FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Expose port
EXPOSE 8000

# Environment variables for OpenAI API key
# Pass OPENAI_API_KEY when running the container

# Collect static (if needed) and run migrations on startup
# (optional: uncomment if you have migrations/static to collect)
# RUN python manage.py collectstatic --noinput

# Start server using Gunicorn
CMD ["gunicorn", "ddai_api.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "300", \
     "--keep-alive", "5", \
     "--max-requests", "1000", \
     "--max-requests-jitter", "100", \
     "--worker-class", "gevent", \
     "--worker-connections", "1000", \
     "--workers", "2", \
     "--threads", "4"]
