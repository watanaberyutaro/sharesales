-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE profits ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read all users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins can manage all users" ON users FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Job posts policies
CREATE POLICY "Anyone can read active job posts" ON job_posts FOR SELECT TO authenticated USING (status = 'active' OR user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can create job posts" ON job_posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own job posts" ON job_posts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own job posts" ON job_posts FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all job posts" ON job_posts FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Talent profiles policies
CREATE POLICY "Anyone can read available talent profiles" ON talent_profiles FOR SELECT TO authenticated USING (status = 'available' OR user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can create talent profiles" ON talent_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own talent profiles" ON talent_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own talent profiles" ON talent_profiles FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all talent profiles" ON talent_profiles FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Partners policies
CREATE POLICY "Anyone can read partners" ON partners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create partners" ON partners FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own partners" ON partners FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own partners" ON partners FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all partners" ON partners FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Matches policies
CREATE POLICY "Users can read matches they're involved in" ON matches FOR SELECT TO authenticated 
USING (
  proposer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM job_posts WHERE id = job_post_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM talent_profiles WHERE id = talent_profile_id AND user_id = auth.uid()) OR
  is_admin()
);
CREATE POLICY "Users can create matches" ON matches FOR INSERT TO authenticated WITH CHECK (proposer_id = auth.uid());
CREATE POLICY "Users can update matches they're involved in" ON matches FOR UPDATE TO authenticated 
USING (
  proposer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM job_posts WHERE id = job_post_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM talent_profiles WHERE id = talent_profile_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all matches" ON matches FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Assignments policies
CREATE POLICY "Users can read assignments they're involved in" ON assignments FOR SELECT TO authenticated 
USING (
  client_user_id = auth.uid() OR 
  talent_user_id = auth.uid() OR 
  is_admin()
);
CREATE POLICY "Admins can manage all assignments" ON assignments FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Chat rooms policies
CREATE POLICY "Users can read chat rooms they're part of" ON chat_rooms FOR SELECT TO authenticated 
USING (auth.uid()::text = ANY(participant_ids) OR is_admin());
CREATE POLICY "Users can create chat rooms" ON chat_rooms FOR INSERT TO authenticated 
WITH CHECK (auth.uid()::text = ANY(participant_ids));
CREATE POLICY "Admins can manage all chat rooms" ON chat_rooms FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Chat messages policies
CREATE POLICY "Users can read messages in their rooms" ON chat_messages FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM chat_rooms 
    WHERE id = room_id AND auth.uid()::text = ANY(participant_ids)
  ) OR is_admin()
);
CREATE POLICY "Users can send messages to their rooms" ON chat_messages FOR INSERT TO authenticated 
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM chat_rooms 
    WHERE id = room_id AND auth.uid()::text = ANY(participant_ids)
  )
);
CREATE POLICY "Admins can manage all messages" ON chat_messages FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "Admins can manage all notifications" ON notifications FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Favorites policies
CREATE POLICY "Users can read own favorites" ON favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Profits policies
CREATE POLICY "Users can read own profits" ON profits FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Admins can manage all profits" ON profits FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Timeline posts policies
CREATE POLICY "Anyone can read timeline posts" ON timeline_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create timeline posts" ON timeline_posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own timeline posts" ON timeline_posts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own timeline posts" ON timeline_posts FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all timeline posts" ON timeline_posts FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Timeline replies policies
CREATE POLICY "Anyone can read timeline replies" ON timeline_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create timeline replies" ON timeline_replies FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own timeline replies" ON timeline_replies FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own timeline replies" ON timeline_replies FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all timeline replies" ON timeline_replies FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Sales targets policies
CREATE POLICY "Anyone can read sales targets" ON sales_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage sales targets" ON sales_targets FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Partner reviews policies
CREATE POLICY "Anyone can read partner reviews" ON partner_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create partner reviews" ON partner_reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own partner reviews" ON partner_reviews FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own partner reviews" ON partner_reviews FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all partner reviews" ON partner_reviews FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Comments policies
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all comments" ON comments FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Approved users policies
CREATE POLICY "Admins can read approved users" ON approved_users FOR SELECT TO authenticated USING (is_admin() OR user_id = auth.uid());
CREATE POLICY "Admins can manage approved users" ON approved_users FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Push subscriptions policies
CREATE POLICY "Users can manage own push subscriptions" ON push_subscriptions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all push subscriptions" ON push_subscriptions FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());