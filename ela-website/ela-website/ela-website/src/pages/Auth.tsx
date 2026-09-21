import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowRight, Sparkles, Tag, Gift, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import authBg from "@/assets/banner-5.jpg";
import elaLogo from "@/assets/ela-logo.jpg";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        await resetPassword(email);
        setResetSent(true);
        toast({ title: "Reset request received", description: "Password reset is handled by the FastAPI backend; contact support if needed." });
      } else if (mode === "login") {
        await signIn(email, password);
        toast({ title: "Welcome back!", description: "You've signed in successfully." });
        navigate("/");
      } else {
        await signUp(email, password);
        toast({
          title: "Account created!",
          description: "Your account is ready to use with the FastAPI backend.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      toast({ title: "Google sign-in unavailable", description: "The app uses FastAPI credentials instead of Supabase OAuth.", variant: "destructive" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Google sign-in failed", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={authBg} alt="Ela collection" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/30 to-transparent" />

        <motion.div className="absolute top-20 left-16 w-24 h-24 border border-brand/20 rounded-full" animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-32 right-20 w-16 h-16 border border-brand/15 rotate-45" animate={{ rotate: [45, 90, 45] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-1/3 right-12 w-3 h-3 bg-brand/20 rounded-full" animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />

        <div className="relative z-10 flex flex-col justify-end p-16 text-primary-foreground">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <p className="text-sm tracking-[0.3em] uppercase mb-4 opacity-80">Ela by KOOL LIFESTYLE</p>
            <h2 className="font-serif text-4xl xl:text-5xl font-medium leading-tight mb-4">
              Embrace Your<br /><span className="italic">Elegance</span>
            </h2>
            <p className="text-base opacity-70 max-w-sm leading-relaxed mb-8">Discover premium lingerie crafted with the finest fabrics for the modern woman.</p>
            <div className="space-y-3">
              <motion.div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-sm px-4 py-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <Tag size={14} className="text-brand shrink-0" />
                <span className="text-sm"><strong>Ela</strong> — Flat 20% off on all loungerie</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-background relative">
        <motion.div className="absolute top-12 right-12 w-2 h-2 bg-brand/10 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-16 left-8 w-1.5 h-1.5 bg-brand/15 rounded-full" animate={{ y: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />

        <div className="w-full max-w-md">
          {/* Sign-up offer banner */}
          {mode !== "forgot" && (
            <motion.div className="mb-8 bg-accent/50 border border-brand/15 rounded-sm p-4 flex items-start gap-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Gift size={20} className="text-brand shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Sign up & get 10% off your first order!</p>
                <p className="text-xs text-muted-foreground mt-1">Use code <span className="font-semibold tracking-wider text-brand">WELCOME10</span> at checkout</p>
              </div>
            </motion.div>
          )}

          {/* Logo */}
          <motion.div className="flex justify-center mb-10" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <img src={elaLogo} alt="Ela" className="h-24 object-contain" />
          </motion.div>

          {/* Mode Toggle / Back button */}
          {mode === "forgot" ? (
            <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button onClick={() => { setMode("login"); setResetSent(false); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                <ArrowLeft size={16} /> Back to Sign In
              </button>
              <h2 className="font-serif text-2xl">Reset Password</h2>
              <p className="text-sm text-muted-foreground mt-2">Enter your email and we'll send you a reset link.</p>
            </motion.div>
          ) : (
            <motion.div className="flex justify-center gap-8 mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <button
                onClick={() => setMode("login")}
                className={`text-sm tracking-[0.2em] uppercase pb-2 border-b-2 transition-all duration-300 ${mode === "login" ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`text-sm tracking-[0.2em] uppercase pb-2 border-b-2 transition-all duration-300 ${mode === "signup" ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Create Account
              </button>
            </motion.div>
          )}

          {/* Form */}
          {resetSent && mode === "forgot" ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-brand" />
              </div>
              <h3 className="font-serif text-xl mb-2">Check your email</h3>
              <p className="text-sm text-muted-foreground">We've sent a password reset link to <strong className="text-foreground">{email}</strong></p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="h-12 border-border/60 bg-transparent focus:border-brand rounded-none text-sm"
                  />
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="h-12 border-border/60 bg-transparent focus:border-brand rounded-none text-sm pr-12"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {mode === "login" && (
                      <button type="button" onClick={() => setMode("forgot")} className="text-xs text-brand hover:text-brand/80 transition-colors">
                        Forgot password?
                      </button>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 tracking-[0.15em] uppercase text-xs font-medium group"
                >
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Sparkles size={18} />
                    </motion.div>
                  ) : (
                    <>
                      {mode === "forgot" ? "Send Reset Link" : mode === "login" ? "Sign In" : "Create Account"}
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.form>
            </AnimatePresence>
          )}

          {/* Divider & Google - only on login/signup */}
          {mode !== "forgot" && (
            <>
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-border/60" />
                <span className="text-xs text-muted-foreground tracking-wider uppercase">or</span>
                <div className="flex-1 h-px bg-border/60" />
              </div>

              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full h-12 rounded-none border-border/60 tracking-[0.1em] text-sm flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {googleLoading ? "Signing in..." : "Continue with Google"}
              </Button>
            </>
          )}

          {/* Footer text */}
          <p className="text-center text-xs text-muted-foreground mt-8 leading-relaxed">
            By signing in, you agree to our{" "}
            <a href="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
