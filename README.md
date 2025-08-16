# DSA Brother Bot - Full Stack Application

A comprehensive full-stack application for Data Structures and Algorithms learning assistance, featuring a React frontend and Express.js backend with MongoDB integration.

## Project Structure

```
dsa-brother-bot/
├── frontend/          # React application (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── server.js
│   └── package.json
└── package.json       # Root package.json for managing both apps
```

## Features

- **Frontend**: Modern React application with Tailwind CSS styling
- **Backend**: RESTful API with Express.js
- **Database**: MongoDB integration with Mongoose ODM
- **Authentication**: JWT-based user authentication
- **Security**: Helmet, CORS, and rate limiting
- **Development**: Hot reload for both frontend and backend

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dsa-brother-bot
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
   - Copy `backend/.env` and update with your configuration
   - Update MongoDB URI and JWT secrets

### Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:5173
- Backend on http://localhost:3001

### Individual Commands

Run only frontend:
```bash
npm run dev:frontend
```

Run only backend:
```bash
npm run dev:backend
```

### Production Build

Build the frontend for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Coming Soon
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/chats` - Get user chats
- `POST /api/chats` - Create new chat

## Technology Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Axios
- React Router (planned)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Helmet for security
- CORS for cross-origin requests
- Rate limiting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.