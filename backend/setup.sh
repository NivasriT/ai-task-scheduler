#!/bin/bash
set -o errexit
set -x  # Enable debug output

# Print environment variables for debugging
echo "=== Environment Variables ==="
printenv | sort

# Create and activate virtual environment
echo "=== Setting up Python environment ==="
python3 -m venv venv
source venv/bin/activate

# Set Python path
export PYTHONPATH="$PYTHONPATH:$(pwd)"

# Upgrade pip and setuptools
echo "=== Upgrading pip and setuptools ==="
pip install --upgrade pip setuptools wheel

# Install gunicorn first with explicit version
echo "=== Installing gunicorn ==="
pip install --no-cache-dir --user gunicorn==21.2.0

# Install requirements with verbose output
echo "=== Installing requirements ==="
pip install --no-cache-dir -r requirements.txt

# Explicitly install flask-cors to ensure it's available
echo "=== Installing Flask-CORS ==="
pip install --no-cache-dir flask-cors==4.0.0

# Verify installations
echo "=== Verifying installations ==="
which python || echo "Python not found"
which pip || echo "Pip not found"
which gunicorn || echo "Gunicorn not in PATH"
pip list | grep -E "flask|gunicorn" || echo "Required packages not found"

# Print debug information
echo "=== Setup completed ==="
echo "Current directory: $(pwd)"
echo "Python path: $(which python)"
echo "Pip path: $(which pip)"
echo "Gunicorn path: $(which gunicorn)"
echo "Python module path: $(python -c 'import sys; print("\n".join(sys.path))')"

# List installed packages for debugging
echo "=== Installed packages ==="
pip list

exit 0
