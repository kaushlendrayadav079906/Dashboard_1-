import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Package, CheckCircle2, Truck, Home, XCircle, Clock, Download } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/context/ProductContext";
import { apiFetch } from "@/lib/api";
import { generateReceiptPDF } from "@/lib/receipt";
import { toast } from "sonner";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  updated_at: string;
  shipping_address: any;
  payment_method: string;
  payment_status: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string | null;
  item_code: string | null;
}

const trackingSteps = [
  { key: "pending", label: "Order Placed", icon: Clock, desc: "We've received your order" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2, desc: "Payment received, packing soon" },
  { key: "shipped", label: "Shipped", icon: Truck, desc: "Out for delivery" },
  { key: "delivered", label: "Delivered", icon: Home, desc: "Enjoy your Ela order" },
];

const statusIndex = (status: string) =>
  trackingSteps.findIndex((s) => s.key === status);

const TrackOrder = () => {
  const { orderId: paramId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(paramId ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const lookup = async (value: string) => {
    if (!value) return;
    setLoading(true);
    setNotFound(false);
    setOrder(null);

    // Accept full UUID or 8-char prefix
    const clean = value.trim().replace(/^#/, "").toLowerCase();

    try {
      const data = await apiFetch<Order>(`/api/v1/orders/${clean}`);
      setOrder(data as Order);
      const oi = await apiFetch<OrderItem[]>(`/api/v1/orders/${data.id}/items`);
      setItems(oi ?? []);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    if (paramId) lookup(paramId);
  }, [paramId, user, authLoading]);

  const currentStep = order ? statusIndex(order.status) : -1;
  const isCancelled = order?.status === "cancelled" || order?.payment_status === "failed";

  // ETA: confirmed + 5 business days
  const eta = order
    ? new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000)
    : null;

  return (
    <Layout>
      <section className="bg-secondary py-12 md:py-16">
        <div className="container-wide">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="heading-display">Track Your Order</h1>
            <p className="text-body mt-2">Enter your order number to see status and shipment updates.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-narrow">
          {/* Search */}
          <form
            onSubmit={(e) => { e.preventDefault(); lookup(searchInput); }}
            className="flex gap-2 mb-10"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter order number (e.g. 4F2A1B9C)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={loading || !searchInput}>
              {loading ? "Looking up..." : "Track"}
            </Button>
          </form>

          {notFound && (
            <div className="bg-secondary p-8 rounded-sm text-center">
              <XCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium mb-1">Order not found</p>
              <p className="text-sm text-muted-foreground">
                Double-check the order number or contact support at accounts@koollife.in.
              </p>
            </div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Order header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
                <div>
                  <p className="text-xs text-muted-foreground">Order Number</p>
                  <p className="font-mono text-xl font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Placed {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
                {!isCancelled && eta && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                    <p className="font-medium">
                      {eta.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                )}
              </div>

              {/* Tracker */}
              {isCancelled ? (
                <div className="bg-red-50 border border-red-200 p-6 rounded-sm mb-8">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-medium">
                        {order.payment_status === "failed" ? "Payment Failed" : "Order Cancelled"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Need help? Email accounts@koollife.in or WhatsApp +91 98695 23955.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border p-6 md:p-8 rounded-sm mb-8">
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-border hidden sm:block" />
                    <div
                      className="absolute top-5 left-5 h-0.5 bg-brand transition-all duration-500 hidden sm:block"
                      style={{
                        width: currentStep >= 0 ? `calc(${(currentStep / (trackingSteps.length - 1)) * 100}% - 2.5rem)` : "0%",
                      }}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2 relative">
                      {trackingSteps.map((step, i) => {
                        const reached = currentStep >= i;
                        const Icon = step.icon;
                        return (
                          <div key={step.key} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                                reached ? "bg-brand text-white" : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="sm:text-center">
                              <p className={`text-sm font-medium ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                                {step.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 sm:max-w-[120px]">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground">
                    Last updated: {new Date(order.updated_at).toLocaleString("en-IN")}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="bg-card border border-border rounded-sm p-6 mb-6">
                <h2 className="font-serif text-lg mb-4">Items ({items.length})</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm border-b border-border/50 pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.size && `Size: ${item.size} • `}Qty: {item.quantity}
                          {item.item_code && (
                            <span className="ml-2 font-mono text-[10px]">({item.item_code})</span>
                          )}
                        </p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-card border border-border rounded-sm p-6 mb-6">
                <h2 className="font-serif text-lg mb-4">Payment Information</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium">
                      {order.payment_method === "razorpay" ? "Online Payment" : "Cash on Delivery"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status</span>
                    <span className="font-medium">
                      {order.payment_method === "razorpay" 
                        ? (order.payment_status === "paid" ? "Paid" : (order.payment_status === "failed" ? "Failed" : "Pending"))
                        : "Pending / Pay on Delivery"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              {order.shipping_address?.address && (
                <div className="bg-card border border-border rounded-sm p-6 mb-6 text-sm">
                  <h2 className="font-serif text-lg mb-3">Delivering To</h2>
                  <p className="font-medium">
                    {order.shipping_address.firstName} {order.shipping_address.lastName}
                  </p>
                  <p className="text-muted-foreground">{order.shipping_address.address}</p>
                  <p className="text-muted-foreground">
                    {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                  </p>
                  <p className="text-muted-foreground">Phone: {order.shipping_address.phone}</p>
                </div>
              )}

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() =>
                  generateReceiptPDF({
                    orderId: order.id,
                    createdAt: order.created_at,
                    status: order.status,
                    total: Number(order.total_amount),
                    items: items.map((i) => ({ ...i, price: Number(i.price) })),
                    shipping: order.shipping_address,
                  })
                }
              >
                <Download className="w-4 h-4 mr-2" /> Download Receipt
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default TrackOrder;
