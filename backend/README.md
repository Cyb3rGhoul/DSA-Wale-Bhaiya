# DSA Brother Bot Backend

Backend API server for the DSA Brother Bot application built with Node.js, Express.js, and MongoDB.

## Features

- **Express.js Server**: RESTful API with proper middleware configuration
- **MongoDB Integration**: Database connection with Mongoose ODM
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Error Handling**: Comprehensive error handling and logging
- **Environment Configuration**: Flexible configuration management
- **Health Monitoring**: Health check endpoints with database status

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection configuration
│   │   └── env.js           # Environment variables validation
│   ├── middleware/
│   │   ├── errorHandler.js  # Global error handling middleware
│   │   └── logger.js        # Request logging middleware
│   └── utils/
│       ├── asyncHandler.js  # Async error wrapper
│       ├── dbStatus.js      # Database status utilities
│       └── response.js      # Standardized API responses
├── .env                     # Environment variables
├── package.json
├── server.js               # Main server file
└── README.md
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/dsa-brother-bot

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Security
BCRYPT_SALT_ROUNDS=12
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (Jest)

## API Endpoints

### Health Check
- `GET /api/health` - Server and database health status
- `GET /api` - API information and available endpoints

### Coming Soon
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/chats` - Get user chats
- `POST /api/chats` - Create new chat

## Middleware Stack

1. **Logger** - Request logging (development only)
2. **Helmet** - Security headers
3. **Rate Limiting** - Prevent abuse (100 requests per 15 minutes)
4. **CORS** - Cross-origin resource sharing
5. **Body Parser** - JSON and URL-encoded data parsing
6. **Error Handler** - Global error handling

## Database Connection

The application uses MongoDB with Mongoose ODM. The connection includes:

- Automatic reconnection handling
- Connection event logging
- Graceful shutdown on process termination
- Development mode fallback (continues without DB)

## Error Handling

Comprehensive error handling includes:

- Mongoose validation errors
- JWT token errors
- Database connection errors
- Rate limiting errors
- Custom application errors

## Security Features

- **Helmet**: Security headers
- **CORS**: Configured for frontend origin
- **Rate Limiting**: IP-based request limiting
- **Input Validation**: Request data validation
- **Environment Validation**: Required environment variables check

## Development

1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Start development server: `npm run dev`
4. Server will run on `http://localhost:3001`

## Health Check Response

```json
{
  "success": true,
  "message": "Health check successful",
  "data": {
    "status": "OK",
    "message": "DSA Brother Bot Backend is running",
    "timestamp": "2025-08-16T03:35:23.365Z",
    "environment": "development",
    "database": {
      "status": "connected",
      "message": "Database connected successfully"
    },
    "uptime": 123.456,
    "memory": {
      "rss": 50331648,
      "heapTotal": 20971520,
      "heapUsed": 15728640,
      "external": 1048576
    }
  }
}
```