# Beyond Vision

Beyond Vision is a Next.js App Router web platform for the Beyond Vision creator marketing brand. It includes the public marketing site, creator and campaign showcase pages, admin content-management screens, API routes, migration scripts, and the media assets needed to run the current site.

## Tech Stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Framer Motion for interface animation
- Firebase for content and admin workflows
- Cloudflare R2-compatible storage through the AWS S3 SDK
- ESLint with the Next.js configuration

## Project Structure

```text
src/app/              App Router pages, admin screens, API routes, and server actions
src/components/       Shared UI components and component-scoped CSS modules
src/lib/              Content models, Firebase/R2 clients, data defaults, and helpers
public/               Site imagery, icons, brand logos, creator assets, case-study media, and visual references
scripts/              Utility scripts for logo normalization and campaign media migration
logos/                Source brand logo assets used by logo processing scripts
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Fill in the Firebase, Logo.dev, admin session, and Cloudflare R2 values in `.env.local`.

Run the development server:

```bash
npm run dev
```

Validate the project:

```bash
npm run lint
npm run build
```

## Environment Variables

The tracked `.env.example` file documents the required variables:

- `NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY` for Logo.dev image requests
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` for the admin session flow
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `NEXT_PUBLIC_R2_PUBLIC_URL` for campaign media storage

Do not commit `.env.local` or any production secret files.

## Current State

This repository contains the current Beyond Vision application source, public media assets, content defaults, admin tooling, and migration scripts. Local dependencies, build artifacts, runtime logs, generated screenshots, debug outputs, and private environment files are intentionally excluded from version control.
