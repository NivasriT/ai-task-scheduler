#!/bin/bash
set -o errexit
set -x  # Enable debug output

# Install system dependencies
echo "Updating package lists..."
apt-get update
echo "Installing build dependencies..."
apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv

# Create and activate virtual environment
echo "Creating virtual environment..."
python3 -m venv /opt/render/project/venv
export PATH="/opt/render/project/venv/bin:$PATH"

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Install gunicorn first
echo "Installing gunicorn..."
python -m pip install --no-cache-dir gunicorn==21.2.0

# Install requirements
echo "Installing requirements..."
python -m pip install --no-cache-dir -r requirements.txt

# Verify gunicorn installation
echo "=== Verifying gunicorn installation ==="
python -m pip list | grep gunicorn
echo "Gunicorn path: $(which gunicorn)"

# Create a wrapper script
echo '#!/bin/bash
exec python -m gunicorn "$@"
' > /usr/local/bin/start-gunicorn
chmod +x /usr/local/bin/start-gunicorn

echo "=== Setup completed successfully ==="
exit 0
