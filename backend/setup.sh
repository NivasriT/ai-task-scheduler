#!/bin/bash
set -o errexit
set -x  # Enable debug output

# Create a local virtual environment
echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install gunicorn first
echo "Installing gunicorn..."
pip install --no-cache-dir gunicorn==21.2.0

# Install requirements
echo "Installing requirements..."
pip install --no-cache-dir -r requirements.txt

# Verify installations
echo "=== Verifying installations ==="
which gunicorn || echo "Gunicorn not found in PATH"
pip list | grep gunicorn || echo "Gunicorn not found in pip list"

# Create a start script
echo '#!/bin/bash
source venv/bin/activate
exec gunicorn --bind 0.0.0.0:${PORT:-10000} --timeout 600 --workers 4 app:app
' > start.sh
chmod +x start.sh

echo "=== Setup completed successfully ==="
echo "Python path: $(which python)"
echo "Gunicorn path: $(which gunicorn)"
exit 0
