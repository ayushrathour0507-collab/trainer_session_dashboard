# BytesAndBeyond

BytesAndBeyond is a full-stack internal Knowledge Transfer management platform for trainer-led Saturday sessions, admin-led evaluation, feedback collection, poster generation, and leaderboard tracking.

## Architecture

```text
bytesandbeyond/
├── frontend/        # React + Vite client application
├── backend/         # Express API and application services
├── database/        # Mongo connection config, seeders, and backup workspace
├── demo-video/      # Generated walkthrough assets
├── scripts/         # Local automation scripts
├── docker-compose.yml
├── package.json     # Root workspace scripts
└── README.md
```

### Frontend

The frontend is organized for scalable UI work:

- `src/components` - reusable feature and shared UI components
- `src/pages` - route-level pages
- `src/layouts` - shell, topbar, sidebar, and structural layout pieces
- `src/hooks` - shared UI/data hooks
- `src/services` - API client and transport logic
- `src/context` - application-wide providers such as theme state
- `src/utils` - formatting, scoring, parsing, export, and search helpers
- `src/assets` - imported static assets
- `src/styles` - global styles and design tokens

### Backend

The backend keeps API logic in the standard service-oriented Express layout:

- `src/controllers`
- `src/routes`
- `src/models`
- `src/middleware`
- `src/services`
- `src/config`
- `src/utils`
- `src/validators`

### Database

MongoDB-specific runtime concerns live under `database/`:

- `config/mongo.connection.js` - shared Mongoose connection bootstrap
- `seeders/seed.js` - sample data loader
- `backups/` - reserved for exports/snapshots

## Requirements

- Node.js 20+
- MongoDB 7+ (local or Docker)
- npm 10+

## Environment

Create these files before running the app:

- `frontend/.env`
- `backend/.env`

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_MODULE_BASE=/
```

### `backend/.env`

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/bytesandbeyond
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLIENT_URL=http://localhost:3000
```

## Install

From the project root:

```bash
npm install
```

This installs both workspace packages (`frontend` and `backend`) plus the root development tooling.

## Development

### Start MongoDB

Option 1: local MongoDB

Option 2: Docker

```bash
docker compose up -d mongo
```

### Seed the database

```bash
npm run seed
```

### Run the full application

```bash
npm run dev
```

App URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

You can also run each side independently:

```bash
npm run dev:frontend
npm run dev:backend
```

## Production

Build the frontend:

```bash
npm run build
```

Start the backend:

```bash
npm run start
```

## Seeded Accounts

Admin:

- Email: `ayush@iamneo.ai`
- Password: `Admin@123`

Trainer accounts:

- Email pattern: `<trainer-name>@iamneo.ai`
- Password: `Trainer@123`

## Notes

- Feedback, evaluation, transcript analysis, poster generation, leaderboard calculations, and trainer/admin role flows are preserved from the existing implementation.
- Meeting/session sample data is loaded from the database seed script in `database/seeders/seed.js`.
