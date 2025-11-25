#!/bin/bash
set -o errexit

# Install system dependencies
echo "Updating package lists..."
apt-get update
echo "Installing build dependencies..."
apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    python3-pip

# Install Python dependencies
echo "Upgrading pip..."
python3 -m pip install --upgrade pip

# Install gunicorn first
echo "Installing gunicorn..."
pip3 install gunicorn==21.2.0

# Install requirements
echo "Installing requirements..."
pip3 install --no-cache-dir -r requirements.txt

# Verify installations
echo "Verifying installations..."
which gunicorn
python3 -m pip list | grep gunicorn

echo "Setup completed successfully!"
