#!/bin/bash
set -o errexit
set -x  # Enable debug output

# Print environment variables for debugging
echo "=== Environment Variables ==="
printenv | sort

# Set paths
RENDER_VENV_DIR="/opt/render/project/venv"
APP_DIR="$(pwd)"

# Create and activate virtual environment
echo "=== Setting up Python environment in $RENDER_VENV_DIR ==="
python3 -m venv $RENDER_VENV_DIR
source $RENDER_VENV_DIR/bin/activate

# Set Python path
export PYTHONPATH="$PYTHONPATH:$APP_DIR"

# Upgrade pip and setuptools
echo "=== Upgrading pip and setuptools ==="
python -m pip install --upgrade pip setuptools wheel

# Install gunicorn first with explicit version
echo "=== Installing gunicorn ==="
python -m pip install --no-cache-dir gunicorn==21.2.0

# Install requirements with verbose output
echo "=== Installing requirements ==="
python -m pip install --no-cache-dir -r requirements.txt

# Verify installations
echo "=== Verifying installations ==="
ls -la $RENDER_VENV_DIR/bin/ || echo "Virtual environment bin directory not found"
ls -la $RENDER_VENV_DIR/bin/gunicorn || echo "Gunicorn binary not found"
$RENDER_VENV_DIR/bin/python -c "import gunicorn; print(f'Gunicorn version: {gunicorn.__version__}')" || echo "Failed to import gunicorn"

# Create start script
echo "=== Creating start script ==="
cat > start.sh << 'EOL'
#!/bin/bash
set -e

# Activate the virtual environment
source /opt/render/project/venv/bin/activate

# Change to the backend directory
cd /opt/render/project/src/backend

# Debug info
echo "=== Starting application ==="
echo "Current directory: $(pwd)"
echo "Python path: $(which python)"
echo "Gunicorn path: $(which gunicorn)"
echo "Installed packages:"
pip list
echo "Files in current directory:"
ls -la

# Set Python path to include the current directory
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Run gunicorn using the application factory pattern with Python module syntax
exec python -m gunicorn --bind 0.0.0.0:${PORT:-10000} --timeout 600 --workers 4 "app:create_app()"
EOL

chmod +x start.sh

# Print debug information
echo "=== Setup completed ==="
echo "Current directory: $(pwd)"
echo "Python path: $(which python)"
echo "Pip path: $(which pip)"
$RENDER_VENV_DIR/bin/python -c "import sys; print('\n'.join(sys.path))"

# List installed packages for debugging
echo "=== Installed packages in $RENDER_VENV_DIR ==="
$RENDER_VENV_DIR/bin/pip list

# Create a symlink for backward compatibility
ln -sf $RENDER_VENV_DIR venv || echo "Failed to create venv symlink"

exit 0
