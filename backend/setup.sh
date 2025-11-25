#!/bin/bash
set -o errexit
set -x  # Enable debug output

# Use system Python to create a virtual environment in the project directory
echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

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

# Create a simple start script
echo '#!/bin/bash
source venv/bin/activate
exec python -m gunicorn app:app --bind 0.0.0.0:${PORT:-10000} --timeout 600
' > start.sh
chmod +x start.sh

echo "=== Setup completed successfully ==="
exit 0
