# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/dbcaa0ae-c17f-4b02-85e7-ef3a7aa09ef4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/dbcaa0ae-c17f-4b02-85e7-ef3a7aa09ef4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Zitadel OIDC Authentication

## Zitadel Authentication Setup

### Option 1: Use Demo Zitadel Instance (Quick Start)

For development and testing, the app is configured to use Zitadel's demo instance by default. This should work out of the box for testing the authentication flow.

### Option 2: Use Your Own Zitadel Instance

To use your own Zitadel instance, create a `.env` file in the project root:

```env
# Your Zitadel instance URL (e.g., https://your-instance.zitadel.cloud)
VITE_ZITADEL_AUTHORITY=https://your-zitadel-instance.com

# Your Zitadel client ID
VITE_ZITADEL_CLIENT_ID=your-client-id-here
```

**Important:** Make sure to configure the redirect URIs in your Zitadel client settings:

**For Development:**
```
http://localhost:5173/callback
http://localhost:5173/login
```

**For Production:**
```
https://your-domain.com/callback
https://your-domain.com/login
```

**Note:** The `/login` URI is needed for the logout redirect functionality. If you can't add it to your Zitadel client, the logout will work locally but won't clear the Zitadel server session.

### Troubleshooting

If you see `net::ERR_NAME_NOT_RESOLVED` errors:
1. Make sure you're using a valid Zitadel instance URL
2. Check that your `.env` file has the correct `VITE_ZITADEL_AUTHORITY`
3. For development, you can use the demo instance: `https://demo.zitadel.cloud`

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/dbcaa0ae-c17f-4b02-85e7-ef3a7aa09ef4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
