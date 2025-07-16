
# Dockerfile

# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# --no-cache-dir makes the image smaller
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code into the container at /app
COPY . .

# Let Docker know that the container listens on port 8000
EXPOSE 8000

# Define the command to run your app using Gunicorn
# Replace 'your_main_file_name' with the name of your python script (e.g., app.py)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "app.py:app"]