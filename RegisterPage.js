// /home/ubuntu/christian_journal_app/web_frontend/src/pages/RegisterPage.js
import React from "react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";

function RegisterPage({ onLoginSuccess }) {
    const navigate = useNavigate();

    const handleRegisterSuccess = (userData) => {
        console.log("Registration successful, user logged in:", userData);
        if (onLoginSuccess) {
            onLoginSuccess(userData); // Update app state
        }
        navigate("/dashboard"); // Redirect to dashboard after successful registration/login
    };

    return (
        <div>
            <AuthForm
                endpoint="/register"
                buttonText="Register"
                onSuccess={handleRegisterSuccess}
            />
            <p style={{ textAlign: "center", marginTop: "10px" }}>
                Already have an account? <a href="/login">Login here</a>
            </p>
        </div>
    );
}

export default RegisterPage;

