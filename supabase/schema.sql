-- Run this ONCE in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/mymqeseqwfafjffrabys/sql

-- 1. Leads table — stores each lead as a JSON document
CREATE TABLE IF NOT EXISTS leads (
    id text PRIMARY KEY,
    data jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Deleted leads audit table — records who was removed and why
CREATE TABLE IF NOT EXISTS deleted_leads (
    id text PRIMARY KEY,
    lead_name text,
    lead_source text,
    lead_status text,
    reason text NOT NULL,
    deleted_at timestamptz DEFAULT now()
);

-- 3. Row Level Security — allow full access (no auth in this app)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow all on leads"
    ON leads FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow all on deleted_leads"
    ON deleted_leads FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. Auto-update updated_at on every row update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
