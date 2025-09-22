-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE botsystems ENABLE ROW LEVEL SECURITY;
ALTER TABLE botsystem_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is member of a botsystem
CREATE OR REPLACE FUNCTION is_botsystem_member(botsystem_uuid uuid, user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM botsystem_members 
    WHERE botsystem_id = botsystem_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is owner of a botsystem
CREATE OR REPLACE FUNCTION is_botsystem_owner(botsystem_uuid uuid, user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM botsystems 
    WHERE id = botsystem_uuid AND owner_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES policies
-- Users can read all profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- BOTSYSTEMS policies
-- Users can view botsystems they are members of
CREATE POLICY "Users can view their botsystems"
  ON botsystems FOR SELECT
  USING (is_botsystem_member(id, auth.uid()));

-- Users can create new botsystems
CREATE POLICY "Users can create botsystems"
  ON botsystems FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Only owners can update botsystems
CREATE POLICY "Owners can update their botsystems"
  ON botsystems FOR UPDATE
  USING (is_botsystem_owner(id, auth.uid()));

-- Only owners can delete botsystems
CREATE POLICY "Owners can delete their botsystems"
  ON botsystems FOR DELETE
  USING (is_botsystem_owner(id, auth.uid()));

-- BOTSYSTEM_MEMBERS policies
-- Users can view memberships for botsystems they belong to
CREATE POLICY "Users can view botsystem memberships"
  ON botsystem_members FOR SELECT
  USING (is_botsystem_member(botsystem_id, auth.uid()));

-- Owners can add members to their botsystems
CREATE POLICY "Owners can add members"
  ON botsystem_members FOR INSERT
  WITH CHECK (is_botsystem_owner(botsystem_id, auth.uid()));

-- Owners can update member roles
CREATE POLICY "Owners can update memberships"
  ON botsystem_members FOR UPDATE
  USING (is_botsystem_owner(botsystem_id, auth.uid()));

-- Users can leave botsystems (delete own membership)
CREATE POLICY "Users can leave botsystems"
  ON botsystem_members FOR DELETE
  USING (user_id = auth.uid());

-- Owners can remove members
CREATE POLICY "Owners can remove members"
  ON botsystem_members FOR DELETE
  USING (is_botsystem_owner(botsystem_id, auth.uid()));

-- RULES policies
-- Users can view rules for botsystems they belong to
CREATE POLICY "Users can view rules in their botsystems"
  ON rules FOR SELECT
  USING (is_botsystem_member(botsystem_id, auth.uid()));

-- Members can create rules
CREATE POLICY "Members can create rules"
  ON rules FOR INSERT
  WITH CHECK (is_botsystem_member(botsystem_id, auth.uid()));

-- Only owners can update rules
CREATE POLICY "Owners can update rules"
  ON rules FOR UPDATE
  USING (is_botsystem_owner(botsystem_id, auth.uid()));

-- Only owners can delete rules
CREATE POLICY "Owners can delete rules"
  ON rules FOR DELETE
  USING (is_botsystem_owner(botsystem_id, auth.uid()));

-- PENALTIES policies
-- Users can view penalties in botsystems they belong to
CREATE POLICY "Users can view penalties in their botsystems"
  ON penalties FOR SELECT
  USING (is_botsystem_member(botsystem_id, auth.uid()));

-- Members can create penalties in botsystems they belong to
CREATE POLICY "Members can create penalties"
  ON penalties FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND is_botsystem_member(botsystem_id, auth.uid())
    AND is_botsystem_member(botsystem_id, user_id)
  );

-- Users can update penalties they created (for corrections/additions)
CREATE POLICY "Creators can update their penalties"
  ON penalties FOR UPDATE
  USING (auth.uid() = created_by);

-- Owners and creators can delete penalties
CREATE POLICY "Owners and creators can delete penalties"
  ON penalties FOR DELETE
  USING (
    auth.uid() = created_by
    OR botsystem_id IN (
      SELECT id
      FROM botsystems
      WHERE owner_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_botsystem_members_user_id ON botsystem_members(user_id);
CREATE INDEX IF NOT EXISTS idx_botsystem_members_botsystem_id ON botsystem_members(botsystem_id);
CREATE INDEX IF NOT EXISTS idx_rules_botsystem_id ON rules(botsystem_id);
CREATE INDEX IF NOT EXISTS idx_penalties_botsystem_id ON penalties(botsystem_id);
CREATE INDEX IF NOT EXISTS idx_penalties_user_id ON penalties(user_id);
CREATE INDEX IF NOT EXISTS idx_penalties_created_by ON penalties(created_by);