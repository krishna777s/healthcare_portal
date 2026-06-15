# Assets Folder

This folder contains image assets for the application.

## Logo Files

**IMPORTANT:** Place your Cerevyn logo file in the `public` folder (not here):
- **Location**: `public/cerevyn-logo.png` (or `.svg`, `.jpg`, etc.)
- **Recommended size**: 32x32 pixels minimum, 64x64 pixels for better quality
- **Format**: PNG with transparency is recommended

## Usage

The logo is referenced in:
- `src/components/layout/Sidebar.tsx` - Sidebar logo
- `src/pages/Home.tsx` - Home page header logo

If the logo file is not found, the application will fallback to a "C" icon or Building2 icon.

## Image Assets

You can add image assets in two ways:

### Option 1: Public Folder (Recommended for logos and static images)
- Place images in `public/` folder
- Reference them as: `<img src="/cerevyn-logo.png" />`

### Option 2: Import from src/assets
- Place images in `src/assets/` folder
- Import them in components: `import logo from '@/assets/cerevyn-logo.png'`
- Use them as: `<img src={logo} />`

## Current Setup

The logo is currently configured to load from the `public` folder:
- Expected path: `public/cerevyn-logo.png`
- Fallback: Shows "C" icon if logo not found

## Instructions

1. Copy your Cerevyn logo file to: `public/cerevyn-logo.png`
2. The logo will automatically appear in the sidebar and home page header
3. If the file is not found, the app will show a fallback icon

