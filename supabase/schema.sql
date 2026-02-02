-- The Classroom Manager Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  excluded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'late')) NOT NULL,
  UNIQUE(student_id, date)
);

-- User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sound_enabled BOOLEAN DEFAULT true,
  volume REAL DEFAULT 0.5,
  timer_presets JSONB DEFAULT '[60, 120, 300, 600]',
  noise_threshold INTEGER DEFAULT 70,
  dark_mode BOOLEAN DEFAULT false,
  time_loss_data JSONB DEFAULT '{}'
);

-- Create indexes for better query performance
CREATE INDEX idx_classes_user_id ON classes(user_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_notes_class_id ON notes(class_id);
CREATE INDEX idx_notes_date ON notes(date);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for classes
CREATE POLICY "Users can view their own classes"
  ON classes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own classes"
  ON classes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own classes"
  ON classes FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own classes"
  ON classes FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for students
CREATE POLICY "Users can view students in their classes"
  ON students FOR SELECT
  USING (class_id IN (SELECT id FROM classes WHERE user_id = auth.uid()));

CREATE POLICY "Users can create students in their classes"
  ON students FOR INSERT
  WITH CHECK (class_id IN (SELECT id FROM classes WHERE user_id = auth.uid()));

CREATE POLICY "Users can update students in their classes"
  ON students FOR UPDATE
  USING (class_id IN (SELECT id FROM classes WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete students in their classes"
  ON students FOR DELETE
  USING (class_id IN (SELECT id FROM classes WHERE user_id = auth.uid()));

-- RLS Policies for notes
CREATE POLICY "Users can view notes in their classes"
  ON notes FOR SELECT
  USING (class_id IN (SELECT id FROM classes WHERE user_id = auth.uid()));

CREATE POLICY "Users can create notes in their classes"
  ON notes FOR INSERT
  WITH CHECK (class_id IN (SELECT id FROM classes WHERE user_id = auth.uid()));

CREATE POLICY "Users can update notes in their classes"
  ON notes FOR UPDATE
  USING (class_id IN (SELECT id FROM classes WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete notes in their classes"
  ON notes FOR DELETE
  USING (class_id IN (SELECT id FROM classes WHERE user_id = auth.uid()));

-- RLS Policies for attendance
CREATE POLICY "Users can view attendance for students in their classes"
  ON attendance FOR SELECT
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "Users can create attendance for students in their classes"
  ON attendance FOR INSERT
  WITH CHECK (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "Users can update attendance for students in their classes"
  ON attendance FOR UPDATE
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete attendance for students in their classes"
  ON attendance FOR DELETE
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (user_id = auth.uid());

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
