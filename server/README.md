# Backend Server Setup

## Supabase Configuration

### Step 1: Create a Supabase Account
1. Go to [Supabase](https://supabase.com/) and create a free account.
2. Create a new project.

### Step 2: Get API Credentials
1. In your Supabase project dashboard, go to `Settings` > `API`.
2. Copy the `Project URL` and `Service Role Key` (under Project API keys).

### Step 3: Update Environment Variables
1. Rename `.env.example` to `.env`.
2. Replace the placeholder values with your actual Supabase credentials:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```
3. Set a secure `JWT_SECRET` for token generation.

### Step 4: Create Database Tables
1. In your Supabase project dashboard, go to `SQL Editor`.
2. Copy and paste the SQL from `supabase-schema.sql`.
3. Click `Run` to create the necessary tables.

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### API Keys
- `GET /api/api-keys` - Get all API keys for the current user
- `GET /api/api-keys/:service` - Get a specific API key by service
- `POST /api/api-keys` - Save or update an API key
- `DELETE /api/api-keys/:id` - Delete an API key

### Generations
- `GET /api/generations` - Get all generations for the current user
- `GET /api/generations/:id` - Get a specific generation by ID
- `POST /api/generations` - Save a generation result
- `DELETE /api/generations/:id` - Delete a generation