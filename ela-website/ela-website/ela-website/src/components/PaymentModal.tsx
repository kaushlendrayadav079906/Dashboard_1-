import { useState, useEffect } from "react";
import { X, Lock, CreditCard, Smartphone, Wallet, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, formatPrice } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

type PaymentType = "online" | "cod" | null;
type OnlineMethod = "google_pay" | "phonepe" | "paytm" | "amazon_pay" | "card" | "upi" | null;

const PaymentModal = ({ open, onClose, product }: PaymentModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState<PaymentType>("online");
  const [onlineMethod, setOnlineMethod] = useState<OnlineMethod>(null);
  const [processing, setProcessing] = useState(false);
  const stockValue = product?.stock ?? product?.quantity;
  const hasStock = stockValue !== undefined && stockValue !== null;
  const outOfStock = hasStock && stockValue === 0;

  useEffect(() => {
    if (open && !window.Razorpay) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      document.body.appendChild(s);
      return () => { document.body.removeChild(s); };
    }
  }, [open]);

  useEffect(() => {
    if (!open) setTimeout(() => { setPaymentType("online"); setOnlineMethod(null); setProcessing(false); }, 300);
  }, [open]);

  const canProceed = product && !outOfStock && (paymentType === "cod" || (paymentType === "online" && onlineMethod !== null));

  const handlePayment = async () => {
    if (!product || !canProceed || processing) return;
    if (!user) { toast.error("Please sign in to complete your purchase."); onClose(); navigate("/auth"); return; }
    setProcessing(true);
    if (paymentType === "cod") { toast.info("Cash on Delivery requires shipping address. Proceed to checkout for COD orders."); setProcessing(false); return; }
    try {
      const { data: rd, error: re } = await supabase.functions.invoke("create-razorpay-order", {
        body: { amount: product.price, currency: "INR", receipt: `ela_q_${Date.now()}`, notes: { product_id: product.id, product_name: product.name } }
      });
      if (re || rd?.error) throw new Error(rd?.error || "Failed to create payment order");
      const options = {
        key: rd.key_id, amount: rd.amount, currency: rd.currency, name: "Ela by KOOL LIFESTYLE",
        description: product.name, order_id: rd.order_id, image: product.image, theme: { color: "#d63384" },
        method: onlineMethod === "card" ? { card: true, upi: false, netbanking: false, wallet: false, emi: false }
              : onlineMethod === "upi" ? { upi: true, card: false, netbanking: false, wallet: false, emi: false }
              : { upi: true, card: true, netbanking: true, wallet: true, emi: false },
        handler: async (resp: any) => {
          try {
            const { data: vd, error: ve } = await supabase.functions.invoke("verify-razorpay-payment", {
              body: { razorpay_order_id: resp.razorpay_order_id, razorpay_payment_id: resp.razorpay_payment_id, razorpay_signature: resp.razorpay_signature }
            });
            if (ve || !vd?.verified) { toast.error("Payment verification failed. Contact support."); setProcessing(false); return; }
            const { data: order, error: oe } = await supabase.from("orders").insert([{
              user_id: user.id, total_amount: product.price, status: "confirmed",
              shipping_address: { quick_checkout: true, razorpay_payment_id: resp.razorpay_payment_id, razorpay_order_id: resp.razorpay_order_id } as any,
            }]).select().single();
            if (oe) throw oe;
            await supabase.from("order_items").insert([{ order_id: order.id, product_id: product.id, product_name: product.name, quantity: 1, price: product.price }]);
            toast.success("Payment successful! Order confirmed."); onClose(); navigate(`/order-confirmation/${order.id}`);
          } catch (e) { console.error(e); toast.error("Payment received but order creation failed. Contact support."); }
          setProcessing(false);
        },
        modal: { ondismiss: () => { setProcessing(false); toast.info("Payment cancelled."); } },
      };
      if (!window.Razorpay) { toast.error("Payment gateway is loading. Try again."); setProcessing(false); return; }
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r: any) => { toast.error(`Payment failed: ${r.error.description}`); setProcessing(false); });
      rzp.open();
    } catch (err: any) { console.error(err); toast.error(err.message || "Something went wrong."); setProcessing(false); }
  };

  const onlineMethods = [
    { id: "google_pay" as OnlineMethod, label: "Google Pay", icon: "GPay" },
    { id: "phonepe" as OnlineMethod, label: "PhonePe", icon: "P" },
    { id: "paytm" as OnlineMethod, label: "Paytm", icon: "Paytm" },
    { id: "amazon_pay" as OnlineMethod, label: "Amazon Pay", icon: "amazon" },
    { id: "card" as OnlineMethod, label: "Credit/Debit Card", icon: "card" },
    { id: "upi" as OnlineMethod, label: "UPI", icon: "UPI" },
  ];

  const renderIcon = (ic: string) => {
    switch (ic) {
      case "GPay": return (
        <div className="text-xs font-bold flex items-center gap-px">
          <span className="text-blue-500">G</span><span className="text-red-500">o</span>
          <span className="text-yellow-500">o</span><span className="text-blue-500">g</span>
          <span className="text-green-500">l</span><span className="text-red-500">e</span>
          <span className="text-gray-700 ml-0.5">Pay</span>
        </div>
      );
      case "P": return <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>;
      case "Paytm": return <div className="text-xs font-bold text-sky-600">Pay<sup className="text-sky-500">tm</sup></div>;
      case "amazon": return <div className="text-lg font-bold text-orange-500 italic">a</div>;
      case "card": return <CreditCard className="w-5 h-5 text-gray-700" />;
      case "UPI": return (
        <div className="text-xs font-bold flex items-center gap-px">
          <span className="text-gray-700">UPI</span><span className="text-green-600 text-xs">$</span>
        </div>
      );
      default: return <Wallet className="w-4 h-4 text-gray-700" />;
    }
  };

  return (
    <AnimatePresence>
      {open && product && (
        <motion.div
          key="payment-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 right-0 h-full z-50 flex flex-col bg-background border-l border-border"
          style={{
            width: "clamp(320px, 30vw, 440px)",
            boxShadow: "-8px 0 40px -4px rgba(0,0,0,0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border shrink-0">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-foreground">Complete Your Purchase</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose your preferred payment method</p>
            </div>
            <button
              onClick={onClose}
              disabled={processing}
              className="p-2 -mr-1 -mt-1 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close payment panel"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

            {/* Product info row */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0 border border-border/50">
                <img
                  src={product.images[0] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-foreground truncate">{product.name}</h3>
                <span className="text-lg font-semibold text-brand mt-1 block">{formatPrice(product.price)}</span>
              </div>
              {hasStock && (
                <div className="text-right shrink-0">
                  <span className={`text-sm font-medium ${stockValue! > 0 ? "text-green-600" : "text-red-500"}`}>
                    {stockValue} left
                  </span>
                </div>
              )}
            </div>

            {/* Out of stock warning */}
            {outOfStock && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                <X className="w-4 h-4" />This item is currently out of stock.
              </div>
            )}

            {/* Payment method selection */}
            <div>
              <h3 className="font-semibold text-base text-foreground mb-4">Select Payment Method</h3>
              <div className="space-y-3">

                {/* Online Payment */}
                <div
                  onClick={() => !processing && !outOfStock && setPaymentType("online")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${paymentType === "online" ? "border-brand bg-brand/5" : "border-border hover:border-border/80 bg-background"} ${processing || outOfStock ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentType === "online" ? "border-brand bg-brand" : "border-muted-foreground/40"}`}>
                        {paymentType === "online" && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-brand" />
                        <span className="font-semibold text-foreground">Online Payment</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Pay securely using any of the following options</p>
                    </div>
                  </div>
                  <AnimatePresence>
                    {paymentType === "online" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
                          {onlineMethods.map((m) => (
                            <button
                              key={m.id}
                              onClick={(e) => { e.stopPropagation(); !processing && !outOfStock && setOnlineMethod(m.id); }}
                              disabled={processing || outOfStock}
                              className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all duration-150 ${onlineMethod === m.id ? "border-brand bg-brand/5 shadow-sm" : "border-border/60 bg-background hover:border-border hover:bg-secondary/30"} ${processing || outOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <div className="h-7 flex items-center justify-center">{renderIcon(m.icon!)}</div>
                              <span className="text-[10px] sm:text-xs font-medium text-foreground text-center leading-tight">{m.label}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => !processing && !outOfStock && setPaymentType("cod")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${paymentType === "cod" ? "border-brand bg-brand/5" : "border-border hover:border-border/80 bg-background"} ${processing || outOfStock ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentType === "cod" ? "border-brand bg-brand" : "border-muted-foreground/40"}`}>
                        {paymentType === "cod" && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-brand" />
                        <span className="font-semibold text-foreground">Cash on Delivery</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Pay in cash when you receive your order</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-5 sm:p-6 border-t border-border bg-background shrink-0 space-y-3">
            <button
              onClick={handlePayment}
              disabled={!canProceed || processing}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-brand text-brand-foreground font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 hover:bg-brand/95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:bg-brand"
            >
              <Lock className="w-4 h-4" />
              <span className="text-base sm:text-lg">
                {processing
                  ? "Processing..."
                  : paymentType === "cod"
                  ? `Place Order - ${formatPrice(product.price)}`
                  : `Pay ${formatPrice(product.price)}`}
              </span>
            </button>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Your payment is secure and encrypted</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
