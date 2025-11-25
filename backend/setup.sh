#!/bin/bash
set -o errexit

# Install system dependencies
echo "Updating package lists..."
apt-get update
echo "Installing build dependencies..."
apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    python3-pip \
    python3-venv

# Create and activate virtual environment
echo "Creating virtual environment..."
python3 -m venv /opt/render/project/venv
source /opt/render/project/venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Install gunicorn first
echo "Installing gunicorn..."
python -m pip install gunicorn==21.2.0

# Install requirements
echo "Installing requirements..."
python -m pip install --no-cache-dir -r requirements.txt

# Verify installations
echo "Verifying installations..."
which gunicorn || echo "Gunicorn not in PATH"
python -m pip list | grep gunicorn || echo "Gunicorn not found in pip list"

# Create a wrapper script for gunicorn
echo '#!/bin/bash
source /opt/render/project/venv/bin/activate
exec python -m gunicorn "$@"
' > /usr/local/bin/gunicorn_wrapper.sh
chmod +x /usr/local/bin/gunicorn_wrapper.sh

echo "Setup completed successfully!"
