-- Create function to notify admins when someone comments on news
CREATE OR REPLACE FUNCTION public.notify_admins_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  news_title TEXT;
  admin_user RECORD;
BEGIN
  -- Only notify for new top-level comments (not replies)
  IF NEW.parent_id IS NULL THEN
    -- Get news title
    SELECT title INTO news_title FROM public.news WHERE id = NEW.news_id;
    
    -- Notify all admins
    FOR admin_user IN 
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    LOOP
      -- Don't notify if the commenter is the admin themselves
      IF admin_user.user_id != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, type, title, message, related_id)
        VALUES (
          admin_user.user_id,
          'comment',
          'New Comment on News',
          'Someone commented on "' || COALESCE(news_title, 'a news post') || '".',
          NEW.news_id
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for admin notification on new comments
DROP TRIGGER IF EXISTS on_comment_notify_admins ON public.news_comments;
CREATE TRIGGER on_comment_notify_admins
  AFTER INSERT ON public.news_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_on_comment();