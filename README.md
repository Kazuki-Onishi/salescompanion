<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1EezG2RPgoNWMvPZYv_bsYmvNWW08YqJt

## Run Locally

**Prerequisites:** Node.js

1. Copy `.env.example` to `.env.local` and fill in the values (Gemini + Firebase keys).
2. Install dependencies: `npm install`
3. Run the app: `npm run dev`

## Configure Firebase

1. Create a Firebase project (https://console.firebase.google.com/) and enable Firestore in Native mode.
2. Add a Web App from **Project settings > General** and copy the Firebase SDK configuration values.
3. Paste those values into `.env.local` using the following keys:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Update `.firebaserc` with your Firebase project id (`your-firebase-project-id`).

> The app automatically falls back to mock data if Firebase is not configured, so you can develop without Firestore access.

## Deploy with Firebase Hosting

1. Install the Firebase CLI if you do not have it yet: `npm install -g firebase-tools`
2. Authenticate and select your project:
   - `firebase login`
   - `firebase use --add <your-project-id>` (or edit `.firebaserc` directly)
3. Build and deploy the production bundle: `npm run deploy`
   - This runs `npm run build` and then `firebase deploy --only hosting`, pushing the `dist` directory defined in `firebase.json`.
4. (Optional) To preview locally before deploying: `firebase hosting:channel:deploy preview` or `firebase serve --only hosting`.

Once deployed, your SPA is served from Firebase Hosting and talks to Firestore using the credentials in `.env.local`.
