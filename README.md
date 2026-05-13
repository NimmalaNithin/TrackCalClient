# Track Cals Client

React/Vite frontend for Track Cals.

## Local Setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_BASE_URL` to the Spring Boot API URL.
3. Run `npm install`.
4. Run `npm run dev`.

## Scripts

- `npm run dev` starts the local Vite server.
- `npm run lint` checks the frontend.
- `npm run build` creates a production build.

## App Structure

- `src/hooks/AuthContext.jsx` stores the authenticated session and exposes auth actions.
- `src/lib/api.js` centralizes API calls and error handling.
- `src/pages/Home.jsx` renders the daily overview.
- `src/pages/Profile.jsx` manages user details and calorie targets.
- `src/pages/LogMeal.jsx` manages meal logging.
- `src/pages/Analytics.jsx` manages weight and exercise burn check-ins.
