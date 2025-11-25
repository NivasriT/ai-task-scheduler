#!/bin/bash
set -o errexit

# Install system dependencies
echo "Updating package lists..."
apt-get update
echo "Installing build dependencies..."
apt-get install -y --no-install-recommends \
    gcc \
    python3-dev

# Install Python dependencies
echo "Upgrading pip..."
python -m pip install --upgrade pip
echo "Installing requirements..."
pip install --no-cache-dir -r requirements.txt

echo "Setup completed successfully!"
