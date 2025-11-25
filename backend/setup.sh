#!/bin/bash
set -o errexit
set -x  # Enable debug output

# Create a local virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate the virtual environment
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

# Verify installations
echo "=== Verifying installations ==="
ls -la venv/bin/gunicorn || echo "Gunicorn binary not found"
python -m pip list | grep gunicorn || echo "Gunicorn not found in pip list"

echo "=== Setup completed successfully ==="
echo "Python path: $(which python)"
echo "Gunicorn path: $(which gunicorn)"

# Create a symbolic link to make gunicorn available in the expected location
mkdir -p /opt/render/project/venv/bin
ln -sf $(pwd)/venv/bin/gunicorn /opt/render/project/venv/bin/gunicorn || echo "Failed to create symlink"

exit 0
