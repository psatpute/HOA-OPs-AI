# HOA OpsAI Backend

FastAPI backend for HOA Operations AI Management System.

## Setup

1. **Install Python 3.13** (or Python 3.11+)

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB Atlas connection string
   - Update `JWT_SECRET` with a secure random string (min 32 characters)

5. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```
   
   Or using Python directly:
   ```bash
   python main.py
   ```

## Testing

### Health Check
Visit http://localhost:8000/healthz to verify:
- Backend is running
- Database connection is working

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2023-10-20T10:30:00Z"
}
```

### API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── main.py           # FastAPI application entry point
├── config.py         # Configuration and environment variables
├── database.py       # MongoDB connection setup
├── requirements.txt  # Python dependencies
├── .env             # Environment variables (not in git)
└── .env.example     # Example environment variables
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_ENV` | Environment (development/production) | development |
| `PORT` | HTTP port | 8000 |
| `MONGODB_URI` | MongoDB Atlas connection string | (required) |
| `JWT_SECRET` | Secret key for JWT signing | (required) |
| `JWT_EXPIRES_IN` | JWT expiration in seconds | 86400 |
| `CORS_ORIGINS` | Allowed frontend URLs (comma-separated) | http://localhost:3000 |
| `UPLOAD_DIR` | Directory for file uploads | ./uploads |
| `MAX_FILE_SIZE` | Max file upload size in bytes | 10485760 |

## Next Steps

After completing Sprint S0, you can:
1. Test the `/healthz` endpoint
2. Verify CORS is working from the frontend
3. Proceed to Sprint S1 (Authentication)