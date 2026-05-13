-- Enable RLS on all tables
ALTER TABLE hottakes_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hottakes_takes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hottakes_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hottakes_reports ENABLE ROW LEVEL SECURITY;

-- hottakes_categories: public read-only (admin manages via service_role)
CREATE POLICY "public_read_categories"
  ON hottakes_categories FOR SELECT TO anon USING (true);

-- hottakes_takes: public can read non-hidden, insert, update vote counts + auto-hide
CREATE POLICY "public_read_takes"
  ON hottakes_takes FOR SELECT TO anon USING (is_hidden = false);

CREATE POLICY "public_insert_takes"
  ON hottakes_takes FOR INSERT TO anon WITH CHECK (true);

-- anon needs UPDATE for vote count increments and auto-hide from reports
-- admin moderation (hide/unhide) uses service_role which bypasses RLS
CREATE POLICY "public_update_takes"
  ON hottakes_takes FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- hottakes_votes: public can read + insert (unique constraint prevents duplicate votes)
CREATE POLICY "public_read_votes"
  ON hottakes_votes FOR SELECT TO anon USING (true);

CREATE POLICY "public_insert_votes"
  ON hottakes_votes FOR INSERT TO anon WITH CHECK (true);

-- hottakes_reports: public can insert + read (count check for auto-hide logic in createReport)
CREATE POLICY "public_insert_reports"
  ON hottakes_reports FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "public_read_reports"
  ON hottakes_reports FOR SELECT TO anon USING (true);
