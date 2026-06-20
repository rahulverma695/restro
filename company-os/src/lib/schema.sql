-- PostgreSQL Database Schema for Company OS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Employees Registry
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee', -- 'employee', 'manager', 'admin'
    department VARCHAR(100) NOT NULL DEFAULT 'Engineering', -- 'Engineering', 'HR', 'Sales', 'Finance', 'Ops'
    avatar_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'offline', -- 'online', 'offline', 'on_leave'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Shift Logs (Clock-in / Clock-out)
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    clock_out TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- 3. Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- 'sick', 'casual', 'annual'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Helpdesk Tickets
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    assigned_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL, -- 'IT', 'HR', 'Finance', 'Facility'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high'
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Ticket Replies / Comments
CREATE TABLE IF NOT EXISTS ticket_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Wiki Documentation
CREATE TABLE IF NOT EXISTS wiki_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Announcements / Notice Board
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES employees(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index optimization
CREATE INDEX IF NOT EXISTS idx_shifts_employee ON shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_creator ON tickets(creator_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies ON ticket_replies(ticket_id);

-- Seeding Mock Data for Quick Setup
-- Insert standard employee, manager, and administrator
INSERT INTO employees (id, email, first_name, last_name, role, department, status) VALUES 
('e0000000-0000-0000-0000-000000000001', 'nikhil@omnihub.com', 'Nikhil', 'Bhaviyavar', 'manager', 'HR', 'online'),
('e0000000-0000-0000-0000-000000000002', 'john.doe@omnihub.com', 'John', 'Doe', 'employee', 'Engineering', 'offline'),
('e0000000-0000-0000-0000-000000000003', 'jane.smith@omnihub.com', 'Jane', 'Smith', 'manager', 'Finance', 'online')
ON CONFLICT (email) DO NOTHING;

-- Insert notice board announcements
INSERT INTO announcements (title, content, created_by) VALUES
('Company Offsite Scheduled!', 'We are planning our annual company offsite for next month. Details about locations and schedules will be shared shortly.', 'e0000000-0000-0000-0000-000000000001'),
('New Policy Update', 'Please review the updated handbook on leave allowances. Casual leaves now roll over up to 5 days into the next quarter.', 'e0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Insert initial wiki docs
INSERT INTO wiki_docs (title, content, created_by) VALUES
('Onboarding Guide', 'Welcome to the team! Find guides on setting up your local environment, setting up code access, and configuring your payroll credentials on your first day.', 'e0000000-0000-0000-0000-000000000001'),
('Engineering coding standards', 'We write standard React 19 and Next.js App Router applications. Always use server actions for database updates and handle database connections using the Neon singleton format.', 'e0000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Insert initial helpdesk tickets
INSERT INTO tickets (id, creator_id, assigned_id, category, title, description, priority, status) VALUES
('t0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'IT', 'Request for Dual Monitor Setup', 'Hi team, would benefit from a secondary screen to review code files side by side. Requesting a standard 27-inch 4K screen.', 'medium', 'open'),
('t0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'HR', 'Reimbursement Form Query', 'Could someone please share the link to download the travel expense reimbursement excel template? Thanks.', 'low', 'in_progress')
ON CONFLICT DO NOTHING;
