
CREATE POLICY "Owners can view their botsystems"
  ON botsystems FOR SELECT
  USING (is_botsystem_owner(id, auth.uid()));

CREATE OR REPLACE FUNCTION ensure_owner_membership()
RETURNS trigger AS $$
BEGIN
  INSERT INTO botsystem_members (botsystem_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER add_owner_membership
AFTER INSERT ON botsystems
FOR EACH ROW
EXECUTE FUNCTION ensure_owner_membership();