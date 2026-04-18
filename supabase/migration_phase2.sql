-- Phase 2 migration: Behavior Points, Seating Chart, Hall Pass, Reward Badges
-- Run this AFTER schema.sql in the Supabase SQL Editor.

-- Behavior events
CREATE TABLE IF NOT EXISTS behavior_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_behavior_events_student_id ON behavior_events(student_id);
CREATE INDEX IF NOT EXISTS idx_behavior_events_created_at ON behavior_events(created_at);

-- Seating layouts
CREATE TABLE IF NOT EXISTS seating_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  positions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seating_layouts_class_id ON seating_layouts(class_id);

-- Hall passes
CREATE TABLE IF NOT EXISTS hall_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  left_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  returned_at TIMESTAMPTZ,
  reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_hall_passes_student_id ON hall_passes(student_id);
CREATE INDEX IF NOT EXISTS idx_hall_passes_returned_at ON hall_passes(returned_at);

-- Student badges
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  badge_slug TEXT NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON student_badges(student_id);

-- Enable RLS
ALTER TABLE behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;

-- RLS: behavior_events (scoped via student -> class -> user)
CREATE POLICY "Users can view behavior events for their students"
  ON behavior_events FOR SELECT
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "Users can create behavior events for their students"
  ON behavior_events FOR INSERT
  WITH CHECK (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "Users can update behavior events for their students"
  ON behavior_events FOR UPDATE
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete behavior events for their students"
  ON behavior_events FOR DELETE
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

-- RLS: seating_layouts (scoped via class -> user)
CREATE POLICY "Users can view seating for their classes"
  ON seating_layouts FOR SELECT
  USING (class_id IN (SELECT id FROM classes WHERE user_id = auth.uid()));

CREATE POLICY "Users can create seating for their classes"
  ON seating_layouts FOR INSERT
  WITH CHECK (class_id IN (SELECT id FROM classes WHERE user_id = auth.uid()));

CREATE POLICY "Users can update seating for their classes"
  ON seating_layouts FOR UPDATE
  USING (class_id IN (SELECT id FROM classes WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete seating for their classes"
  ON seating_layouts FOR DELETE
  USING (class_id IN (SELECT id FROM classes WHERE user_id = auth.uid()));

-- RLS: hall_passes (scoped via student -> class -> user)
CREATE POLICY "Users can view hall passes for their students"
  ON hall_passes FOR SELECT
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "Users can create hall passes for their students"
  ON hall_passes FOR INSERT
  WITH CHECK (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "Users can update hall passes for their students"
  ON hall_passes FOR UPDATE
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete hall passes for their students"
  ON hall_passes FOR DELETE
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

-- RLS: student_badges (scoped via student -> class -> user)
CREATE POLICY "Users can view badges for their students"
  ON student_badges FOR SELECT
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "Users can create badges for their students"
  ON student_badges FOR INSERT
  WITH CHECK (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete badges for their students"
  ON student_badges FOR DELETE
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.user_id = auth.uid()
  ));
