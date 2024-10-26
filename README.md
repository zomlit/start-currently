# Currently (livestreaming.tools)

Currently is a modern web application for streamers built with Tanstack Start, React, Tailwind CSS and Supabase with Prisma ORM.

## Features

- **React 19**: Utilizes the latest React features for optimal performance.

- **TypeScript**: Fully typed for better developer experience and code reliability.

- **Supabase**: Utilizes Supabase for database and authentication. We also use Prisma as an ORM.

- **Authentication**: Integrated with Clerk for secure user authentication.

- **Routing**: Uses TanStack Router for efficient client-side routing.

- **State Management**: Leverages Zustand for state management and TanStack Query for server state management.

- **UI Components**: Includes a variety of custom UI components built with Radix UI primitives.

- **Animations**: Incorporates Framer Motion for smooth animations.

## Getting Started

1. Clone the repository

2. Install dependencies:

`bun install`

3. Start the development server:

`bun run dev`

## Scripts

- `bun run dev`: Start the development server

- `bun run build`: Build the production-ready application

- `bun run start`: Start the production server

- `bun run lint`: Run linting checks

- `bun run format`: Format the codebase

## Key Dependencies

- React: ^19.0.0-rc

- Tailwind CSS: ^3.4.14

- TanStack Start: ^1.69.2

- TanStack Router: ^1.69.1

- TanStack Query: ^5.59.15

- Clerk: ^0.4.13

- Framer Motion: ^11.11.9

## Deployment

This project is self-hosted utilizing [Coolify](https://coolify.io/)
https://coolify.livestreaming.tools/

## Project Structure

- `app/`: Main application code (\_app is the primary layout)

- `components/`: Reusable React components

- `hooks/`: Custom React hooks

- `utils/`: Utility functions

- `routes/`: Application routes

## API

The API is a separate backend utilizing [Elysia](https://elysiajs.com/).

Repo: https://github.com/zomlit/lst-overlay  
Docs: https://lstio.livestreaming.tools/docs

This repo also contains a Tauri application for running a Windows app using rust - the rust application currently serves as a host for Rocket League overlays with plans in the future for more game titles and local optimizations.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
