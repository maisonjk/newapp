// /home/ubuntu/christian_journal_app/web_frontend/src/pages/LoginPage.js
import React from "react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";

function LoginPage({ onLoginSuccess }) {
    const navigate = useNavigate();

    const handleLoginSuccess = (userData) => {
        console.log("Login successful:", userData);
        if (onLoginSuccess) {
            onLoginSuccess(userData); // Update app state
        }
        navigate("/dashboard"); // Redirect to dashboard after successful login
    };

    return (
        <div>
            <AuthForm
                endpoint="/login"
                buttonText="Login"
                onSuccess={handleLoginSuccess}
            />
            <p style={{ textAlign: "center", marginTop: "10px" }}>
                Don't have an account? <a href="/register">Register here</a>
            </p>
        </div>
    );
}

export default LoginPage;

