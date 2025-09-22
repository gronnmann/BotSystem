DROP TRIGGER IF EXISTS add_owner_membership ON botsystems;

CREATE OR REPLACE FUNCTION ensure_owner_membership()
RETURNS trigger AS $$
BEGIN
  -- Insert membership record before the botsystem is created
  INSERT INTO botsystem_members (botsystem_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER add_owner_membership
  BEFORE INSERT ON botsystems
  FOR EACH ROW
  EXECUTE FUNCTION ensure_owner_membership();