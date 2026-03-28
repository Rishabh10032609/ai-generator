#!/bin/bash

# Test script for Update Feature
# Run this to verify the update system is working

echo "========================================="
echo "Update Feature Test Suite"
echo "========================================="
echo ""

# Check if backend is running
echo "1️⃣ Checking if backend is running..."
if curl -s http://localhost:8000/api/version/current > /dev/null 2>&1; then
    echo "✅ Backend is running on localhost:8000"
else
    echo "❌ Backend is NOT running"
    echo "   Start it with: cd backend && python main.py"
    exit 1
fi

echo ""

# Test 1: Get current version
echo "2️⃣ Testing GET /api/version/current"
echo "Request: GET /api/version/current"
echo ""
echo "Response:"
curl -s http://localhost:8000/api/version/current
echo ""
echo ""

# Test 2: Check for update (current version is behind)
echo "3️⃣ Testing POST /api/version/check (version 0.0.1 - should show update)"
echo "Request: POST /api/version/check"
echo "Body: {\"currentVersion\": \"0.0.1\", \"platform\": \"android\"}"
echo ""
echo "Response:"
curl -s -X POST http://localhost:8000/api/version/check \
  -H "Content-Type: application/json" \
  -d '{"currentVersion":"0.0.1","platform":"android"}'
echo ""
echo ""

# Test 3: Check for update (current version is current)
echo "4️⃣ Testing POST /api/version/check (version 0.0.2 - should NOT show update)"
echo "Request: POST /api/version/check"
echo "Body: {\"currentVersion\": \"0.0.2\", \"platform\": \"android\"}"
echo ""
echo "Response:"
curl -s -X POST http://localhost:8000/api/version/check \
  -H "Content-Type: application/json" \
  -d '{"currentVersion":"0.0.2","platform":"android"}'
echo ""
echo ""

# Test 4: Check for iOS
echo "5️⃣ Testing POST /api/version/check (iOS platform)"
echo "Request: POST /api/version/check"
echo "Body: {\"currentVersion\": \"0.0.1\", \"platform\": \"ios\"}"
echo ""
echo "Response:"
curl -s -X POST http://localhost:8000/api/version/check \
  -H "Content-Type: application/json" \
  -d '{"currentVersion":"0.0.1","platform":"ios"}'
echo ""
echo ""

echo "========================================="
echo "✅ All tests completed!"
echo "========================================="
echo ""
echo "To test the frontend update feature:"
echo "1. Make sure backend is running"
echo "2. Run: npm run dev"
echo "3. Open http://localhost:5173 in browser"
echo "4. You should see the update modal"
echo ""
