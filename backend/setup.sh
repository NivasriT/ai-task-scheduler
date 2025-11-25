#!/bin/bash
set -o errexit
set -x  # Enable debug output

# Create directory for virtual environment
VENV_DIR="/opt/render/project/venv"
mkdir -p $VENV_DIR

# Create and activate virtual environment
echo "Creating virtual environment..."
python3 -m venv $VENV_DIR
source $VENV_DIR/bin/activate

# Add virtual environment bin to PATH
export PATH="$VENV_DIR/bin:$PATH"

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
which gunicorn || echo "Gunicorn not in PATH"
ls -la $VENV_DIR/bin/gunicorn || echo "Gunicorn binary not found"
python -m pip list | grep gunicorn || echo "Gunicorn not found in pip list"

# Create a test script to verify gunicorn can be imported
echo 'import gunicorn; print(f"Gunicorn version: {gunicorn.__version__}")' > /tmp/test_gunicorn.py
python /tmp/test_gunicorn.py || echo "Failed to import gunicorn"

echo "=== Environment PATH ==="
echo $PATH

echo "=== Virtual Environment Info ==="
which python
python --version

# Make sure gunicorn is executable
chmod +x $VENV_DIR/bin/gunicorn

# Create a symlink to gunicorn in /usr/local/bin
ln -sf $VENV_DIR/bin/gunicorn /usr/local/bin/gunicorn || echo "Failed to create symlink"

echo "=== Final gunicorn check ==="
/opt/render/project/venv/bin/gunicorn --version || echo "Gunicorn not found in venv bin"

# Make sure the script exits with success
echo "Setup completed successfully!"
exit 0
