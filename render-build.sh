#!/bin/bash
set -e

echo "=== Render Build Script ==="
echo "Python version: $(python --version)"
echo ""

echo "Step 1: Upgrade pip & setuptools..."
pip install --no-cache-dir --upgrade pip setuptools wheel

echo "Step 2: Clearing pip cache..."
pip cache purge || true

echo "Step 3: Installing dependencies with pre-built wheels..."
pip install --no-cache-dir --prefer-binary -r backend/requirements.txt

echo ""
echo "✅ Build complete!"
echo "Installed packages:"
pip list | grep -E "(pydantic|fastapi|sqlalchemy|psycopg2)"
