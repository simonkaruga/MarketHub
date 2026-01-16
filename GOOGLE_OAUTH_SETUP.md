# Google OAuth Setup Guide

This guide will help you set up Google OAuth for your MarketHub application.

## Prerequisites
- A Google account
- Access to Google Cloud Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: "MarketHub" (or your preferred name)
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen first:
   - Click "Configure Consent Screen"
   - Choose "External" (unless you have a Google Workspace)
   - Fill in:
     - App name: `MarketHub`
     - User support email: Your email
     - Developer contact email: Your email
   - Click "Save and Continue"
   - Skip "Scopes" for now (click "Save and Continue")
   - Add test users if needed (optional for development)
   - Click "Save and Continue"

4. Back to creating OAuth client ID:
   - Application type: **Web application**
   - Name: `MarketHub Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for frontend dev server)
     - Add production URL later (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs**:
     - `http://localhost:5173` (for frontend dev server)
     - Add production URL later
   - Click "Create"

5. Copy the **Client ID** and **Client Secret** that appear

## Step 4: Configure Backend

1. Open `backend/.env` file
2. Update the following variables:

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

Replace with the values you copied from Google Cloud Console.

## Step 5: Configure Frontend

1. Open `frontend/market-app/.env` file
2. Update the following variable:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

Use the **same Client ID** from Step 4.

## Step 6: Test the Integration

### Backend Test:
1. Start the backend server:
   ```bash
   cd backend
   pipenv run python run.py
   ```

### Frontend Test:
1. Start the frontend dev server:
   ```bash
   cd frontend/market-app
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login` or `http://localhost:5173/register`
3. Click "Continue with Google" button
4. Sign in with your Google account
5. You should be redirected back and logged in!

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure `http://localhost:5173` is added to **both**:
  - Authorized JavaScript origins
  - Authorized redirect URIs
- URLs must match exactly (no trailing slashes, correct protocol)

### Error: "Invalid client ID"
- Double-check that you copied the Client ID correctly
- Make sure there are no extra spaces
- Verify the `.env` files are in the correct locations

### Google Sign In button not appearing
- Check browser console for errors
- Make sure you ran `npm install` after adding the OAuth package
- Verify the `VITE_GOOGLE_CLIENT_ID` is set correctly
- Restart the dev server after changing `.env`

### Email not verified automatically
- Google OAuth automatically sets `email_verified=True` if Google has verified the email
- Users won't need to verify via OTP when signing in with Google

## Production Deployment

When deploying to production:

1. Update **Authorized JavaScript origins** and **Authorized redirect URIs** in Google Cloud Console:
   - Add your production domain (e.g., `https://markethub.com`)

2. Update `.env` files with production URLs

3. Consider moving to "Published" status in OAuth consent screen for public access

## Security Notes

- Never commit `.env` files to version control
- Keep your Client Secret secure
- Use HTTPS in production
- Regularly review and rotate credentials
- Monitor OAuth usage in Google Cloud Console

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [React OAuth Library Docs](https://www.npmjs.com/package/@react-oauth/google)
