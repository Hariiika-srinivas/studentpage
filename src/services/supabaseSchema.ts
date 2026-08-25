export interface DbStudent {
  id?: string;
  usn: string;
  full_name: string;
  route_id: string;
  pass_status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  department?: string;
  phone?: string;
  created_at?: string;
}

export interface DbDriver {
  id?: string;
  phone_number: string;
  full_name: string;
  bus_number: string;
  assigned_route_id: string;
  created_at?: string;
}

export interface DbAdmin {
  id?: string;
  username: string;
  password_hash?: string;
  email: string;
}

export interface DbSystemNotification {
  id?: string;
  user_type: 'STUDENT' | 'DRIVER' | 'ADMIN';
  user_identifier: string;
  action: string;
  timestamp: string;
  read: boolean;
}

export interface DbStudentFeedback {
  id?: string;
  student_usn: string;
  student_name?: string;
  bus_id?: string;
  category: string;
  message: string;
  rating?: number;
  timestamp: string;
}

export interface StandardPassQRPayload {
  usn: string;
  name: string;
  validUntil: string;
  signature: string;
  routeCode?: string;
  passStatus?: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  department?: string;
}

export const INITIAL_STUDENTS_SEED: DbStudent[] = [
  {
    usn: '3BR21CS007',
    full_name: 'Rahul Sharma',
    route_id: 'route-a',
    pass_status: 'ACTIVE',
    department: 'Computer Science & Engineering',
    phone: '9845012345',
  },
  {
    usn: '3BR21EC019',
    full_name: 'Priya Kulkarni',
    route_id: 'route-b',
    pass_status: 'ACTIVE',
    department: 'Electronics & Communication',
    phone: '9448054321',
  },
  {
    usn: '3BR22ME045',
    full_name: 'Anand Patil',
    route_id: 'route-a',
    pass_status: 'ACTIVE',
    department: 'Mechanical Engineering',
    phone: '9880055443',
  },
  {
    usn: '3BR20CS099',
    full_name: 'Kiran Kumar',
    route_id: 'route-c',
    pass_status: 'EXPIRED',
    department: 'Computer Science & Engineering',
    phone: '9740012345',
  },
  {
    usn: 'BLR-2024-CS042',
    full_name: 'Rahul Sharma',
    route_id: 'route-a',
    pass_status: 'ACTIVE',
    department: 'Computer Science & Engineering',
    phone: '9845012345',
  },
];

export const INITIAL_DRIVERS_SEED: DbDriver[] = [
  {
    phone_number: '9844098765',
    full_name: 'Ramesh Kumar',
    bus_number: 'BUS-03',
    assigned_route_id: 'route-a',
  },
  {
    phone_number: '9449011223',
    full_name: 'Mallikarjun G.',
    bus_number: 'BUS-05',
    assigned_route_id: 'route-b',
  },
  {
    phone_number: '9845011224',
    full_name: 'Suresh Gowda',
    bus_number: 'BUS-01',
    assigned_route_id: 'route-c',
  },
];

export const SUPABASE_SQL_DDL = `-- ==============================================================================
-- CAMPUSGO BALLARI: POSTGRESQL SCHEMA FOR FREE-TIER SUPABASE SETUP
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usn TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  route_id TEXT NOT NULL DEFAULT 'route-a',
  pass_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (pass_status IN ('ACTIVE', 'EXPIRED', 'SUSPENDED')),
  department TEXT DEFAULT 'Computer Science & Engineering',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Drivers Table
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  bus_number TEXT NOT NULL DEFAULT 'BUS-03',
  assigned_route_id TEXT NOT NULL DEFAULT 'route-a',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  email TEXT NOT NULL
);

-- 5. Real-Time System Notifications Table
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL,
  user_identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false
);

-- 6. Student Feedback & Grievances Table
CREATE TABLE IF NOT EXISTS public.student_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_usn TEXT NOT NULL,
  student_name TEXT,
  bus_id TEXT,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INT DEFAULT 5,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_feedback ENABLE ROW LEVEL SECURITY;

-- 8. Permissive Policies for Institution / Hackathon Public App Client
DO $$ BEGIN
  CREATE POLICY "Public Read/Write on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read/Write on drivers" ON public.drivers FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read/Write on admins" ON public.admins FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read/Write on system_notifications" ON public.system_notifications FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read/Write on student_feedback" ON public.student_feedback FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 9. Enable Realtime Publications for system_notifications & student_feedback
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_feedback;

-- 10. Seed Initial Verified Institutional Records
INSERT INTO public.students (usn, full_name, route_id, pass_status, department, phone)
VALUES
  ('3BR21CS007', 'Rahul Sharma', 'route-a', 'ACTIVE', 'Computer Science & Engineering', '9845012345'),
  ('3BR21EC019', 'Priya Kulkarni', 'route-b', 'ACTIVE', 'Electronics & Communication', '9448054321'),
  ('3BR22ME045', 'Anand Patil', 'route-a', 'ACTIVE', 'Mechanical Engineering', '9880055443'),
  ('3BR20CS099', 'Kiran Kumar', 'route-c', 'EXPIRED', 'Computer Science & Engineering', '9740012345'),
  ('BLR-2024-CS042', 'Rahul Sharma', 'route-a', 'ACTIVE', 'Computer Science & Engineering', '9845012345')
ON CONFLICT (usn) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  pass_status = EXCLUDED.pass_status;

INSERT INTO public.drivers (phone_number, full_name, bus_number, assigned_route_id)
VALUES
  ('9844098765', 'Ramesh Kumar', 'BUS-03', 'route-a'),
  ('9449011223', 'Mallikarjun G.', 'BUS-05', 'route-b'),
  ('9845011224', 'Suresh Gowda', 'BUS-01', 'route-c')
ON CONFLICT (phone_number) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  bus_number = EXCLUDED.bus_number;

INSERT INTO public.admins (username, password_hash, email)
VALUES
  ('admin', 'admin123', 'transit.ops@campusgo.ballari.edu')
ON CONFLICT (username) DO NOTHING;
`;
