import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Package, Truck, Mail, ArrowRight, Download, MapPin } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/context/ProductContext";
import { apiFetch } from "@/lib/api";
import { generateReceiptPDF } from "@/lib/receipt";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
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

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    if (!orderId) { navigate("/"); return; }

    (async () => {
      try {
        const o = await apiFetch<Order>(`/api/v1/orders/${orderId}`);
        setOrder(o as Order);
        const oi = await apiFetch<OrderItem[]>(`/api/v1/orders/${orderId}/items`);
        setItems(oi ?? []);
      } catch {
        navigate("/");
        return;
      }
      setLoading(false);
    })();
  }, [orderId, user, authLoading, navigate]);

  if (loading || !order) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading your order...</div>
        </div>
      </Layout>
    );
  }

  const addr = order.shipping_address || {};
  const orderNumber = order.id.slice(0, 8).toUpperCase();

  return (
    <Layout>
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-brand" />
            </div>
            <h1 className="heading-section mb-3">Order Confirmed!</h1>
            <p className="text-body max-w-md mx-auto">
              Thank you for your order. A confirmation has been sent to{" "}
              <span className="font-medium text-foreground">{addr.email}</span>.
            </p>
          </motion.div>

          {/* Order Number */}
          <div className="bg-secondary p-6 mb-8 text-center rounded-sm">
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <p className="font-mono text-2xl font-semibold tracking-wider">#{orderNumber}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Placed on {new Date(order.created_at).toLocaleString("en-IN")}
            </p>
          </div>

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
                        <span className="ml-2 font-mono text-[10px] text-muted-foreground/70">
                          ({item.item_code})
                        </span>
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
                    ? (order.payment_status === "paid" ? "Paid" : "Pending")
                    : "Pending / Pay on Delivery"}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          {addr.address && (
            <div className="bg-card border border-border rounded-sm p-6 mb-6 text-sm">
              <h2 className="font-serif text-lg mb-3">Shipping To</h2>
              <p className="font-medium">{addr.firstName} {addr.lastName}</p>
              <p className="text-muted-foreground">{addr.address}</p>
              <p className="text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
              <p className="text-muted-foreground">Phone: {addr.phone}</p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-card border border-border rounded-sm p-6 mb-8">
            <h2 className="font-serif text-lg mb-4">What happens next?</h2>
            <div className="space-y-4">
              {[
                { icon: Mail, title: "Confirmation email", desc: "Order details on the way to your inbox." },
                { icon: Package, title: "Packed with care", desc: "Your order will be packed within 1-2 business days." },
                { icon: Truck, title: "Shipped", desc: "Delivered to your address within 4-7 business days." },
              ].map((s) => (
                <div key={s.title} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                generateReceiptPDF({
                  orderId: order.id,
                  createdAt: order.created_at,
                  status: order.status,
                  total: Number(order.total_amount),
                  items: items.map((i) => ({ ...i, price: Number(i.price) })),
                  shipping: addr,
                })
              }
            >
              <Download className="w-4 h-4 mr-2" /> Download Receipt
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(`/track/${order.id}`)}
            >
              <MapPin className="w-4 h-4 mr-2" /> Track Order
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => navigate("/shop")} size="lg" className="flex-1">
              Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link to="/contact">Need help?</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OrderConfirmation;
