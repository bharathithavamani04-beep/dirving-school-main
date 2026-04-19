# Driving School App - Copilot Instructions

This is a Next.js project with TypeScript, Tailwind CSS, and ESLint configured.

## Project Setup
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint
- **Package Manager**: npm

## Project Structure
```
src/
├── app/
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Home page
│   ├── globals.css     # Global styles
│   └── favicon.ico     # Favicon
public/                 # Static assets
package.json           # Dependencies and scripts
tsconfig.json          # TypeScript configuration
tailwind.config.ts     # Tailwind CSS configuration
next.config.ts         # Next.js configuration
```

## Available Scripts

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Getting Started

1. Navigate to the project folder
2. Run `npm run dev` to start the development server
3. Open http://localhost:3000 in your browser

## Development Notes

- Use the `src/app` directory for pages and components
- Modify `src/app/page.tsx` for the home page
- Add new pages in the `src/app` directory following Next.js App Router conventions
- Use `@/*` import alias for cleaner imports
- Configure Tailwind CSS in `tailwind.config.ts`
