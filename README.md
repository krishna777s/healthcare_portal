# Hospital Management Portal

A comprehensive Entity Management Portal (EMP) for hospitals built with a React frontend and a FastAPI (Python) backend connected to a local PostgreSQL database.

## Architecture

This project is structured as a monorepo containing two main components:

- `frontend/`: The React application built with Vite, TypeScript, and Tailwind CSS.
- `backend/`: The FastAPI Python application that handles database interactions, secure authentication (JWT/bcrypt), and API endpoints.

## Local Development Setup

### 1. Database Setup
1. Open pgAdmin and create a new, empty database named `hospital_management`.
2. Ensure your PostgreSQL instance is running on `localhost:5432`.

### 2. Backend Setup
Navigate to the `backend` directory and start the server:

```powershell
cd backend

# Create and activate virtual environment (optional if installed globally)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server (this will automatically create the database tables)
python main.py
```
The backend will be available at `http://localhost:8000`.

### 3. Frontend Setup
Open a new terminal, navigate to the `frontend` directory, and start the development server:

```powershell
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend will be available at `http://localhost:8080`.

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn-ui, Axios
- **Backend**: Python, FastAPI, Uvicorn, SQLAlchemy, psycopg2, PyJWT, bcrypt
- **Database**: PostgreSQL
