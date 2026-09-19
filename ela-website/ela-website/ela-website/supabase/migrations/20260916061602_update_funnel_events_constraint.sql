ALTER TABLE public.funnel_events DROP CONSTRAINT funnel_events_event_type_check;
ALTER TABLE public.funnel_events ADD CONSTRAINT funnel_events_event_type_check CHECK (event_type IN ('signup', 'add_to_cart', 'remove_from_cart', 'checkout_started', 'order_placed', 'webhook_status_update'));
