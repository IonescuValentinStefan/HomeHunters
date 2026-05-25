# HomeHunters

A real estate platform with property listings, AI-powered price prediction, and recommendations.

## Architecture

```
Frontend (Next.js :3000)
        │
        ▼
Backend (Spring Boot :8080)  ──►  FastAPI ML Service (:8000)
        │
        ▼
   Firebase (Firestore, Auth, Storage)
```

- **frontend/** — Next.js 15 UI (TypeScript)
- **backend/** — Spring Boot 3 REST API (Java 21), talks to Firebase and the ML service
- **fastapi/** — Python ML service for price prediction and property recommendations

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| Java | 21 | https://adoptium.net |
| Maven | 3.9+ | https://maven.apache.org (or use the included `mvnw`) |
| Python | 3.10–3.12 | https://python.org |

---

## 1. FastAPI — ML Service (port 8000)

```bash
cd fastapi

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app:app --reload --port 8000
```

Verify it's running: http://localhost:8000/docs (Swagger UI)

---

## 2. Backend — Spring Boot (port 8080)

### Firebase Admin SDK setup

The backend needs a Firebase Admin SDK service account key to connect to Firestore.

1. Go to [Firebase Console](https://console.firebase.google.com) → Project Settings → Service Accounts
2. Click **Generate new private key** and download the JSON file
3. Place it at:
   ```
   backend/src/main/resources/firebase/homehunters-92c76-firebase-adminsdk-h2dej-9eb5f4f8f2.json
   ```

### Run

```bash
cd backend

# Using the Maven wrapper (no separate Maven install needed)
# Windows
mvnw.cmd spring-boot:run

# macOS/Linux
./mvnw spring-boot:run
```

Or build and run the JAR:

```bash
mvnw.cmd package -DskipTests
java -jar target/home-hunters-0.0.1-SNAPSHOT.jar
```

Verify it's running: http://localhost:8080/api/firestore/properties/sorted

---

## 3. Frontend — Next.js (port 3000)

### Environment variables

Create a `.env.local` file inside the `frontend/` folder:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### Run

```bash
cd frontend

npm install
npm run dev
```

Open: http://localhost:3000

---

## Running everything together

Open 3 terminals and run each service in order:

| Terminal | Command |
|----------|---------|
| 1 | `cd fastapi && uvicorn app:app --reload --port 8000` |
| 2 | `cd backend && mvnw.cmd spring-boot:run` |
| 3 | `cd frontend && npm run dev` |

Wait for each service to finish starting before opening the app.

---

## Testing

### FastAPI

Interactive API docs (Swagger UI): http://localhost:8000/docs

Test the price prediction endpoint directly:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "rooms": 3,
    "bathrooms": 1,
    "surfaceArea": 75,
    "propertyType": "apartment",
    "transactionType": "selling",
    "furnished": "yes",
    "amenities": ["parking", "elevator"]
  }'
```

### Backend

Run the Spring Boot unit tests:

```bash
cd backend
mvnw.cmd test
```

Test the REST API manually:

```bash
# Get all properties
curl http://localhost:8080/api/firestore/properties/sorted

# Health check (returns 200 if running)
curl -o /dev/null -s -w "%{http_code}" http://localhost:8080/api/firestore/properties/sorted
```

### Frontend

```bash
cd frontend
npm run lint      # ESLint check
npm run build     # Production build (catches TypeScript errors)
```

---

## Common issues

**Backend fails to start — Firebase error**
The Firebase Admin SDK JSON key is missing. Follow the [Firebase setup](#firebase-admin-sdk-setup) steps above.

**Frontend shows network errors**
Make sure `NEXT_PUBLIC_BACKEND_URL=http://localhost:8080` is set in `frontend/.env.local` and the backend is running.

**FastAPI `ModuleNotFoundError`**
Make sure your virtual environment is activated before running `pip install` and `uvicorn`.

**Port already in use**
Kill the process on the conflicting port:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8080 | xargs kill
```
