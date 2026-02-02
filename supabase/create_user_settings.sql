-- Creates ONLY the user_settings table (for storing Time Loss data)
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sound_enabled BOOLEAN DEFAULT true,
  volume REAL DEFAULT 0.5,
  timer_presets JSONB DEFAULT '[60, 120, 300, 600]',
  noise_threshold INTEGER DEFAULT 70,
  dark_mode BOOLEAN DEFAULT false,
  time_loss_data JSONB DEFAULT '{}'
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own settings" ON user_settings FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
