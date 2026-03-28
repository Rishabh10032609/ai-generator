from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

# Define the current app version
LATEST_APP_VERSION = "0.0.2"  # Update this when you release a new version
MINIMUM_REQUIRED_VERSION = "0.0.1"  # Users below this MUST update

router = APIRouter(prefix="/api/version", tags=["version"])

class VersionCheckRequest(BaseModel):
    currentVersion: str
    platform: str = "android"  # android, ios, or web

class VersionCheckResponse(BaseModel):
    latestVersion: str
    minRequiredVersion: str
    updateUrl: str
    releaseNotes: str
    isForceUpdate: bool

# Version release notes - update these when you release a new version
VERSION_NOTES = {
    "0.0.2": """• Added auto-update feature
• Improved performance
• Bug fixes and enhancements""",
    "0.0.1": """• Initial release""",
}

@router.post("/check", response_model=VersionCheckResponse)
def check_version(request: VersionCheckRequest):
    """
    Check if a new app version is available
    
    Returns version info if update is available.
    The client uses this to decide whether to show an update prompt.
    """
    
    platform = request.platform.lower()
    
    if platform == "android":
        update_url = "https://play.google.com/store/apps/details?id=io.ionic.starter"
    elif platform == "ios":
        update_url = "https://apps.apple.com/app/ai-generator/id123456789"
    else:
        update_url = ""
    
    release_notes = VERSION_NOTES.get(
        LATEST_APP_VERSION, 
        "New version available with several improvements"
    )
    
    return VersionCheckResponse(
        latestVersion=LATEST_APP_VERSION,
        minRequiredVersion=MINIMUM_REQUIRED_VERSION,
        updateUrl=update_url,
        releaseNotes=release_notes,
        isForceUpdate=False  # Set to True to force users to update
    )

@router.get("/current")
def get_current_version():
    """Get current app version info"""
    return {
        "latest": LATEST_APP_VERSION,
        "minRequired": MINIMUM_REQUIRED_VERSION,
        "releaseNotes": VERSION_NOTES.get(LATEST_APP_VERSION, ""),
    }
