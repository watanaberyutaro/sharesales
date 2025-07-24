-- Create custom users table for user management
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'sales_squad1' CHECK (role IN ('admin', 'sales_squad1', 'sales_squad2', 'sales_squad3', 'sales_squad1_captain', 'sales_squad2_captain', 'sales_squad3_captain')),
  avatar_url TEXT,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Allow authenticated users to read all users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to update users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow admins to delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Note: No updated_at column or trigger needed for users table
-- Status management is handled in user_profiles table

-- Insert demo users with sales squad system (role only)
INSERT INTO users (id, name, email, role, created_at) VALUES
  ('demo-admin-id', '総司令官', 'admin@demo.com', 'admin', NOW() - INTERVAL '30 days'),
  ('demo-user-1-id', '田中太郎', 'tanaka@demo.com', 'sales_squad1_captain', NOW() - INTERVAL '7 days'),
  ('demo-user-2-id', '佐藤花子', 'sato@demo.com', 'sales_squad2_captain', NOW() - INTERVAL '14 days'),
  ('demo-user-3-id', '山田次郎', 'yamada@demo.com', 'sales_squad3_captain', NOW() - INTERVAL '21 days'),
  ('demo-user-4-id', '鈴木三郎', 'suzuki@demo.com', 'sales_squad1', NOW() - INTERVAL '3 days'),
  ('demo-user-5-id', '高橋美咲', 'takahashi@demo.com', 'sales_squad2', NOW() - INTERVAL '10 days'),
  ('demo-user-6-id', '伊藤健一', 'ito@demo.com', 'sales_squad3', NOW() - INTERVAL '12 days'),
  ('demo-user-7-id', '新人候補', 'rookie@demo.com', 'sales_squad1', NOW() - INTERVAL '2 days')
ON CONFLICT (email) DO NOTHING;

-- Note: user_profiles table does not exist
-- Status management is handled in application state only