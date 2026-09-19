import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, ShoppingCart, Users, TrendingUp, Package, ArrowRight,
  Eye, Truck, XCircle, CheckCircle, RefreshCw, Search, ChevronDown, ChevronUp, Download,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, products as allProducts } from "@/data/products";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface FunnelStep {
  label: string;
  event: string;
  count: number;
  color: string;
}

interface RecentOrder {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_email: string;
  user_id: string;
  shipping_address: any;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
  item_code: string | null;
}

interface CustomerProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
}

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([]);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }

    const checkAdmin = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!data) { navigate("/"); return; }
      setIsAdmin(true);
      await loadAllData();
      setLoading(false);
    };
    checkAdmin();
  }, [user, authLoading, navigate]);

  const loadAllData = useCallback(async () => {
    await Promise.all([loadFunnelData(), loadOrders(), loadCustomers(), loadStats()]);
  }, []);

  const loadFunnelData = async () => {
    const eventTypes = ["signup", "add_to_cart", "checkout_started", "order_placed"];
    const labels = ["Signups", "Add to Cart", "Checkout Started", "Orders Placed"];
    const steps: FunnelStep[] = [];
    for (let i = 0; i < eventTypes.length; i++) {
      const { count } = await supabase
        .from("funnel_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", eventTypes[i]);
      steps.push({ label: labels[i], event: eventTypes[i], count: count ?? 0, color: "" });
    }
    setFunnelSteps(steps);
  };

  const loadOrders = async () => {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("id, total_amount, status, created_at, user_id, shipping_address")
      .order("created_at", { ascending: false })
      .limit(100);

    if (ordersData && ordersData.length > 0) {
      const userIds = [...new Set(ordersData.map((o) => o.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, email").in("id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.id, p.email]) ?? []);
      setOrders(ordersData.map((o) => ({
        ...o,
        user_email: profileMap.get(o.user_id) ?? "Unknown",
        shipping_address: o.shipping_address,
      })));
    }
  };

  const loadCustomers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, email, full_name, created_at");
    if (!profiles) return;

    const { data: ordersData } = await supabase.from("orders").select("user_id, total_amount");

    const orderMap = new Map<string, { count: number; total: number }>();
    ordersData?.forEach((o) => {
      const existing = orderMap.get(o.user_id) || { count: 0, total: 0 };
      orderMap.set(o.user_id, { count: existing.count + 1, total: existing.total + Number(o.total_amount) });
    });

    setCustomers(profiles.map((p) => ({
      ...p,
      order_count: orderMap.get(p.id)?.count ?? 0,
      total_spent: orderMap.get(p.id)?.total ?? 0,
    })));
  };

  const loadStats = async () => {
    const { data: revData } = await supabase.from("orders").select("total_amount").eq("status", "confirmed");
    setTotalRevenue(revData?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0);
    const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    setTotalUsers(count ?? 0);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) {
      toast.error("Failed to update order status");
      return;
    }
    toast.success(`Order status updated to ${newStatus}`);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
  };

  const viewOrderDetails = async (order: RecentOrder) => {
    setSelectedOrder(order);
    const { data } = await supabase.from("order_items").select("*").eq("order_id", order.id);
    setOrderItems(data ?? []);
    setOrderDialogOpen(true);
  };

  const exportOrdersCSV = async () => {
    const ordersToExport = filteredOrders;
    if (ordersToExport.length === 0) {
      toast.error("No orders to export");
      return;
    }
    const orderIds = ordersToExport.map((o) => o.id);
    const { data: itemsData } = await supabase
      .from("order_items")
      .select("order_id, product_name, item_code, size, quantity, price")
      .in("order_id", orderIds);
    const itemsByOrder = new Map<string, any[]>();
    itemsData?.forEach((it) => {
      const arr = itemsByOrder.get(it.order_id) ?? [];
      arr.push(it);
      itemsByOrder.set(it.order_id, arr);
    });

    const headers = [
      "Order ID", "Date", "Customer Email", "Status", "Total (INR)",
      "Item Name", "Item Code", "Size", "Quantity", "Unit Price (INR)",
      "Shipping Name", "Phone", "Address", "City", "State", "Pincode", "Razorpay Payment ID",
    ];
    const rows: string[][] = [];
    ordersToExport.forEach((o) => {
      const addr = o.shipping_address || {};
      const items = itemsByOrder.get(o.id) ?? [{}];
      items.forEach((it: any) => {
        rows.push([
          o.id, new Date(o.created_at).toLocaleString("en-IN"), o.user_email, o.status,
          String(o.total_amount), it.product_name ?? "", it.item_code ?? "", it.size ?? "",
          String(it.quantity ?? ""), String(it.price ?? ""),
          `${addr.firstName ?? ""} ${addr.lastName ?? ""}`.trim(),
          addr.phone ?? "", addr.address ?? "", addr.city ?? "", addr.state ?? "",
          addr.pincode ?? "", addr.razorpay_payment_id ?? "",
        ]);
      });
    });
    const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ela-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${ordersToExport.length} orders`);
  };

  const filteredOrders = orders.filter((o) =>
    searchQuery === "" ||
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter((c) =>
    customerSearch === "" ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.full_name && c.full_name.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) return null;

  const maxCount = Math.max(...funnelSteps.map((s) => s.count), 1);

  return (
    <Layout>
      <section className="bg-secondary py-12 md:py-16">
        <div className="container-wide">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="heading-display">Admin Dashboard</h1>
            <p className="text-body mt-2">Manage orders, products, customers & analytics</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Users, label: "Total Users", value: totalUsers.toString() },
              { icon: ShoppingCart, label: "Cart Adds", value: funnelSteps.find((s) => s.event === "add_to_cart")?.count.toString() ?? "0" },
              { icon: Package, label: "Orders", value: funnelSteps.find((s) => s.event === "order_placed")?.count.toString() ?? "0" },
              { icon: TrendingUp, label: "Revenue", value: formatPrice(totalRevenue) },
            ].map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border p-5 rounded-sm">
                <kpi.icon className="w-5 h-5 text-muted-foreground mb-3" />
                <p className="text-2xl font-semibold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="funnel">Funnel</TabsTrigger>
            </TabsList>

            {/* ========== ORDERS TAB ========== */}
            <TabsContent value="orders">
              <div className="bg-card border border-border p-6 rounded-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="font-serif text-xl">All Orders ({orders.length})</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={exportOrdersCSV}>
                      <Download className="w-4 h-4 mr-1" /> Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { loadOrders(); toast.success("Refreshed"); }}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No orders found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 font-medium text-muted-foreground">Order ID</th>
                          <th className="text-left py-3 font-medium text-muted-foreground">Customer</th>
                          <th className="text-left py-3 font-medium text-muted-foreground">Amount</th>
                          <th className="text-left py-3 font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/50">
                            <td className="py-3 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                            <td className="py-3">{order.user_email}</td>
                            <td className="py-3 font-medium">{formatPrice(order.total_amount)}</td>
                            <td className="py-3">
                              <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                                <SelectTrigger className="w-32 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[s] || "bg-secondary text-muted-foreground"}`}>{s}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-IN")}</td>
                            <td className="py-3">
                              <Button variant="ghost" size="sm" onClick={() => viewOrderDetails(order)}>
                                <Eye className="w-4 h-4 mr-1" /> View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ========== PRODUCTS TAB ========== */}
            <TabsContent value="products">
              <div className="bg-card border border-border p-6 rounded-sm">
                <h2 className="font-serif text-xl mb-6">Product Catalog ({allProducts.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 font-medium text-muted-foreground">Product</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Category</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Price</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Sizes</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Colors</th>
                        <th className="text-left py-3 font-medium text-muted-foreground">Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProducts.map((product) => (
                        <tr key={product.id} className="border-b border-border/50 hover:bg-secondary/50">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img src={product.image} alt={product.name} className="w-10 h-12 object-cover rounded-sm" />
                              <span className="font-medium text-sm max-w-[200px] truncate">{product.name}</span>
                            </div>
                          </td>
                          <td className="py-3 capitalize">{product.category}</td>
                          <td className="py-3 font-medium">
                            {formatPrice(product.price)}
                            {product.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through ml-1">{formatPrice(product.originalPrice)}</span>
                            )}
                          </td>
                          <td className="py-3 text-xs text-muted-foreground max-w-[150px] truncate">{product.sizes.join(", ")}</td>
                          <td className="py-3 text-xs text-muted-foreground max-w-[120px] truncate">{product.colors.join(", ")}</td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              {product.isBestseller && <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand">Bestseller</span>}
                              {product.isNew && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">New</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* ========== CUSTOMERS TAB ========== */}
            <TabsContent value="customers">
              <div className="bg-card border border-border p-6 rounded-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="font-serif text-xl">Customers ({customers.length})</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>

                {filteredCustomers.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No customers found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 font-medium text-muted-foreground">Email</th>
                          <th className="text-left py-3 font-medium text-muted-foreground">Name</th>
                          <th className="text-left py-3 font-medium text-muted-foreground">Orders</th>
                          <th className="text-left py-3 font-medium text-muted-foreground">Total Spent</th>
                          <th className="text-left py-3 font-medium text-muted-foreground">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map((customer) => (
                          <tr key={customer.id} className="border-b border-border/50 hover:bg-secondary/50">
                            <td className="py-3">{customer.email}</td>
                            <td className="py-3">{customer.full_name || "—"}</td>
                            <td className="py-3 font-medium">{customer.order_count}</td>
                            <td className="py-3 font-medium">{formatPrice(customer.total_spent)}</td>
                            <td className="py-3 text-muted-foreground">{new Date(customer.created_at).toLocaleDateString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ========== FUNNEL TAB ========== */}
            <TabsContent value="funnel">
              <div className="bg-card border border-border p-6 md:p-8 rounded-sm">
                <div className="flex items-center gap-2 mb-8">
                  <BarChart3 className="w-5 h-5 text-brand" />
                  <h2 className="font-serif text-xl">Conversion Funnel</h2>
                </div>
                <div className="space-y-6">
                  {funnelSteps.map((step, i) => {
                    const width = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
                    const conversionRate = i > 0 && funnelSteps[i - 1].count > 0
                      ? ((step.count / funnelSteps[i - 1].count) * 100).toFixed(1) : null;
                    return (
                      <div key={step.event}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{step.label}</span>
                            {conversionRate && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <ArrowRight className="w-3 h-3" />{conversionRate}% from prev
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-semibold">{step.count}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-8 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(width, 2)}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + i * 0.15 }}
                            className="h-full rounded-full bg-brand/80"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {funnelSteps[0]?.count > 0 && funnelSteps[3]?.count > 0 && (
                  <div className="mt-8 pt-6 border-t border-border text-center">
                    <p className="text-sm text-muted-foreground">Overall Conversion Rate</p>
                    <p className="text-3xl font-semibold mt-1">
                      {((funnelSteps[3].count / funnelSteps[0].count) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Signup → Order</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Order Detail Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order ID</p>
                  <p className="font-mono text-xs">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{new Date(selectedOrder.created_at).toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p>{selectedOrder.user_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-semibold">{formatPrice(selectedOrder.total_amount)}</p>
                </div>
              </div>

              {selectedOrder.shipping_address && (
                <div className="bg-secondary p-4 rounded-sm text-sm">
                  <p className="font-medium mb-2">Shipping Address</p>
                  <p>{selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}</p>
                  <p>{selectedOrder.shipping_address.address}</p>
                  <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}</p>
                  <p>Phone: {selectedOrder.shipping_address.phone}</p>
                  {selectedOrder.shipping_address.razorpay_payment_id && (
                    <p className="mt-2 text-xs text-muted-foreground">Payment ID: {selectedOrder.shipping_address.razorpay_payment_id}</p>
                  )}
                </div>
              )}

              <div>
                <p className="font-medium text-sm mb-2">Items</p>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm bg-secondary p-3 rounded-sm">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.size && `Size: ${item.size}`} • Qty: {item.quantity}
                          {item.item_code && <span className="ml-2 font-mono text-[10px] text-muted-foreground/70">({item.item_code})</span>}
                        </p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Update Status:</span>
                <Select value={selectedOrder.status} onValueChange={(v) => updateOrderStatus(selectedOrder.id, v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Admin;
