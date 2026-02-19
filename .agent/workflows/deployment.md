---
description: Safe deployment workflow for Rwanda Women Magazine.
---

## Deployment Workflow

Follow these steps to ensure a safe and stable deployment.

### 1. Feature Development
- Create a feature branch: `git checkout -b feature/name-of-task` from `develop`.
- Implement changes and run local tests: `npm test`.

### 2. Integration and Preview
- Commit changes: `git commit -m "feat: description"`
- Push to GitHub: `git push origin feature/name-of-task`
- Create a Pull Request (PR) to merge into `develop`.
- **Verify**: Check the Vercel Preview URL provided in the PR comments. Ensure functionality works as expected with the staging database.

### 3. Staging Approval
- Merge the PR into `develop` once verified.
- The `develop` branch deployment on Vercel serves as our "Staging" environment.

### 4. Production Release
- Create a PR from `develop` to `main`.
- Perform a final smoke test on the `develop` preview.
- Merge the PR into `main`.
- Vercel will automatically trigger the production build and deployment.
- **Verify**: Check [rwandawomenmagazine.rw](https://www.rwandawomenmagazine.rw) to ensure the live site is updated and healthy.

// turbo
### 5. Cleanup
- Delete the feature branch locally and remotely once merged.
