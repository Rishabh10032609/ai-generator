#!/bin/bash
set -e

echo "Installing Python dependencies with pre-built wheels..."
pip install --upgrade pip setuptools wheel
pip install --only-binary=:all: -r requirements.txt || pip install -r requirements.txt --prefer-binary

echo "Build complete!"
