# Smart Placement Analytics & Feedback Management System
### C. Abdul Hakeem College of Engineering and Technology (CAHCET)

---

## 🗂️ Project Structure

```
placement-updated/
├── backend/                          ← Spring Boot Application
│   ├── pom.xml                       ← Maven build file (FIXED)
│   ├── mvnw                          ← Maven Wrapper (Linux/macOS)
│   ├── mvnw.cmd                      ← Maven Wrapper (Windows)
│   ├── .mvn/
│   │   └── wrapper/
│   │       └── maven-wrapper.properties
│   └── src/main/
│       ├── java/com/cahcet/placement/
│       │   ├── controller/           (9 controllers including CoordinatorController)
│       │   ├── service/              (10 services including OtpService, EmailService)
│       │   ├── repository/           (9 repositories including OtpVerificationRepository)
│       │   ├── entity/               (9 entities including OtpVerification)
│       │   ├── dto/                  (6 DTO groups)
│       │   ├── config/               (SecurityConfig, AppConfig)
│       │   ├── security/             (JWT filter, provider, UserDetails)
│       │   └── exception/            (Global exception handler)
│       └── resources/
│           └── application.properties
│
└── frontend/                         ← React + Vite Application
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── pages/
        │   ├── auth/     (Login, Register — 3-step OTP flow)
        │   ├── admin/    (Dashboard, Students, Drives, Feedback)
        │   ├── student/  (Dashboard, Profile, Drives, Applications, Prediction)
        │   ├── recruiter/(Dashboard, Drives, Applicants)
        │   ├── coordinator/ (CoordinatorStudents, CoordinatorCompanies) ← NEW
        │   └── shared/   (Analytics, Feedback, Notifications)
        ├── components/common/
        │   ├── ResumeViewer.jsx
        │   └── EmailNotificationBanner.jsx
        └── services/
            └── api.js    (authAPI + coordinatorAPI)
```

---

## ⚙️ Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Java JDK | 17+ | https://adoptium.net/ |
| MySQL | 8.0+ | https://dev.mysql.com/downloads/mysql/ |
| Node.js | 18+ | https://nodejs.org/ |
| Maven | 3.9+ | Not required — mvnw handles this automatically |

---

## 🚀 Step-by-Step Setup

### Step 1 — Create the MySQL Database

```sql
-- Open MySQL Workbench or terminal and run:
CREATE DATABASE cahcet_placement;
```

### Step 2 — Configure the Backend

Open `backend/src/main/resources/application.properties` and update:

```properties
# Your MySQL password
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Your Gmail for sending OTP and notification emails
spring.mail.username=your-gmail@gmail.com
spring.mail.password=your-16-digit-app-password
app.email.from=CAHCET Placement Cell <your-gmail@gmail.com>
```

**To get a Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords → Generate one for "Mail"
4. Use the 16-character code (without spaces)

### Step 3 — Run the Backend

**On Windows:**
```cmd
cd backend
mvnw.cmd spring-boot:run
```

**On Linux / macOS:**
```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```

**Or if you have Maven installed globally:**
```bash
cd backend
mvn spring-boot:run
```

The backend starts at: **http://localhost:8080/api**

> On first run, Hibernate auto-creates all MySQL tables. No SQL scripts needed.

### Step 4 — Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 📦 Build for Production

```bash
# Backend — creates executable JAR
cd backend
./mvnw clean package -DskipTests

# Run the JAR directly
java -jar target/placement-system-1.0.0.jar

# Frontend — creates dist/ folder
cd frontend
npm run build
```

---

## 🔐 API Endpoints Summary

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | /api/auth/send-otp | Public | Send OTP to email |
| POST | /api/auth/verify-otp | Public | Verify the OTP |
| POST | /api/auth/register | Public | Register (requires verified OTP) |
| POST | /api/auth/login | Public | Login and get JWT |
| GET | /api/drives | Authenticated | List all drives |
| POST | /api/drives | Admin/Recruiter | Create a drive |
| POST | /api/applications/apply | Student | Apply to a drive |
| GET | /api/students/predict | Student | Placement prediction |
| GET | /api/analytics/dashboard | Admin/Coordinator | Dashboard stats |
| GET | /api/coordinator/students | Coordinator/Admin | All students details |
| GET | /api/coordinator/companies | Coordinator/Admin | All companies + drives |
| GET | /api/files/resume/{id} | Authenticated | View resume (inline) |
| GET | /api/files/resume/{id}?download=true | Authenticated | Download resume |

---

## 🆕 New Features (Latest Update)

### 1️⃣ OTP Email Verification
- Registration now requires a 3-step process:
  1. Enter email → OTP sent to inbox
  2. Enter 6-digit OTP (expires in 10 min, max 5 attempts)
  3. Complete registration form
- New DB table: `otp_verifications`
- Branded HTML email with digit boxes

### 2️⃣ Coordinator Dashboard
- **Student Details:** Full profile — CGPA, skills, resume, placement status, LinkedIn/GitHub
- **Company Details:** Recruiter info, average rating, all drives with skills required, package, time period
- New controller: `CoordinatorController`
- New pages: `CoordinatorStudents.jsx`, `CoordinatorCompanies.jsx`

---

## 🧠 Placement Prediction Formula

```
S = (CGPA/2 × 0.3) + (Technical × 0.3) + (Communication × 0.2) + (ProblemSolving × 0.2)
Probability (%) = (S / 5.0) × 100

HIGH   → ≥ 70%
MEDIUM → 45–69%
LOW    → < 45%
```

---

*CAHCET — C. Abdul Hakeem College of Engineering and Technology, Melvisharam*
