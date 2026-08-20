CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'VAS Engineer'
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  assignee_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'Not Started'
    CHECK (status IN ('Not Started', 'In Progress', 'Blocked', 'Done')),
  due_date DATE,
  created_at DATE DEFAULT CURRENT_DATE
);


CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'Not Started'
);

CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Open'
);



INSERT INTO users (id, name, role) VALUES
  (gen_random_uuid(), 'Imane', 'Senior VAS Engineer'),
  (gen_random_uuid(), 'Ishak', 'Senior VAS Engineer'),
  (gen_random_uuid(), 'Amir', 'Senior VAS Engineer'),
  (gen_random_uuid(), 'Nesrine', 'VAS Business Manager'),
  (gen_random_uuid(), 'Fatah', 'Consultant VAS senior'),
  (gen_random_uuid(), 'Ahmed', 'Consultant VAS Junior'),
  (gen_random_uuid(), 'Islem', 'Expert VAS');

INSERT INTO projects (id, name) VALUES
  (gen_random_uuid(), 'USSD Consolidation'),
  (gen_random_uuid(), 'Offer on the Fly'),
  (gen_random_uuid(), 'Commission Centralization Engine'),
  (gen_random_uuid(), 'Flag V1.1'),
  (gen_random_uuid(), 'Arcane WP2'),
  (gen_random_uuid(), 'Multiverse WP4'),
  (gen_random_uuid(), 'Energy 1.6'),
  (gen_random_uuid(), 'ATC Loan Phase 2');
