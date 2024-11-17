# School Meal Management

A modern web application for managing school meals and reservations.

## Development

```bash
npm install
npm run dev
```

## Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the main branch. To deploy manually:

```bash
npm run deploy
```

## Environment Variables

Create a `.env` file with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features

- Menu item management
- Meal reservations
- User authentication
- Admin panel
- Dietary preferences