# AI-Powered SaaS Web Application

A **full-stack, AI-powered SaaS application** designed to showcase modern software engineering skills, including **frontend, backend, database, microservices, and AI integration**. This project is perfect for demonstrating real-world development, deployment, and production-level practices.

---

## 🚀 Features

- **Full-Stack Architecture:** React frontend + FastAPI backend
- **AI Integration:** Supports ML/LLM-powered features
- **Database:** MongoDB for storing structured data
- **Authentication:** JWT-based login & role-based access
- **Environment Configurable:** Easily switch between development and production
- **Deployment Ready:** Dockerized and compatible with cloud deployment

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Yarn |
| Backend | FastAPI, Python 3.11+ |
| Database | MongoDB |
| AI/ML | Transformers / Custom ML Models |


---

## 📂 Project Setup

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd <repo-folder>
```
### Step 2: Local Setup Prerequisites

Install these on your computer:

- **Node.js (v18+)**: [https://nodejs.org](https://nodejs.org)  
- **Python (3.11+)**: [https://python.org](https://python.org)  
- **MongoDB**: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)  
- **Yarn**:  
  ```bash
  npm install -g yarn
  ```

### Step 3: Install Dependencies

### Backend
```bash
cd backend
pip install -r requirements.txt
 ```

## Running the Application

### Frontend Setup
Open a new terminal and run:

```bash
cd frontend
yarn install
```

## Step 4: Configure Environment Variables

### Backend `.env`
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="code_reviewer_db"
CORS_ORIGINS="http://localhost:3000"
EMERGENT_LLM_KEY=sk-emergent-4D0A317E6B149FcAb0
```

### Frontend `.env`
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Step 5: Run the Application

1. **Start MongoDB**  
   Open a terminal and run:  
   ```bash
   mongod
   ```
2. **Start Backend***
   Open a new terminal, navigate to the backend folder, and run:
   ```bash
   cd backend
   uvicorn server:app --reload --host 0.0.0.0 --port 8001
   ```
3. **Start Frontend***
   Open another terminal, navigate to the frontend folder, and run:
   ```bash
   cd frontend
   yarn start
   ```
4. ***Access the Application***
Open your browser and go to:
http://localhost:3000
