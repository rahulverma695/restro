-- PostgreSQL Database Schema for Cold Outreach Engine

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Sender Inboxes Table
CREATE TABLE IF NOT EXISTS sender_inboxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    provider VARCHAR(50) NOT NULL, -- 'gmail' or 'outlook'
    oauth_refresh_token TEXT NOT NULL,
    daily_limit INTEGER DEFAULT 30,
    sent_today_count INTEGER DEFAULT 0,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'auth_error'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Lead Lists Table
CREATE TABLE IF NOT EXISTS lead_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_list_id UUID REFERENCES lead_lists(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    website VARCHAR(255),
    status VARCHAR(50) DEFAULT 'uncontacted', -- 'uncontacted', 'in_progress', 'replied', 'unsubscribed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_lead_email_in_list UNIQUE (lead_list_id, email)
);

-- 4. Outbound Campaigns Table
CREATE TABLE IF NOT EXISTS outbound_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    lead_list_id UUID REFERENCES lead_lists(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sequence Steps Table
CREATE TABLE IF NOT EXISTS sequence_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES outbound_campaigns(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    delay_days INTEGER DEFAULT 0,
    subject_template VARCHAR(255) NOT NULL,
    body_template TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_step_in_campaign UNIQUE (campaign_id, step_number)
);

-- 6. Queue Jobs Table
CREATE TABLE IF NOT EXISTS queue_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    sender_inbox_id UUID REFERENCES sender_inboxes(id) ON DELETE CASCADE,
    step_id UUID REFERENCES sequence_steps(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    sender_inbox_id UUID REFERENCES sender_inboxes(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'sent', 'open', 'reply', 'bounce'
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    raw_payload TEXT
);

-- Indexing for fast queue lookup
CREATE INDEX IF NOT EXISTS idx_queue_jobs_scheduled ON queue_jobs(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_leads_list ON leads(lead_list_id);
CREATE INDEX IF NOT EXISTS idx_logs_lead ON activity_logs(lead_id);
