This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Use Node.js 24.22.1 or a newer Node.js 24 security patch. The Docker build
uses Node.js 24.22.1, and `.nvmrc` selects the same version for local development.
The Docker image uses Debian Bookworm slim for the official glibc-based
Node.js binaries on both AMD64 and ARM64.

```bash
nvm install
nvm use
npm ci
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Rebuild the Docker image

After committing changes to `main`, create a new annotated tag following the
existing `release-v<version>` naming convention. Push `main` and the new tag
to `origin` to automatically start the Docker Publish workflow.

The workflow builds both `linux/amd64` and `linux/arm64` images and publishes
the image under the release tag. Manual workflow dispatch is also available
for rebuilding `main` and publishing the `latest` image.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
