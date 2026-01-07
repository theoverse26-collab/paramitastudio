
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications (via triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
ON public.notifications
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Function to create notification on wishlist add
CREATE OR REPLACE FUNCTION public.notify_wishlist_added()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  game_title TEXT;
BEGIN
  SELECT title INTO game_title FROM public.games WHERE id = NEW.game_id;
  
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (
    NEW.user_id,
    'wishlist',
    'Game Added to Wishlist',
    'You added "' || COALESCE(game_title, 'a game') || '" to your wishlist.',
    NEW.game_id
  );
  
  RETURN NEW;
END;
$$;

-- Function to create notification on purchase
CREATE OR REPLACE FUNCTION public.notify_purchase_made()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  game_title TEXT;
BEGIN
  SELECT title INTO game_title FROM public.games WHERE id = NEW.game_id;
  
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (
    NEW.user_id,
    'purchase',
    'Purchase Successful',
    'You purchased "' || COALESCE(game_title, 'a game') || '". Thank you for your order!',
    NEW.game_id
  );
  
  RETURN NEW;
END;
$$;

-- Function to notify on comment reply
CREATE OR REPLACE FUNCTION public.notify_comment_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_user_id UUID;
  news_title TEXT;
BEGIN
  -- Only notify if this is a reply (has parent_id)
  IF NEW.parent_id IS NOT NULL THEN
    -- Get the parent comment's user_id
    SELECT user_id INTO parent_user_id FROM public.news_comments WHERE id = NEW.parent_id;
    
    -- Get news title
    SELECT title INTO news_title FROM public.news WHERE id = NEW.news_id;
    
    -- Don't notify if replying to own comment
    IF parent_user_id IS NOT NULL AND parent_user_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      VALUES (
        parent_user_id,
        'reply',
        'New Reply to Your Comment',
        'Someone replied to your comment on "' || COALESCE(news_title, 'a news post') || '".',
        NEW.news_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_wishlist_added
  AFTER INSERT ON public.wishlist
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_wishlist_added();

CREATE TRIGGER on_purchase_made
  AFTER INSERT ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_purchase_made();

CREATE TRIGGER on_comment_reply
  AFTER INSERT ON public.news_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment_reply();
