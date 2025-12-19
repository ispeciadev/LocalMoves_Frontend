# Quick Fix for Vercel-Frappe Connection

## The Problem

Your frontend can't connect to backend because:
1. ❌ Wrong API URL format in Vercel
2. ❌ CORS not configured on Frappe

## Quick Fix (5 Minutes)

### 1. Fix Vercel Environment Variable

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Change:**
```
VITE_API_BASE_URL
```

**From:**
```
local-moves.m.frappe.cloud
```

**To:**
```
https://local-moves.m.frappe.cloud/api/method/
```

**Important:** Must include `https://` and `/api/method/`

### 2. Redeploy Vercel

- Go to Deployments tab
- Click "Redeploy" on latest deployment

### 3. Configure CORS on Frappe

**Login to Frappe Cloud Dashboard:**
- Go to your site settings
- Find CORS configuration
- Add allowed origin: `https://local-moves-frontend.vercel.app`

**OR add to site_config.json:**
```json
{
  "allow_cors": "*",
  "cors_allowed_origins": [
    "https://local-moves-frontend.vercel.app"
  ]
}
```

### 4. Test

Visit: https://local-moves-frontend.vercel.app/
Try to login - should work now!

## Still Not Working?

Check browser console (F12) for errors and see the detailed guide in implementation_plan.md
