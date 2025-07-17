# Use an official Python runtime as a parent image
FROM python:3.9-slim-buster

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your LLM server application code into the container
COPY . .

# Expose the port your Flask app will listen on.
# Azure App Service will map its external port to this internal port.
# We'll use 8000 as a common default, but your Gunicorn command will use $PORT.
EXPOSE 8000

# Command to run the application using Gunicorn
# 'app:app' means the Flask application instance named 'app' in 'app.py'
# The $PORT environment variable is injected by Azure App Service
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]