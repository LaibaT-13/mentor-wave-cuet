# Mentor Wave CUET

A CUET-based tutor-finding web application.

## Setup

### Prerequisites
- Node.js v18+ <br>
- MySQL running locally

### 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/mentor-wave-cuet.git

### 2. Create the database
In MySQL, run: <br>
CREATE DATABASE mentor_wave_cuet;

### 3. Configure environment
Copy backend/.env.example to backend/.env <br>
Fill in your MySQL password and Gmail App Password.

### 4. Install and start backend
cd backend <br>
npm install <br>
node server.js

### 5. Seed admin accounts (first time only)
node seed.js

### 6. Open frontend
Open frontend/index.html with Live Server in VS Code.
