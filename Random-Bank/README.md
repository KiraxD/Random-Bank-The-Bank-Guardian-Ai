# Random Bank

A full-stack banking application that runs completely locally. This project includes:

- **Frontend**: React + TailwindCSS
- **Backend**: Node.js + Express + PostgreSQL
- **ML Service**: FastAPI for fraud detection (mocked)

## Features

- User authentication (signup/login) with JWT
- Create and view transactions (deposits, withdrawals, transfers)
- Fraud detection for transactions
- Responsive UI with TailwindCSS

## Project Structure

```
Random-Bank/
├── backend/               # Node.js + Express backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   └── routes/        # API routes
│   ├── .env.example       # Environment variables example
│   ├── Dockerfile         # Docker configuration for backend
│   └── package.json       # Node.js dependencies
├── frontend/              # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── assets/        # Images, fonts, etc.
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (auth)
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   ├── Dockerfile         # Docker configuration for frontend
│   └── package.json       # React dependencies
├── ml-service/            # FastAPI fraud detection service
│   ├── app/               # FastAPI application
│   ├── Dockerfile         # Docker configuration for ML service
│   └── requirements.txt   # Python dependencies
├── docker/                # Docker related files
├── docker-compose.yml     # Docker Compose configuration
└── README.md              # Project documentation
```

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.9+ (for local development of ML service)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/random-bank.git
cd random-bank
```

2. Create environment files:

```bash
# Backend
cp backend/.env.example backend/.env
# Edit the .env file with your configuration
```

3. Start the application using Docker Compose:

```bash
docker-compose up
```

4. Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- ML Service API: http://localhost:8000

## Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### ML Service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile (protected)

### Transactions

- `POST /api/transactions` - Create a new transaction (protected)
- `GET /api/transactions` - Get user transactions (protected)
- `GET /api/transactions/:id` - Get transaction by ID (protected)

### ML Service

- `POST /predict` - Predict fraud for a transaction

## License

This project is licensed under the MIT License.
