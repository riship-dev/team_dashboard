# Team Dashboard

A full-stack team management dashboard built with React, Node.js, Express, and PostgreSQL. Admins can log in, manage team members, view functional area ratings on a radar chart, and track team-wide project stats.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Bootstrap, Plain CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT (stateless) |

---

## Features

- Admin login with JWT authentication
- Protected dashboard — unauthenticated users are redirected to login
- Employee table with columns: ID, Name, Designation, Years of Experience, Projects Completed, Functional Areas, Graduation Degree
- Add, Edit, and Delete employees via modals
- Radar chart modal per employee showing functional area ratings (0–10)
- Hero section with live stats: Total Members, Avg. Years of Experience, Functional Areas, Team Projects Completed
- Team Projects Completed counter with increment/decrement clickers — persisted in the database
- Search by name, ID, designation, or functional area
- Sort by Employee ID, Name, Years of Experience, or Projects Completed

---

## Project Structure

```
team-dashboard/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js               # Login and token verify routes
│   │   ├── employees.js          # Employee CRUD routes
│   │   └── teamStats.js          # Team stats routes
│   ├── .env                      # Environment variables (not committed)
│   └── server.js                 # Express app entry point
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js          # Axios instance with JWT interceptor
        ├── components/
        │   ├── Navbar.jsx
        │   ├── EmployeeFormModal.jsx
        │   ├── DeleteConfirmModal.jsx
        │   └── RadarChartModal.jsx
        ├── context/
        │   └── AuthContext.jsx   # Global auth state
        ├── pages/
        │   ├── Login.jsx
        │   └── Dashboard.jsx
        ├── routes/
        │   └── ProtectedRoute.jsx
        └── App.js
```

---

## Database Schema

```sql
CREATE TABLE employees (
    emp_id              INTEGER PRIMARY KEY,
    emp_name            VARCHAR(100) NOT NULL,
    designation         VARCHAR(100) NOT NULL,
    years_of_exp        INTEGER NOT NULL DEFAULT 0,
    graduation_deg      VARCHAR(100) NOT NULL,
    projects_completed  INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE functional_areas (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE employee_area_ratings (
    emp_id              INTEGER REFERENCES employees(emp_id) ON DELETE CASCADE,
    functional_area_id  INTEGER REFERENCES functional_areas(id) ON DELETE CASCADE,
    rating              NUMERIC(4,1) NOT NULL CHECK (rating >= 0 AND rating <= 10),
    PRIMARY KEY (emp_id, functional_area_id)
);

CREATE TABLE admins (
    emp_id      INTEGER PRIMARY KEY REFERENCES employees(emp_id) ON DELETE CASCADE,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_stats (
    id                  INTEGER PRIMARY KEY DEFAULT 1,
    projects_completed  INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT single_row CHECK (id = 1)
);
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/your-username/team-dashboard.git
cd team-dashboard
```

### 2. Set up the database

Log into PostgreSQL and run:

```sql
CREATE DATABASE team_dashboard;
\c team_dashboard
```

Then paste the full schema from the section above.

Seed the 5 functional areas:

```sql
INSERT INTO functional_areas (name) VALUES
    ('Development'),
    ('Data Analytics'),
    ('Design'),
    ('Management'),
    ('Marketing');
```

Seed the team stats row:

```sql
INSERT INTO team_stats (id, projects_completed) VALUES (1, 0);
```

### 3. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=team_dashboard
JWT_SECRET=your_super_secret_key
```

### 4. Create the first admin

Since an admin must be an existing employee, first insert an employee directly in psql:

```sql
INSERT INTO employees (emp_id, emp_name, designation, years_of_exp, graduation_deg, projects_completed)
VALUES (1001, 'Admin User', 'Team Lead', 5, 'B.Sc Computer Science', 0);
```

Then hash a password and insert the admin using bcrypt. You can do this temporarily via a Node.js script or use the `/api/employees` and `/api/auth` routes once the server is running.

### 5. Start the backend

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### 6. Start the frontend

```bash
cd ../frontend
npm install
npm start
```

App runs on `http://localhost:3000`

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | ✗ | Login with emp_id and password, returns JWT |
| GET | `/api/auth/verify` | ✓ | Verify if token is still valid |

### Employees

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/employees` | ✓ | Get all employees with area ratings |
| GET | `/api/employees/:emp_id` | ✓ | Get a single employee |
| POST | `/api/employees` | ✓ | Create employee with area ratings |
| PUT | `/api/employees/:emp_id` | ✓ | Update employee and replace ratings |
| DELETE | `/api/employees/:emp_id` | ✓ | Delete employee and cascade ratings |

### Team Stats

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/team-stats` | ✗ | Get team projects completed count |
| PATCH | `/api/team-stats/projects-completed` | ✓ | Increment or decrement projects completed |

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the Express server runs on |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | PostgreSQL database name |
| `JWT_SECRET` | Secret key used to sign JWT tokens |

---

## Notes

- The `admins` table references `employees` — an admin must always be an existing employee
- Deleting an employee automatically deletes their admin account and area ratings via `ON DELETE CASCADE`
- JWT tokens expire after 8 hours — the frontend automatically redirects to login on expiry
- The radar chart requires at least 3 functional areas to render
- The `team_stats` table is designed to hold exactly one row using a check constraint