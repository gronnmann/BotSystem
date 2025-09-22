DROP POLICY IF EXISTS "Users can view their botsystems" ON botsystems;
DROP POLICY IF EXISTS "Owners can view their botsystems" ON botsystems;

-- Create a combined policy that works for both cases
CREATE POLICY "Users can view botsystems they own or are members of"
  ON botsystems FOR SELECT
  USING (
    owner_id = auth.uid() 
    OR is_botsystem_member(id, auth.uid())
  );

  DROP TRIGGER IF EXISTS add_owner_membership ON botsystems;

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