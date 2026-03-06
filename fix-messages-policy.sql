-- Simple messages policies: All users can message each other

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

-- Allow all authenticated users to view, send, and update messages
CREATE POLICY "Users can view messages" ON messages FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND sender_id = auth.uid());

CREATE POLICY "Users can update messages" ON messages FOR UPDATE USING (auth.uid() IS NOT NULL);
