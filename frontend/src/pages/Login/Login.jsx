import React, { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const endpoint = isRegistering 
      ? "http://localhost:3000/auth/register" 
      : "http://localhost:3000/auth/login";
      
    const payload = isRegistering 
      ? { name, email, password } 
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Authentication failed");
      }

      if (isRegistering) {
        alert("Registration successful! Please log in.");
        setIsRegistering(false);
        setName("");
        setPassword("");
      } else {
        // Save token and user info to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0b0f19' }}>
      <div style={{ background: '#111827', padding: '32px', borderRadius: '12px', border: '1px solid #1f2937', width: '100%', maxWidth: '400px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
        <h2 style={{ color: '#fff', marginBottom: '24px', textAlign: 'center', fontSize: '24px', fontWeight: '700' }}>
          {isRegistering ? "Create Account" : "Warehouse Login"}
        </h2>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegistering && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={isRegistering}
              style={{ padding: '12px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', outline: 'none' }}
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '12px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', outline: 'none' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', outline: 'none' }}
          />

          <button
            type="submit"
            disabled={isLoading}
            style={{ 
              padding: '12px', 
              background: '#2563eb', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: '600', 
              cursor: isLoading ? 'not-allowed' : 'pointer', 
              opacity: isLoading ? 0.7 : 1,
              transition: 'background 0.2s'
            }}
          >
            {isLoading ? "Processing..." : (isRegistering ? "Register" : "Login")}
          </button>
        </form>

        <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          {isRegistering ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(""); setName(""); }}
            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            {isRegistering ? "Login here" : "Register here"}
          </button>
        </p>
      </div>
    </div>
  );
}