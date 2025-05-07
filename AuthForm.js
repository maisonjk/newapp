// /home/ubuntu/christian_journal_app/web_frontend/src/components/AuthForm.js
import React, { useState } from "react";
import axios from "axios";

// Simple reusable form for Login and Register
function AuthForm({ endpoint, buttonText, onSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            // Assuming backend is running on localhost:5000
            // Need to configure proxy in package.json or use full URL
            const response = await axios.post(`/api${endpoint}`, { username, password });
            console.log("Auth success:", response.data);
            if (onSuccess) {
                onSuccess(response.data); // Pass user data up
            }
        } catch (err) {
            console.error("Auth error:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", maxWidth: "300px", margin: "auto" }}>
            <h2>{buttonText}</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <label htmlFor="username">Username:</label>
            <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ marginBottom: "10px" }}
            />
            <label htmlFor="password">Password:</label>
            <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ marginBottom: "10px" }}
            />
            <button type="submit" disabled={loading}>
                {loading ? "Processing..." : buttonText}
            </button>
        </form>
    );
}

export default AuthForm;

