# Development Manual: Rwanda Women Magazine

This manual outlines the safe development framework and workflow to maintain the platform's stability and prevent accidental changes to the production version.

## 1. Branching Strategy (GitFlow Lite)

We use a simplified version of GitFlow to separate work-in-progress from stable production code.

- **`main`**: The **Single Source of Truth**. This branch contains the code currently running in production. Only stable, tested, and reviewed code should be merged here.
- **`develop`**: The primary integration branch. All new feature branches are merged here first for testing in the preview environment.
- **`feature/*`**: Individual branches for specific tasks, bug fixes, or new features. (Example: `feature/login-system-update`).

### Workflow:
1. Created a new branch from `develop`: `git checkout -b feature/your-feature-name`
2. Work on your changes and commit locally.
3. Push the feature branch to remote: `git push origin feature/your-feature-name`
4. Create a Pull Request (PR) to merge into `develop`.
5. Once tested in the Vercel Preview environment, merge into `develop`.
6. When a release is ready, merge `develop` into `main`.

## 2. Environment Separation

Each environment has its own configuration and database connection.

| Environment | Branch | URL (Example) | Database | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Local** | N/A | `localhost:3000` | Local/Dev DB | Daily development and testing. |
| **Preview** | `feature/*`, `develop` | `*-git-develop-*.vercel.app` | Staging DB | Testing features before integration. |
| **Production** | `main` | `rwandawomenmagazine.rw` | Production DB | Live user-facing platform. |

## 3. Local Setup

### Environment Variables
Never commit sensitive credentials to the repository. Use `.env.local` for your local settings.

Reference the `.env.example` file for required variables:
- `DATABASE_URL`: Your local or dev PostgreSQL connection string.
- `JWT_SECRET`: A secure key for local authentication.
- `CLOUDINARY_*`: Credentials for image uploads.

### Running the App
```bash
# Install dependencies
npm install

# Run development server (frontend & backend)
npm run dev:all
```

## 5. Vercel Configuration (Cloud Staging/Production)

To ensure the preview and production environments stay separate, configure individual environment variables in the Vercel Dashboard:

1. Go to **Project Settings** > **Environment Variables**.
2. For variables like `DATABASE_URL`, create separate values for and assign them to specific environments:
   - **Production**: Assign the production database.
   - **Preview**: Assign the staging/development database.
3. Ensure "Automatically expose System Environment Variables" is enabled if needed for Vercel functions.

## 6. Deployment Safety Checklist

Before merging into `main` (Production):
- [ ] Ensure all tests pass (`npm test`).
- [ ] Verify the build succeeds (`npm run build`).
- [ ] Review changes in the Vercel Preview deployment (generated from `develop` or feature branch).
- [ ] Ensure all environment variables are correctly set in the Vercel Dashboard for the Production environment.
