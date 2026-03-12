-- EMPLOYEES
CREATE TABLE employees (
    emp_id          INTEGER PRIMARY KEY,
    emp_name        VARCHAR(100) NOT NULL,
    designation     VARCHAR(100) NOT NULL,
    years_of_exp    INTEGER NOT NULL DEFAULT 0,
    graduation_deg  VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- FUNCTIONAL AREAS
CREATE TABLE functional_areas (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(100) UNIQUE NOT NULL
);

-- SEED 5 FUNCTIONAL AREAS
INSERT INTO functional_areas (name) VALUES
    ('Development'),
    ('Data Analytics'),
    ('Design'),
    ('Consultancy'),
    ('Documentation');

-- EMPLOYEE AREA RATINGS
CREATE TABLE employee_area_ratings (
    emp_id              INTEGER REFERENCES employees(emp_id) ON DELETE CASCADE,
    functional_area_id  INTEGER REFERENCES functional_areas(id) ON DELETE CASCADE,
    rating              NUMERIC(4,1) NOT NULL CHECK (rating >= 0 AND rating <= 10),
    PRIMARY KEY (emp_id, functional_area_id)
);

-- ADMINS
CREATE TABLE admins (
    emp_id      INTEGER PRIMARY KEY REFERENCES employees(emp_id) ON DELETE CASCADE,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);