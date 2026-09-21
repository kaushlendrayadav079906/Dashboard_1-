import { useAuth } from "@/context/AuthContext";

type FunnelEvent = "add_to_cart" | "remove_from_cart" | "checkout_started" | "order_placed";

export const useFunnelTracker = () => {
  const { user } = useAuth();

  const trackEvent = async (_eventType: FunnelEvent, _metadata: Record<string, unknown> = {}) => {
    if (!user) return;
    // Funnel events are now recorded by the FastAPI backend when the order is processed.
  };

  return { trackEvent };
};
