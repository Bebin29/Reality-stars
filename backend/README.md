# Reality Stars Backend API

A Node.js/Express/TypeScript backend API for managing reality TV personalities, shows, and related data using Supabase as the database.

## 🚀 Features

- **RESTful API** with full CRUD operations
- **TypeScript** for type safety
- **Supabase** integration for database operations
- **JWT Authentication** via Supabase Auth
- **Input Validation** with Joi
- **Rate Limiting** for API protection
- **CORS** support for frontend integration
- **Security** headers with Helmet
- **Logging** with Morgan
- **Compression** for better performance

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

## 🛠️ Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```

4. **Configure your `.env` file:**
   ```env
   PORT=3001
   NODE_ENV=development
   
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=1h
   
   FRONTEND_URL=http://localhost:5173
   
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Build the project:**
   ```bash
   npm run build
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Health Check
```http
GET /health
```

### Personalities Endpoints

#### Get All Personalities
```http
GET /api/personalities
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search by first or last name
- `gender` (string): Filter by gender ('männlich', 'weiblich', 'divers')
- `nationality` (string): Filter by nationality
- `sort_by` (string): Sort field ('first_name', 'last_name', 'birth_date', 'created_at')
- `sort_order` (string): Sort order ('asc', 'desc')

**Example:**
```http
GET /api/personalities?page=1&limit=10&search=John&gender=männlich&sort_by=first_name&sort_order=asc
```

#### Get Personality by ID
```http
GET /api/personalities/:id
```

**Response includes related data:**
- Social media accounts
- TV show appearances
- Controversies
- Awards
- Media files
- External links

#### Search Personalities
```http
GET /api/personalities/search?q=searchTerm&limit=10
```

#### Get Personalities by TV Show
```http
GET /api/personalities/by-show/:showId
```

#### Create Personality (Authentication Required)
```http
POST /api/personalities
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "birth_date": "1990-01-01",
  "birth_place": "Berlin",
  "nationality": "German",
  "gender": "männlich",
  "bio": "Reality TV personality...",
  "profile_image": "https://example.com/image.jpg"
}
```

#### Update Personality (Authentication Required)
```http
PUT /api/personalities/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Jane",
  "bio": "Updated bio..."
}
```

#### Delete Personality (Authentication Required)
```http
DELETE /api/personalities/:id
Authorization: Bearer <token>
```

## 🔐 Authentication

The API uses Supabase Auth for authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

**Protected endpoints require authentication:**
- POST /api/personalities
- PUT /api/personalities/:id
- DELETE /api/personalities/:id

**Public endpoints (no authentication required):**
- GET /api/personalities
- GET /api/personalities/:id
- GET /api/personalities/search
- GET /api/personalities/by-show/:showId

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **JWT Authentication**: Supabase Auth integration

## 🗃️ Database Schema

The API works with the following main entities:

- **Personalities**: Reality TV stars and public figures
- **TV Shows**: Reality TV shows and formats
- **Appearances**: Personality appearances in shows
- **Social Media Accounts**: Social media profiles
- **Controversies**: Scandals and controversies
- **Awards**: Prizes and recognitions
- **Media**: Photos, videos, and clips

## 🧪 Testing

```bash
npm test
```

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License 