/*
  # Create Aubree's Math Adventure Database

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique) - The child's name for personalized experience
      - `current_level` (integer) - Current level progress
      - `current_operation` (text) - Current math operation (addition, subtraction, multiplication, division)
      - `total_score` (integer) - Total points earned
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `game_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `operation_type` (text) - Type of math operation
      - `level` (integer) - Level number
      - `completed` (boolean) - Whether level is completed
      - `best_score` (integer) - Best score for this level
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (since this is a children's game)
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  current_level integer DEFAULT 1,
  current_operation text DEFAULT 'addition',
  total_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  operation_type text NOT NULL,
  level integer NOT NULL,
  completed boolean DEFAULT false,
  best_score integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

-- Allow public access for children's game
CREATE POLICY "Allow public access to users"
  ON users
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to game_progress"
  ON game_progress
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_game_progress_user_id ON game_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_operation_level ON game_progress(operation_type, level);