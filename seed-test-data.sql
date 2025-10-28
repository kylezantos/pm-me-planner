-- Seed test data for PM Me Planner
-- Run with: psql -h <your-supabase-db-host> -U postgres -d postgres -f seed-test-data.sql

-- Insert block types for test user
INSERT INTO block_types (id, user_id, name, color, default_duration_minutes, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Client Work', '#3b82f6', 120, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Deep Work', '#8b5cf6', 90, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Meetings', '#ef4444', 60, NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Learning', '#10b981', 60, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert some test tasks in backlog
INSERT INTO tasks (id, user_id, title, description, block_type_id, priority, status, estimated_duration_minutes, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000001', 'Review client proposal', 'Go through the Q4 proposal and provide feedback', '11111111-1111-1111-1111-111111111111', 'high', 'pending', 45, NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000001', 'Research TypeScript patterns', 'Learn about advanced TypeScript patterns for the project', '22222222-2222-2222-2222-222222222222', 'medium', 'pending', 90, NOW(), NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000001', 'Update documentation', 'Update the API documentation with new endpoints', '11111111-1111-1111-1111-111111111111', 'low', 'pending', 30, NOW(), NOW()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000001', 'Complete React course module', 'Finish module 5 on hooks and state management', '44444444-4444-4444-4444-444444444444', 'medium', 'pending', 60, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert a couple of block instances for today
INSERT INTO block_instances (id, user_id, block_type_id, planned_start, planned_end, status, created_at, updated_at)
VALUES
  ('11111111-bbbb-cccc-dddd-111111111111', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   DATE_TRUNC('day', NOW()) + INTERVAL '10 hours',
   DATE_TRUNC('day', NOW()) + INTERVAL '12 hours',
   'scheduled', NOW(), NOW()),
  ('22222222-bbbb-cccc-dddd-222222222222', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   DATE_TRUNC('day', NOW()) + INTERVAL '14 hours',
   DATE_TRUNC('day', NOW()) + INTERVAL '15 hours 30 minutes',
   'scheduled', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Assign one task to the first block
UPDATE tasks
SET block_instance_id = '11111111-bbbb-cccc-dddd-111111111111'
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Verify the data
SELECT 'Block Types:' as section;
SELECT id, name, color, default_duration_minutes FROM block_types WHERE user_id = '00000000-0000-0000-0000-000000000001';

SELECT 'Tasks:' as section;
SELECT id, title, block_type_id, block_instance_id, status FROM tasks WHERE user_id = '00000000-0000-0000-0000-000000000001';

SELECT 'Block Instances:' as section;
SELECT id, block_type_id, planned_start, planned_end, status FROM block_instances WHERE user_id = '00000000-0000-0000-0000-000000000001';
