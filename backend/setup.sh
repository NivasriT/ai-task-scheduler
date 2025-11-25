#!/bin/bash
set -o errexit
set -x  # Enable debug output

# Create a virtual environment in the project directory
echo "Creating virtual environment..."
python3 -m venv /opt/render/project/venv

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
which gunicorn || echo "Gunicorn not found in PATH"
ls -la /opt/render/project/venv/bin/gunicorn || echo "Gunicorn binary not found"
python -m pip list | grep gunicorn || echo "Gunicorn not found in pip list"

# Create a simple start script
echo '#!/bin/bash
# Activate the virtual environment
export PATH="/opt/render/project/venv/bin:$PATH"
# Run the app
exec gunicorn app:app --bind 0.0.0.0:${PORT:-10000} --timeout 600
' > /opt/render/project/start.sh
chmod +x /opt/render/project/start.sh

# Create a symlink to gunicorn in /usr/local/bin
ln -sf /opt/render/project/venv/bin/gunicorn /usr/local/bin/gunicorn || echo "Failed to create symlink"

echo "=== Setup completed successfully ==="
echo "Python path: $(which python)"
echo "Gunicorn path: $(which gunicorn)"
exit 0
