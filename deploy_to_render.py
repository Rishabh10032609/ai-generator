#!/usr/bin/env python3
"""
Render Deployment Helper Script
Guides through the deployment process step-by-step
"""

import subprocess
import os
import secrets
from pathlib import Path


def run_command(cmd, description):
    """Run a shell command and report status"""
    print(f"\n📝 {description}...")
    try:
        subprocess.run(cmd, shell=True, check=True)
        print(f"✅ {description} successful")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        return False


def main():
    print("""
╔═══════════════════════════════════════════════════════════════╗
║          🚀 Render Deployment Setup Script                   ║
║          AI Generator Backend                                ║
╚═══════════════════════════════════════════════════════════════╝
    """)

    # Step 1: Check prerequisites
    print("\n📋 Starting deployment setup...\n")
    
    # Step 2: Generate SECRET_KEY
    print("🔐 Generating Production SECRET_KEY...")
    secret_key = secrets.token_urlsafe(32)
    print(f"   Secret Key: {secret_key}")
    print("   ⚠️  Copy this - you'll need it in Render Dashboard")
    
    # Step 3: Check file existence
    print("\n📂 Checking required files...")
    required_files = [
        'Procfile',
        'Dockerfile',
        'render.yaml',
        'backend/requirements.txt',
        'backend/config.py',
        '.env.production'
    ]
    
    missing = []
    for file in required_files:
        if Path(file).exists():
            print(f"   ✅ {file}")
        else:
            print(f"   ❌ {file} - MISSING")
            missing.append(file)
    
    if missing:
        print(f"\n⚠️  Missing files: {', '.join(missing)}")
        print("   Run setup again or check file paths")
        return
    
    # Step 4: Validate Python dependencies
    print("\n📦 Checking Python dependencies...")
    required_deps = ['gunicorn', 'psycopg2-binary', 'uvicorn', 'fastapi']
    
    with open('backend/requirements.txt', 'r') as f:
        requirements = f.read().lower()
    
    for dep in required_deps:
        if dep.lower() in requirements.lower():
            print(f"   ✅ {dep}")
        else:
            print(f"   ❌ {dep} - MISSING from requirements.txt")
    
    # Step 5: Test build locally (optional)
    print("\n🏗️  Testing local build...")
    print("   Skipped - run manually if needed:")
    print("   $ pip install -r backend/requirements.txt")
    print("   $ gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app")
    
    # Step 6: Deployment checklist
    print("""
╔═══════════════════════════════════════════════════════════════╗
║               📋 DEPLOYMENT CHECKLIST                         ║
╚═══════════════════════════════════════════════════════════════╝

Before deploying to Render:

✅ Backend Preparation:
   □ All files exist (Procfile, Dockerfile, render.yaml)
   □ requirements.txt includes gunicorn and psycopg2-binary
   □ .env NOT committed to GitHub
   □ .gitignore includes .env and .env.*

✅ GitHub:
   □ Code pushed to GitHub
   □ GitHub repo URL ready

✅ Render Setup:
   □ Render account created (https://render.com)
   □ PostgreSQL database created
   □ Environment variables ready (see below)

✅ Environment Variables to Set in Render Dashboard:
   ┌─────────────────────────────────────────┐
   │ DATABASE_URL                            │
   │ (Automatically from PostgreSQL service) │
   │ SECRET_KEY: """ + secret_key[:20] + """... │
   │ GOOGLE_API_KEY: <your-key>              │
   │ HUGGING_FACE_TOKEN: <your-token>        │
   │ CORS_ORIGINS: <your-frontend-url>       │
   │ API_DEBUG: false                        │
   └─────────────────────────────────────────┘

Next Steps:

1. Ensure all checks above are complete
2. Go to https://dashboard.render.com
3. Click "+ New" → "Web Service"
4. Connect your GitHub repo
5. Use settings from render.yaml:
   - Build Command: pip install -r backend/requirements.txt
   - Start Command: gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app
6. Add Environment Variables (copy from .env.production)
7. Click Deploy

Verification:

After deployment (5-10 minutes):
1. Check Service Status: Render Dashboard → Logs
2. Test health endpoint:
   curl https://your-service-name.onrender.com/health
3. Test registration:
   curl -X POST https://your-service-name.onrender.com/api/auth/register \\
     -H "Content-Type: application/json" \\
     -d '{"email":"test@example.com","password":"test123"}'

📚 Documentation:
   - Deployment guide: RENDER_DEPLOYMENT.md
   - Architecture: REFACTORING.md
   - Quick start: QUICK_START.md
    """)
    
    print("\n✨ Setup complete! Follow the checklist above to deploy.\n")


if __name__ == "__main__":
    main()
