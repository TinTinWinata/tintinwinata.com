# tintinwinata.com

Personal portfolio for [Justine Winata](https://tintinwinata.com), a Singapore-based senior software engineer building AI infrastructure, distributed video systems, and developer tools.

The site highlights selected engineering work, professional experience, technical writing, research, recognition, and certifications in a focused, responsive format.

## Tech stack

- [Astro](https://astro.build/) for the static site
- [React](https://react.dev/) for interactive components
- TypeScript
- OpenAI Sites for hosting

## Local development

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Astro will print the local URL when the server is ready.

## Production build

```sh
npm run build
```

This runs Astro's type and content checks, creates the static production build, and prepares the output for deployment.

## Project structure

```text
src/components/   Reusable UI components
src/data/         Portfolio content
src/layouts/      Shared page layout and metadata
src/pages/        Site routes
src/styles/       Global styling
public/           Images, documents, and other static assets
```

## Deployment

The production site is deployed with OpenAI Sites and configured for [tintinwinata.com](https://tintinwinata.com).
