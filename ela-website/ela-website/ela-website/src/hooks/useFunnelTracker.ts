import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type FunnelEvent = "add_to_cart" | "remove_from_cart" | "checkout_started" | "order_placed";

export const useFunnelTracker = () => {
  const { user } = useAuth();

  const trackEvent = async (eventType: FunnelEvent, metadata: Record<string, unknown> = {}) => {
    if (!user) return;

    try {
      await supabase.from("funnel_events").insert([{
        user_id: user.id,
        event_type: eventType,
        metadata: metadata as any,
      }]);
    } catch (error) {
      console.error("Failed to track funnel event:", error);
    }
  };

  return { trackEvent };
};
