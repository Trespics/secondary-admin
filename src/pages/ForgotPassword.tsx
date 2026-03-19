import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { ShieldCheck, Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { 
        email,
        clientUrl: window.location.origin
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send reset link. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%", maxWidth: "420px", background: "rgba(30, 41, 59, 0.95)",
          backdropFilter: "blur(10px)", borderRadius: "24px", padding: "2.5rem",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "64px", height: "64px", margin: "0 auto 1.25rem",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 10px 25px rgba(59,130,246,0.3)"
          }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.5rem" }}>
            {isSubmitted ? "Check Your Email" : "Reset Password"}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            {isSubmitted 
              ? `If an account with ${email} exists, we've sent a reset link.` 
              : "Enter your email to receive a password reset link."}
          </p>
        </div>

        {isSubmitted ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "center", margin: "1rem 0" }}>
              <CheckCircle size={64} color="#10b981" />
            </div>
            <button
              onClick={() => navigate("/login")}
              style={{
                width: "100%", padding: "0.9rem",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                color: "white", border: "none", borderRadius: "14px",
                fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
                boxShadow: "0 4px 15px rgba(59,130,246,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", marginBottom: "0.5rem" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.com"
                  style={{
                    width: "100%", padding: "0.875rem 1rem 0.875rem 3rem",
                    background: "#1e293b", border: "2px solid #334155", borderRadius: "14px",
                    fontSize: "0.95rem", color: "#e2e8f0", outline: "none", fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{
                padding: "0.875rem 1rem", background: "rgba(239,68,68,0.1)", color: "#ef4444",
                borderRadius: "12px", fontSize: "0.85rem", border: "1px solid rgba(239,68,68,0.2)",
                display: "flex", alignItems: "center", gap: "0.5rem"
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%", padding: "0.9rem",
                background: isLoading ? "#475569" : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                color: "white", border: "none", borderRadius: "14px",
                fontSize: "0.95rem", fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 15px rgba(59,130,246,0.3)", marginTop: "0.5rem",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              }}
            >
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                width: "100%", padding: "0.9rem", background: "transparent",
                color: "#94a3b8", border: "none", fontSize: "0.9rem", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
              }}
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
