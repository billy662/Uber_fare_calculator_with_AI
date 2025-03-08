FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create resources directory
RUN mkdir -p resources

# Make sure the application runs under a non-root user
RUN useradd -m appuser
RUN chown -R appuser:appuser /app
USER appuser

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8080

# Use Gunicorn as the production server
CMD exec gunicorn --bind :8080 --workers 2 --threads 8 --timeout 0 app:app