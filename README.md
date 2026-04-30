# 🎓 Mentor Wave CUET

A full-stack tutor-finding web application built for the CUET community, connecting students (tutors) with guardians seeking home tutoring services.

> **Internet Programming Project — Level-3, Term-I**
> Chittagong University of Engineering & Technology (CUET)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [User Roles](#-user-roles)
- [Screenshots](#-screenshots)

---

## 🌐 Overview

**Mentor Wave CUET** is a role-based tuition management platform tailored for CUET students and guardians. Tutors (CUET students) can create profiles and browse available tuition posts, while guardians can post tuition requirements and review applications. An admin panel provides full oversight of users, posts, and verifications.

---

## ✨ Features

### 👤 Authentication & Accounts
- JWT-based registration and login
- Email OTP verification for new accounts
- Password reset via email
- Role-based access: **Tutor**, **Guardian**, **Admin**

### 🧑‍🏫 Tutor
- Create and manage a public tutor profile (subjects, location, bio)
- Browse available tuition posts with filters
- Apply to tuition posts with a custom message
- Track application status (pending / accepted / rejected)
- Real-time messaging with guardians
- View profile visit count

### 👨‍👩‍👧 Guardian
- Post tuition requirements (class, subjects, location, salary, days/week)
- Review and manage incoming applications
- Accept or reject tutor applications
- Communicate with tutors via built-in messaging
- Manage and close own posts

### 🛡️ Admin
- Dashboard with platform-wide statistics
- Approve or decline tuition posts (with decline reasons)
- Verify or reject user accounts
- View all tutors, guardians, posts, and applications
- Delete users or posts

---

## 🛠 Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | HTML5, CSS3, Vanilla JavaScript                 |
| Backend   | Node.js, Express.js v5                          |
| Database  | MySQL with Sequelize ORM                        |
| Auth      | JSON Web Tokens (JWT), bcryptjs                 |
| Email     | Nodemailer (Gmail SMTP)                         |
| Dev Tools | Nodemon, VS Code Live Server                    |

---

## 📁 Project Structure

```
mentor-wave-cuet-integrated/
│
├── backend/
│   ├── config/
│   │   └── db.js                  # Sequelize MySQL connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, OTP, password reset
│   │   ├── applicationController.js
│   │   ├── messageController.js
│   │   ├── tuitionController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification
│   │   └── roleMiddleware.js      # Role-based access control
│   ├── models/
│   │   ├── User.js
│   │   ├── TutorProfile.js
│   │   ├── TuitionPost.js
│   │   ├── Application.js
│   │   ├── Message.js
│   │   ├── Review.js
│   │   └── index.js               # Associations & DB sync
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── tuitionRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── sendEmail.js
│   ├── app.js                     # Express app setup
│   ├── server.js                  # Server entry point
│   ├── seed.js                    # Seeds initial admin accounts
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── admin/
    │   └── dashboard.html
    ├── guardian/
    │   ├── dashboard.html
    │   ├── post_tuition.html
    │   ├── my_posts.html
    │   └── my_posts.js
    ├── tutor/
    │   ├── dashboard.html
    │   ├── browse.html
    │   └── profile.html
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── api.js                 # All API call functions
    │   ├── main.js                # Page logic & UI rendering
    │   └── config.js              # API base URL config
    ├── images/
    │   └── hero-education.svg
    ├── index.html                 # Landing page
    ├── login.html
    ├── register.html
    ├── verification.html
    ├── forgot-password.html
    └── messages.html
```

---

## 🗃 Database Schema

The application uses five main Sequelize models with the following relationships:

```
User ──────────── TutorProfile    (1 : 1)
User ──────────── TuitionPost     (1 : Many, as Guardian)
User ──────────── Application     (1 : Many, as Tutor)
TuitionPost ───── Application     (1 : Many)
User ──────────── Message         (1 : Many, as Sender & Receiver)
```

### Key Model Fields

**User** — `name`, `email`, `password`, `role` (tutor/guardian/admin), `phone`, `department`, `studentId`, `gender`, `isVerified`, `otpCode`, `otpExpiry`, `profileViews`

**TuitionPost** — `title`, `class`, `subjects`, `location`, `salary`, `days`, `description`, `status` (open/closed), `approvalStatus` (pending/approved/declined), `declineReason`

**Application** — `message`, `status` (pending/accepted/rejected)

**TutorProfile** — `subjects`, `location`, `bio`

**Message** — `senderId`, `receiverId`, content

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint             | Description                    |
|--------|----------------------|--------------------------------|
| POST   | `/register`          | Register a new user            |
| POST   | `/login`             | Login and receive JWT          |
| POST   | `/verify-otp`        | Verify email OTP               |
| POST   | `/forgot-password`   | Send password reset email      |
| POST   | `/reset-password`    | Reset password with token      |

### Users — `/api/users`
| Method | Endpoint         | Description                     |
|--------|------------------|---------------------------------|
| GET    | `/profile`       | Get current user's profile      |
| PUT    | `/profile`       | Update profile / tutor profile  |

### Tuition — `/api/tuition`
| Method | Endpoint    | Description                          |
|--------|-------------|--------------------------------------|
| GET    | `/`         | Get all approved tuition posts       |
| POST   | `/`         | Guardian creates a new post          |
| GET    | `/my`       | Guardian's own posts                 |
| PATCH  | `/:id`      | Update or close a post               |
| DELETE | `/:id`      | Delete a post                        |

### Applications — `/api/applications`
| Method | Endpoint          | Description                      |
|--------|-------------------|----------------------------------|
| POST   | `/:postId`        | Tutor applies to a post          |
| GET    | `/my`             | Tutor's own applications         |
| GET    | `/post/:postId`   | Guardian views post applicants   |
| PATCH  | `/:id`            | Accept or reject an application  |

### Messages — `/api/messages`
| Method | Endpoint          | Description                   |
|--------|-------------------|-------------------------------|
| POST   | `/`               | Send a message                |
| GET    | `/conversations`  | List all conversations        |
| GET    | `/:userId`        | Get messages with a user      |

### Admin — `/api/admin`
| Method | Endpoint              | Description                      |
|--------|-----------------------|----------------------------------|
| GET    | `/stats`              | Platform statistics              |
| GET    | `/users`              | All users                        |
| GET    | `/tutors`             | All tutors                       |
| GET    | `/guardians`          | All guardians                    |
| GET    | `/pending`            | Users pending verification       |
| PATCH  | `/verify/:id`         | Approve or reject a user         |
| DELETE | `/users/:id`          | Delete a user                    |
| GET    | `/posts`              | All tuition posts                |
| GET    | `/posts/pending`      | Posts pending approval           |
| PATCH  | `/posts/:id/approve`  | Approve a post                   |
| PATCH  | `/posts/:id/decline`  | Decline a post with reason       |
| DELETE | `/posts/:id`          | Delete a post                    |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MySQL** running locally
- **VS Code** with the Live Server extension (for the frontend)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/mentor-wave-cuet.git
cd mentor-wave-cuet-integrated
```

### 2. Create the MySQL Database

Log into MySQL and run:

```sql
CREATE DATABASE mentor_wave_cuet;
```

### 3. Configure Environment Variables

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your credentials (see [Environment Variables](#-environment-variables) below).

### 4. Install Backend Dependencies

```bash
cd backend
npm install
```

### 5. Start the Backend Server

```bash
# Production
node server.js

# Development (auto-restart on changes)
npm run dev
```

The server starts at `http://localhost:5000`. Sequelize will automatically sync the database schema on startup.

### 6. Seed Admin Accounts *(first time only)*

```bash
node seed.js
```

This creates the default admin users in the database.

### 7. Launch the Frontend

Open `frontend/index.html` using the **Live Server** extension in VS Code, or simply open the file in your browser.

---

## 🔐 Environment Variables

Create `backend/.env` from the provided example:

```env
PORT=5000

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mentor_wave_cuet

# JWT
JWT_SECRET=your_jwt_secret_key

# Gmail SMTP (use a Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

> **Note:** For `EMAIL_PASS`, generate a [Gmail App Password](https://myaccount.google.com/apppasswords) — do not use your regular Gmail password.

---

## 👥 User Roles

| Role         | Capabilities                                                                 |
|--------------|------------------------------------------------------------------------------|
| **Tutor**    | Browse posts, apply, manage profile, message guardians                       |
| **Guardian** | Post tuitions, review applications, accept/reject, message tutors            |
| **Admin**    | Verify accounts, approve/decline posts, view all platform data, delete users |

---

## 👥 Contributors

This project was built as a team effort for the **Internet Programming (Sessional) — CSE-326** course at CUET, Session 2022–2023, under the supervision of **Lecturer Abir Hassan**, Department of CSE.

| Name | Student ID | Contributions |
|------|------------|---------------|
| **Laiba Tabassum** | 2204077 | Backend development, database design, full-stack integration |
| **Tahrima Jahan** | 2204078 | UI/UX design, frontend development |
| **Srabon Islam** | 2204096 | UI/UX design, frontend development |

### Laiba Tabassum — Backend & Integration
- Designed and implemented the full RESTful API with Express.js
- Built the authentication system: JWT, email OTP verification, password reset via Nodemailer
- Implemented role-based access control (RBAC) for Tutor, Guardian, and Admin roles
- Designed the MySQL database schema and all Sequelize model associations
- Built all backend modules: auth, users, tuition posts, applications, messaging, and admin
- Integrated the frontend with the backend API (`api.js`, `config.js`)
- Configured CORS, environment variables, and the admin seed script

### Tahrima Jahan & Srabon Islam — Frontend & UI/UX
- Designed the overall UI/UX — visual language, color scheme, typography, and layout
- Built all HTML pages: landing page, login, registration, email verification, and all dashboards
- Implemented responsive layouts using CSS Flexbox and Grid with media queries
- Developed client-side JavaScript for dynamic content rendering, form validation, and API calls
- Created role-specific dashboard interfaces for Tutor, Guardian, and Admin
- Produced UML diagrams, Data Flow Diagrams (logical & physical), and system design documentation

---

## 📄 License

This project was developed for academic purposes as part of the **Internet Programming** course at CUET. All rights reserved by the project authors.
