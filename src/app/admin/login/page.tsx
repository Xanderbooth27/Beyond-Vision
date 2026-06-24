"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AmbientBackground from "@/components/AmbientBackground";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

const DEV_ADMIN_EMAIL = "admin@beyondvision.local";
const DEV_ADMIN_PASSWORD = "beyondvision-admin";

export default function AdminLoginPage() {
    const [email, setEmail] = useState(process.env.NODE_ENV === "development" ? DEV_ADMIN_EMAIL : "");
    const [password, setPassword] = useState(process.env.NODE_ENV === "development" ? DEV_ADMIN_PASSWORD : "");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
            });

            if (response.ok) {
                router.push("/admin");
                router.refresh();
                return;
            }

            const payload = (await response.json().catch(() => null)) as { error?: string } | null;
            setError(payload?.error === "Invalid credentials"
                ? "Invalid email or password."
                : "Could not sign in. Check your credentials and try again.");
        } catch (err: unknown) {
            console.error("Login error:", err);
            setError("Could not reach the login service. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <AmbientBackground />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={{
                    width: "100%",
                    maxWidth: "450px",
                    padding: "4rem",
                    borderRadius: "40px",
                    position: "relative",
                    zIndex: 10,
                    textAlign: "center"
                }}
            >
                <div style={{ 
                    width: "80px", 
                    height: "80px", 
                    background: "rgba(255, 246, 117, 0.1)", 
                    borderRadius: "24px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    margin: "0 auto 3rem",
                    border: "1px solid var(--accent)"
                }}>
                    <Lock size={32} color="var(--accent)" />
                </div>

                <h1 style={{ fontSize: "2.5rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "1rem" }}>Systems Access</h1>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", marginBottom: process.env.NODE_ENV === "development" ? "1rem" : "4rem" }}>BEYOND_VISION_INTERNAL_PROTOCOL_v4.0</p>
                {process.env.NODE_ENV === "development" && (
                    <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.72rem", marginBottom: "2.5rem", lineHeight: 1.45 }}>
                        Dev login: <strong style={{ color: "rgba(255,255,255,0.45)" }}>{DEV_ADMIN_EMAIL}</strong> / <strong style={{ color: "rgba(255,255,255,0.45)" }}>{DEV_ADMIN_PASSWORD}</strong>
                        <br />
                        Override with ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET in <code style={{ fontSize: "0.68rem" }}>.env.local</code>
                    </p>
                )}

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ position: "relative" }}>
                        <Mail size={18} style={{ position: "absolute", left: "1.5rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
                        <input 
                            type="email" 
                            placeholder="admin@beyondvision.local"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="username"
                            required
                            style={inputStyle}
                        />
                    </div>
                    
                    <div style={{ position: "relative" }}>
                        <ShieldCheck size={18} style={{ position: "absolute", left: "1.5rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
                        <input 
                            type="password" 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            style={inputStyle}
                        />
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ color: "#ff4757", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.button
                        type="submit"
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        disabled={loading}
                        style={{
                            background: "var(--accent)",
                            color: "#000",
                            padding: "1.5rem",
                            borderRadius: "16px",
                            border: "none",
                            fontWeight: 900,
                            fontSize: "0.9rem",
                            textTransform: "uppercase",
                            cursor: loading ? "wait" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "1rem",
                            marginTop: "2rem"
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <>AUTHENTICATE <ArrowRight size={18} /></>}
                    </motion.button>
                </form>

                <div style={{ marginTop: "4rem", fontSize: "0.6rem", color: "rgba(255,255,255,0.15)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "2px" }}>
                    © 2026 BEYOND VISION PERFORMANCE LTD. ALL LOGINS ARE MONITORED.
                </div>
            </motion.div>

            <style>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </motion.div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "1.2rem 1.2rem 1.2rem 4rem",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    color: "#fff",
    outline: "none",
    fontSize: "0.85rem",
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "text" as const,
};
