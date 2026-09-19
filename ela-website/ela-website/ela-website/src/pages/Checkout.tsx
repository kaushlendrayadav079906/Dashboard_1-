import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Smartphone, Shield } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

  const buyNowProduct = location.state?.buyNowProduct;
  const checkoutItems = buyNowProduct ? [buyNowProduct] : cartItems;

  const subtotal = buyNowProduct 
    ? buyNowProduct.price * buyNowProduct.quantity 
    : getCartTotal();
  const shipping = subtotal >= 1999 ? 0 : 99;
  const total = subtotal + shipping;

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to complete your order.");
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      // Track checkout_started
      await supabase.from("funnel_events").insert([{
        user_id: user.id,
        event_type: "checkout_started",
        metadata: { item_count: checkoutItems.length, total } as any,
      }]);

      if (paymentMethod === "cod") {
        // COD Flow
        const { data: codData, error: codError } = await supabase.functions.invoke(
          "create-cod-order",
          {
            body: {
              items: checkoutItems.map(item => ({ 
                id: item.id, 
                name: item.name,
                quantity: item.quantity, 
                price: item.price,
                size: item.size,
                itemCode: item.itemCode || null
              })),
              shipping_address: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                phone: formData.phone,
                email: formData.email,
              },
            },
          }
        );

        if (codError || codData?.error) {
          throw new Error(codData?.error || "Failed to create COD order");
        }

        await supabase.from("funnel_events").insert([{
          user_id: user.id,
          event_type: "order_placed",
          metadata: {
            order_id: codData.order_id,
            total,
            item_count: checkoutItems.length,
            payment_method: "cod",
          } as any,
        }]);

        if (!buyNowProduct) {
          clearCart();
        }

        toast.success("Order placed successfully via Cash on Delivery.");
        navigate(`/order-confirmation/${codData.order_id}`);
        setLoading(false);
        return;
      }

      // Create Razorpay order via edge function
      const { data: razorpayData, error: rzpError } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            items: checkoutItems.map(item => ({ id: item.id, quantity: item.quantity })),
            currency: "INR",
            receipt: `ela_${Date.now()}`,
            notes: {
              customer_name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
            },
          },
        }
      );

      if (rzpError || razorpayData?.error) {
        throw new Error(razorpayData?.error || "Failed to create payment order");
      }

      // Open Razorpay checkout
      const options = {
        key: razorpayData.key_id,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: "Ela by KOOL LIFESTYLE",
        description: `Order of ${checkoutItems.length} item(s)`,
        order_id: razorpayData.order_id,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        },
        theme: {
          color: "#d63384", // brand pink
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: true,
        },
        config: {
          display: {
            blocks: {
              upi_block: {
                name: "Pay using UPI (Google Pay, PhonePe, Paytm)",
                instruments: [
                  { method: "upi", flows: ["intent", "collect", "qr"], apps: ["google_pay", "phonepe", "paytm", "bhim"] },
                ],
              },
            },
            sequence: ["block.upi_block", "method.card", "method.netbanking", "method.wallet"],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              "verify-razorpay-payment",
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  items: checkoutItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size,
                    itemCode: item.item_code || null,
                  })),
                  shipping_address: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    phone: formData.phone,
                    email: formData.email,
                  },
                },
              }
            );

            if (verifyError || !verifyData?.verified) {
              toast.error("Payment verification failed. Please contact support.");
              setLoading(false);
              return;
            }

            // Track order_placed
            await supabase.from("funnel_events").insert([{
              user_id: user.id,
              event_type: "order_placed",
              metadata: {
                order_id: verifyData.order_id,
                total,
                item_count: checkoutItems.length,
                payment_id: response.razorpay_payment_id,
              } as any,
            }]);

            if (!buyNowProduct) {
              clearCart();
            }
            
            if (verifyData.duplicate) {
              toast.info("Payment already verified. Redirecting to your order.");
            } else {
              toast.success("Payment successful! Order confirmed.");
            }
            
            navigate(`/order-confirmation/${verifyData.order_id}`);
          } catch (err) {
            console.error("Order creation error:", err);
            toast.error("Payment received but order creation failed. Contact support.");
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info("Payment cancelled.");
          },
        },
      };

      if (!window.Razorpay) {
        toast.error("Payment gateway is loading. Please try again.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="heading-display">Checkout</h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                onSubmit={handleSubmit}
              >
                {/* Contact Info */}
                <div className="mb-10">
                  <h2 className="font-serif text-xl mb-6">Contact Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="text-sm font-medium mb-2 block">First Name</label>
                      <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="First name" />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="text-sm font-medium mb-2 block">Last Name</label>
                      <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Last name" />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium mb-2 block">Email</label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="text-sm font-medium mb-2 block">Phone</label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210" />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-10">
                  <h2 className="font-serif text-xl mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="address" className="text-sm font-medium mb-2 block">Address</label>
                      <Input id="address" name="address" value={formData.address} onChange={handleChange} required placeholder="Street address, apartment, etc." />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="city" className="text-sm font-medium mb-2 block">City</label>
                        <Input id="city" name="city" value={formData.city} onChange={handleChange} required placeholder="City" />
                      </div>
                      <div>
                        <label htmlFor="state" className="text-sm font-medium mb-2 block">State</label>
                        <Input id="state" name="state" value={formData.state} onChange={handleChange} required placeholder="State" />
                      </div>
                      <div>
                        <label htmlFor="pincode" className="text-sm font-medium mb-2 block">PIN Code</label>
                        <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} required placeholder="123456" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-10">
                  <h2 className="font-serif text-xl mb-6">Payment Method</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label 
                      className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === "razorpay" ? "border-brand bg-brand/5" : "border-border hover:bg-secondary"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="razorpay" 
                        className="sr-only" 
                        checked={paymentMethod === "razorpay"}
                        onChange={() => setPaymentMethod("razorpay")} 
                      />
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-foreground">Online Payment</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "razorpay" ? "border-brand" : "border-muted-foreground"}`}>
                          {paymentMethod === "razorpay" && <div className="w-2 h-2 rounded-full bg-brand" />}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">UPI, Cards, Net Banking, Wallets</span>
                    </label>

                    <label 
                      className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === "cod" ? "border-brand bg-brand/5" : "border-border hover:bg-secondary"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod" 
                        className="sr-only" 
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")} 
                      />
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-foreground">Cash on Delivery</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "cod" ? "border-brand" : "border-muted-foreground"}`}>
                          {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-brand" />}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">Pay when your order arrives</span>
                    </label>
                  </div>
                </div>

                {/* Payment Methods Info for Razorpay */}
                {paymentMethod === "razorpay" && (
                  <div className="bg-secondary p-6 mb-8 rounded-sm">
                    <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-brand" />
                      Secure Payment via Razorpay
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { icon: Smartphone, label: "UPI / GPay" },
                        { icon: CreditCard, label: "Cards" },
                        { icon: CreditCard, label: "Debit Cards" },
                        { icon: Smartphone, label: "Net Banking" },
                      ].map((method) => (
                        <div key={method.label} className="flex items-center gap-2 text-xs text-muted-foreground bg-background p-3 rounded-sm">
                          <method.icon className="w-4 h-4 text-brand flex-shrink-0" />
                          <span>{method.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full py-6">
                  {loading ? "Processing..." : paymentMethod === "razorpay" ? `Pay ${formatPrice(total)}` : `Place COD Order - ${formatPrice(total)}`}
                </Button>
              </motion.form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-secondary p-6 md:p-8 sticky top-28"
              >
                <h2 className="font-serif text-xl mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {checkoutItems.map((item: any) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4">
                      <div className="w-16 h-20 bg-background overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-muted-foreground text-xs">Size: {item.size} • Qty: {item.quantity}</p>
                        <p className="text-sm mt-1">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 text-sm border-t border-border pt-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? <span className="text-brand">Free</span> : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-base pt-3 border-t border-border">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
