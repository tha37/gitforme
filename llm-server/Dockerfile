# Use an official Python runtime as a parent image
FROM python:3.11-slim-buster
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["gunicorn", "--timeout", "120", "--bind", "0.0.0.0:5001", "app:app"]