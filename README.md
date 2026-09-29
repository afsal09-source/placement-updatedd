# 🎓 Smart Placement Analytics & Feedback Management System
### M.M.E.S. Women's Arts and Science College

> A full-stack campus placement portal — deployed live on **Render** (hosting) + **Aiven** (cloud MySQL database).

---

## 🌐 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend** | https://placement-updatedd-1.onrender.com |
| **Backend API** | https://placement-updatedd.onrender.com/api |
| **Database** | Aiven Cloud MySQL (managed) |

### 🧪 Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mmes.ac.in | admin |
| Student | student@mmes.ac.in | student123 |

---

## 🧱 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Charts** | Recharts |
| **Backend** | Spring Boot 3.2 (Java 17) |
| **Database** | MySQL 8 (Aiven Cloud) |
| **Auth** | JWT (JSON Web Token) |
| **Email** | Gmail SMTP (OTP + Notifications) |
| **Build** | Maven Wrapper (mvnw) |
| **Hosting** | Render (Frontend Static Site + Backend Web Service) |

---

## ☁️ Deployment Architecture

```
USER (Browser)
     │
     ▼ HTTPS
┌─────────────────────────────┐
│  Render — Frontend           │
│  React + Vite (Static Site)  │
│  placement-updatedd-1        │
│  .onrender.com               │
└──────────┬──────────────────┘
           │ REST API calls
           ▼ HTTPS
┌─────────────────────────────┐
│  Render — Backend            │
│  Spring Boot JAR             │
│  placement-updatedd          │
│  .onrender.com/api           │
└──────────┬──────────────────┘
           │ JDBC + SSL
           ▼
┌─────────────────────────────┐
│  Aiven — Cloud MySQL         │
│  Managed MySQL 8             │
│  Auto backups + SSL          │
└─────────────────────────────┘
```

---

## 🔑 Key Features

| Feature | Description |
|---------|-------------|
| 🔐 OTP Email Verification | 3-step registration with 6-digit OTP |
| 📊 Analytics Dashboard | Department-wise placement charts |
| 🤖 Placement Prediction | AI scoring: CGPA + Skills formula |
| 📄 Resume Upload & View | PDF upload, inline viewer, download |
| 🏢 Drive Management | Create / edit / delete placement drives |
| 👥 Role-Based Access | Admin / Student / Recruiter / Coordinator |
| 📧 HTML Email Notifications | Branded OTP, selection, drive alert emails |
| 📱 Responsive UI | Mobile-first Tailwind design |

---

## 🗂️ Project Structure

```
placement-updated/
├── backend/                          ← Spring Boot Application
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd               ← Maven Wrapper
│   └── src/main/
│       ├── java/com/cahcet/placement/
│       │   ├── controller/           (9 controllers)
│       │   ├── service/              (10 services)
│       │   ├── repository/           (9 repositories)
│       │   ├── entity/               (9 entities)
│       │   ├── dto/                  (6 DTO groups)
│       │   ├── config/               (Security, App config)
│       │   ├── security/             (JWT filter, UserDetails)
│       │   └── exception/            (Global handler)
│       └── resources/
│           └── application.properties
│
└── frontend/                         ← React + Vite Application
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── pages/
        │   ├── auth/        (Login, Register — 3-step OTP)
        │   ├── admin/       (Dashboard, Students, Drives, Feedback)
        │   ├── student/     (Dashboard, Profile, Drives, Applications, Prediction)
        │   ├── recruiter/   (Dashboard, Drives, Applicants)
        │   ├── coordinator/ (Students, Companies)
        │   └── shared/      (Analytics, Feedback, Notifications)
        ├── components/common/
        └── services/api.js
```

---

## 🚀 Deploying on Render + Aiven (Step-by-Step)

### Step 1 — Aiven (Cloud Database)
1. Sign up free at https://console.aiven.io
2. Create a new **MySQL** service → Free / Hobbyist plan
3. Copy the **Service URI** (JDBC connection string)
4. Tables are auto-created by Spring Boot on first run

### Step 2 — Render Backend (Spring Boot)
1. Go to https://render.com → New → **Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** → `backend`
4. **Build Command:** `./mvnw clean package -DskipTests`
5. **Start Command:** `java -jar target/placement-system-1.0.0.jar`
6. Add environment variables:

```
SPRING_DATASOURCE_URL      = <Aiven JDBC URL>
SPRING_DATASOURCE_USERNAME = avnadmin
SPRING_DATASOURCE_PASSWORD = <Aiven password>
APP_JWT_SECRET             = <your-secret>
SPRING_MAIL_USERNAME       = your-gmail@gmail.com
SPRING_MAIL_PASSWORD       = <gmail-app-password>
APP_CORS_ALLOWED_ORIGINS   = https://placement-updatedd-1.onrender.com
APP_FRONTEND_URL           = https://placement-updatedd-1.onrender.com
```

### Step 3 — Render Frontend (React)
1. Render → New → **Static Site**
2. Connect same GitHub repo
3. Set **Root Directory** → `frontend`
4. **Build Command:** `npm install && npm run build`
5. **Publish Directory:** `dist`
6. Add environment variable:
```
VITE_API_BASE_URL = https://placement-updatedd.onrender.com/api
```

### Step 4 — Done!
- Push any code change to GitHub → Render auto-redeploys both services

---

## 💡 Why Render + Aiven?

| | Render | Aiven |
|-|--------|-------|
| Free Tier | Yes (750 hrs/month) | Yes (1 free service) |
| No Credit Card | Yes | Yes |
| Auto Deploy (Git push) | Yes | — |
| SSL / HTTPS | Auto | Enforced |
| Managed Backups | — | Daily |

---

## ⚙️ Local Development Setup

### Prerequisites
| Tool | Version |
|------|---------|
| Java JDK | 17+ |
| MySQL | 8.0+ |
| Node.js | 18+ |

### Backend
```bash
cd backend
# Windows
mvnw.cmd spring-boot:run
# Linux / macOS
chmod +x mvnw && ./mvnw spring-boot:run
```
Runs at: http://localhost:8081/api

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at: http://localhost:5173

---

## 🔐 API Endpoints Summary

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/send-otp | Public |
| POST | /api/auth/verify-otp | Public |
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/drives | Authenticated |
| POST | /api/drives | Admin/Recruiter |
| POST | /api/applications/apply | Student |
| GET | /api/students/predict | Student |
| GET | /api/analytics/dashboard | Admin/Coordinator |
| GET | /api/coordinator/students | Coordinator/Admin |
| GET | /api/coordinator/companies | Coordinator/Admin |
| GET | /api/files/resume/{id} | Authenticated |

---

## 🧠 Placement Prediction Formula

```
S = (CGPA/2 x 0.3) + (Technical x 0.3) + (Communication x 0.2) + (ProblemSolving x 0.2)
Probability (%) = (S / 5.0) x 100

HIGH   → >= 70%
MEDIUM → 45-69%
LOW    → < 45%
```

---

*M.M.E.S. Women's Arts and Science College — Smart Placement Analytics & Feedback Management System*
