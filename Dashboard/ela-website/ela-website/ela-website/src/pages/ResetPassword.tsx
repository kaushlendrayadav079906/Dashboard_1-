import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Sparkles, Lock } from "lucide-react";
import Layout from "@/components/layout/Layout";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a recovery token in the URL hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      // No recovery token, redirect
      toast({ title: "Invalid link", description: "This password reset link is invalid or expired.", variant: "destructive" });
      navigate("/auth");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      setSuccess(true);
      toast({ title: "Password updated!", description: "Your password has been reset successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh] flex items-center">
        <div className="container-narrow">
          <div className="max-w-md mx-auto">
            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-brand" />
                </div>
                <h1 className="heading-section mb-4">Password Updated!</h1>
                <p className="text-body mb-8">Your password has been successfully reset. You can now sign in with your new password.</p>
                <Button onClick={() => navigate("/auth")} size="lg">Sign In</Button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-brand" />
                  </div>
                  <h1 className="heading-section mb-2">Set New Password</h1>
                  <p className="text-body">Enter your new password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs tracking-[0.15em] uppercase text-muted-foreground">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-12 border-border/60 bg-transparent focus:border-brand rounded-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-12 border-border/60 bg-transparent focus:border-brand rounded-none text-sm"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 rounded-none tracking-[0.15em] uppercase text-xs font-medium group">
                    {loading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Sparkles size={18} />
                      </motion.div>
                    ) : (
                      <>
                        Update Password
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ResetPassword;
