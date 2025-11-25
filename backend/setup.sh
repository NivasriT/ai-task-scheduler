#!/bin/bash
set -o errexit
set -x  # Enable debug output

# Print environment variables for debugging
echo "=== Environment Variables ==="
printenv | sort

# Create virtual environment in the default Render location
RENDER_VENV_DIR="/opt/render/project/venv"
echo "=== Creating virtual environment in $RENDER_VENV_DIR ==="
python -m venv $RENDER_VENV_DIR
source $RENDER_VENV_DIR/bin/activate

# Set Python path
export PYTHONPATH="$PYTHONPATH:$(pwd)"

# Upgrade pip and setuptools
echo "=== Upgrading pip and setuptools ==="
pip install --upgrade pip setuptools wheel

# Install gunicorn first with explicit version
echo "=== Installing gunicorn ==="
pip install --no-cache-dir gunicorn==21.2.0

# Install requirements with verbose output
echo "=== Installing requirements ==="
pip install --no-cache-dir -r requirements.txt

# Verify installations
echo "=== Verifying installations ==="
which python || echo "Python not found"
which pip || echo "Pip not found"
which gunicorn || echo "Gunicorn not in PATH"

# Create a start script that uses the correct Python and Gunicorn paths
echo '#!/bin/bash
source /opt/render/project/venv/bin/activate
exec gunicorn --bind 0.0.0.0:${PORT:-10000} --timeout 600 --workers 4 app:app
' > start.sh
chmod +x start.sh

# Print debug information
echo "=== Setup completed ==="
echo "Current directory: $(pwd)"
echo "Python path: $(which python)"
echo "Pip path: $(which pip)"
echo "Gunicorn path: $(which gunicorn)"

# List installed packages for debugging
echo "=== Installed packages ==="
pip list

# Create a symlink to the virtual environment in the project directory
ln -s $RENDER_VENV_DIR venv || echo "Failed to create venv symlink"

exit 0
