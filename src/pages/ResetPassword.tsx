import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ width: "100%", maxWidth: "420px", background: "rgba(30, 41, 59, 0.95)", backdropFilter: "blur(10px)", borderRadius: "24px", padding: "2.5rem", textAlign: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}
        >
          <AlertTriangle size={64} color="#ef4444" style={{ margin: "0 auto 1.5rem" }} />
          <h2 style={{ color: "#f1f5f9", marginBottom: "1rem" }}>Invalid Link</h2>
          <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>This password reset link is invalid or has expired.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            style={{ width: "100%", padding: "0.9rem", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white", border: "none", borderRadius: "14px", fontWeight: 600, cursor: "pointer" }}
          >
            Request New Link
          </button>
        </motion.div>
      </div>
    );
  }

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
            {isSuccess ? "Password Reset!" : "Set New Password"}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            {isSuccess ? "You can now login with your new password." : "Enter your new password below."}
          </p>
        </div>

        {isSuccess ? (
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
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", marginBottom: "0.5rem" }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  style={{
                    width: "100%", padding: "0.875rem 3rem 0.875rem 3rem",
                    background: "#1e293b", border: "2px solid #334155", borderRadius: "14px",
                    fontSize: "0.95rem", color: "#e2e8f0", outline: "none", fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "0.25rem", display: "flex" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", marginBottom: "0.5rem" }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  style={{
                    width: "100%", padding: "0.875rem 3rem 0.875rem 3rem",
                    background: "#1e293b", border: "2px solid #334155", borderRadius: "14px",
                    fontSize: "0.95rem", color: "#e2e8f0", outline: "none", fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "0.25rem", display: "flex" }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Resetting...</> : "Reset Password"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
