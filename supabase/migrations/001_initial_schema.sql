-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('client', 'supplier', 'admin', '営業1番隊', '営業2番隊', '営業3番隊', '営業1番隊隊長', '営業2番隊隊長', '営業3番隊隊長');
CREATE TYPE work_type AS ENUM ('fulltime', 'event', 'retail', 'any');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'closed', 'completed', 'assigned');
CREATE TYPE talent_status AS ENUM ('available', 'busy', 'unavailable', 'assigned');
CREATE TYPE company_size AS ENUM ('startup', 'small', 'medium', 'large');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'rejected', 'contracted', 'completed', 'assigned');
CREATE TYPE assignment_status AS ENUM ('active', 'completed', 'paused');
CREATE TYPE notification_type AS ENUM ('message', 'match', 'job', 'talent', 'partner', 'approval_request');
CREATE TYPE favoritable_type AS ENUM ('job', 'talent', 'partner');
CREATE TYPE profit_source AS ENUM ('client', 'talent');
CREATE TYPE profit_type AS ENUM ('single', 'monthly');
CREATE TYPE commentable_type AS ENUM ('job', 'talent');
CREATE TYPE message_type AS ENUM ('text', 'system', 'approval_request');
CREATE TYPE proposer_type AS ENUM ('client', 'talent');
CREATE TYPE assignment_type AS ENUM ('ongoing', 'single');

-- Create partners table first (since users references it)
CREATE TABLE partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  company_size company_size NOT NULL,
  employee_count integer DEFAULT 0,
  specialties text[] DEFAULT '{}',
  website text,
  contact_email text,
  rating numeric(3,2) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  company_id uuid REFERENCES partners(id),
  avatar text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key to partners table
ALTER TABLE partners ADD CONSTRAINT partners_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create job posts table
CREATE TABLE job_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  budget integer NOT NULL,
  daily_rate integer,
  work_days integer NOT NULL,
  work_dates jsonb,
  location text DEFAULT 'リモート可',
  skill_tags text[] DEFAULT '{}',
  work_type work_type DEFAULT 'any',
  preferred_carrier text[] DEFAULT '{}',
  status job_status DEFAULT 'active',
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES partners(id),
  company_name text,
  is_hot boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create talent profiles table
CREATE TABLE talent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  skills text[] DEFAULT '{}',
  rate integer NOT NULL,
  location text DEFAULT 'リモート可',
  experience_years integer DEFAULT 0,
  bio text NOT NULL,
  work_type work_type DEFAULT 'any',
  preferred_carrier text[] DEFAULT '{}',
  portfolio text,
  avatar text,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status talent_status DEFAULT 'available',
  company_name text,
  is_hot boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create matches table
CREATE TABLE matches (
  id text PRIMARY KEY,
  job_post_id uuid NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
  talent_profile_id uuid NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
  proposer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proposer_type proposer_type NOT NULL,
  status match_status DEFAULT 'pending',
  assignment_type assignment_type,
  message text,
  approval_requested boolean DEFAULT false,
  approved_by text[] DEFAULT '{}',
  pending_approval_from text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assignments table
CREATE TABLE assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  job_post_id uuid NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
  talent_profile_id uuid NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
  client_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  talent_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status assignment_status DEFAULT 'active',
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  monthly_profit numeric(10,2) DEFAULT 0,
  total_profit numeric(10,2) DEFAULT 0,
  last_profit_calculation timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat rooms table
CREATE TABLE chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  job_post_id uuid REFERENCES job_posts(id) ON DELETE SET NULL,
  talent_profile_id uuid REFERENCES talent_profiles(id) ON DELETE SET NULL,
  participant_ids text[] DEFAULT '{}',
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create chat messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  message_type message_type DEFAULT 'text',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_id text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favoritable_id text NOT NULL,
  favoritable_type favoritable_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, favoritable_id, favoritable_type)
);

-- Create profits table
CREATE TABLE profits (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id text NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES assignments(id) ON DELETE SET NULL,
  job_post_id uuid NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
  talent_profile_id uuid NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) DEFAULT 0,
  month text NOT NULL,
  type profit_source NOT NULL,
  profit_type profit_type NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create timeline posts table
CREATE TABLE timeline_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  images text[],
  likes text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create timeline replies table
CREATE TABLE timeline_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES timeline_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create sales targets table
CREATE TABLE sales_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_amount numeric(12,2) DEFAULT 0,
  current_month text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create partner reviews table
CREATE TABLE partner_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating numeric(3,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(partner_id, user_id)
);

-- Create comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commentable_id uuid NOT NULL,
  commentable_type commentable_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create approved users table
CREATE TABLE approved_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_at timestamptz DEFAULT now()
);

-- Create push subscriptions table
CREATE TABLE push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_job_posts_user_id ON job_posts(user_id);
CREATE INDEX idx_job_posts_status ON job_posts(status);
CREATE INDEX idx_job_posts_created_at ON job_posts(created_at DESC);
CREATE INDEX idx_talent_profiles_user_id ON talent_profiles(user_id);
CREATE INDEX idx_talent_profiles_status ON talent_profiles(status);
CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_matches_job_post_id ON matches(job_post_id);
CREATE INDEX idx_matches_talent_profile_id ON matches(talent_profile_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_profits_user_id ON profits(user_id);
CREATE INDEX idx_profits_month ON profits(month);
CREATE INDEX idx_timeline_posts_user_id ON timeline_posts(user_id);
CREATE INDEX idx_timeline_posts_created_at ON timeline_posts(created_at DESC);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_posts_updated_at BEFORE UPDATE ON job_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_talent_profiles_updated_at BEFORE UPDATE ON talent_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timeline_posts_updated_at BEFORE UPDATE ON timeline_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_targets_updated_at BEFORE UPDATE ON sales_targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();