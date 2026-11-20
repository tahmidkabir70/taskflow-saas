-- Migration: Add strict cross-user ownership validation trigger for tasks
-- Ensures tasks.project_id and tasks.category_id strictly belong to the task's user_id.

CREATE OR REPLACE FUNCTION public.validate_task_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- If project_id is provided, verify project belongs to user_id
  IF NEW.project_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = NEW.project_id AND user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'Project does not belong to the user';
    END IF;
  END IF;

  -- If category_id is provided, verify category belongs to user_id
  IF NEW.category_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.categories 
      WHERE id = NEW.category_id AND user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'Category does not belong to the user';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS tr_validate_task_ownership ON public.tasks;
CREATE TRIGGER tr_validate_task_ownership
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.validate_task_ownership();

-- Ensure profile creation trigger is robust with ON CONFLICT DO NOTHING to prevent duplicate errors
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
