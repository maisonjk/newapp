// /home/ubuntu/christian_journal_app/web_frontend/src/App.js
import React, { useState, useEffect, useCallback } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Link,
    useLocation // Import useLocation for conditional rendering
} from "react-router-dom";
import axios from "axios";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JournalList from "./components/JournalList";
import JournalEntryForm from "./components/JournalEntryForm";
import BibleLookup from "./components/BibleLookup";
import LegacyEntryForm from "./components/LegacyEntryForm"; // Import Legacy form
import LegacyList from "./components/LegacyList"; // Import Legacy list

// Simple Navigation component for the Dashboard
function DashboardNav() {
    return (
        <nav style={{ padding: "10px 0", borderBottom: "1px solid #eee", marginBottom: "20px" }}>
            <Link to="/dashboard" style={{ marginRight: "15px" }}>Journal</Link>
            <Link to="/dashboard/bible" style={{ marginRight: "15px" }}>Bible Lookup</Link>
            <Link to="/dashboard/legacy" style={{ marginRight: "15px" }}>Legacy</Link>
            {/* Add links for Prayer, Testimony, Psalms later */}
        </nav>
    );
}

// Main Dashboard component rendering different sections based on route
function Dashboard({ user, onLogout }) {
    const [refreshJournalKey, setRefreshJournalKey] = useState(0);
    const [refreshLegacyKey, setRefreshLegacyKey] = useState(0);
    const location = useLocation(); // Get current path

    const handleNewJournalEntry = () => {
        setRefreshJournalKey(prevKey => prevKey + 1);
    };
    const handleNewLegacyEntry = () => {
        setRefreshLegacyKey(prevKey => prevKey + 1);
    };

    // Determine which section to show based on the path
    const showJournal = location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    const showBible = location.pathname === "/dashboard/bible";
    const showLegacy = location.pathname === "/dashboard/legacy";

    return (
        <div>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: "1px solid #ccc" }}>
                <h2>Walk With God</h2>
                <div>
                    <span>Welcome, {user.username}!</span>
                    <button onClick={onLogout} style={{ marginLeft: "10px" }}>Logout</button>
                </div>
            </header>
            <DashboardNav />
            <main style={{ padding: "0 20px 20px 20px" }}>
                {showJournal && (
                    <>
                        <JournalEntryForm onNewEntry={handleNewJournalEntry} />
                        <JournalList key={refreshJournalKey} />
                    </>
                )}
                {showBible && <BibleLookup />}
                {showLegacy && (
                    <>
                        <LegacyEntryForm onNewLegacyEntry={handleNewLegacyEntry} />
                        <LegacyList key={refreshLegacyKey} />
                    </>
                )}
                {/* Add conditional rendering for Prayer, Testimony, Psalms sections later */}
            </main>
        </div>
    );
}

// Placeholder for a simple Home/Landing page
function HomePage() {
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Welcome to Walk With God</h1>
            <p>Your personal Christian Digital Journal.</p>
            <nav>
                <Link to="/login" style={{ marginRight: "10px" }}>Login</Link>
                <Link to="/register">Register</Link>
            </nav>
        </div>
    );
}

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // Check auth status on load

    const checkLoggedIn = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/check_auth", { withCredentials: true });
            if (response.data && response.data.logged_in) {
                setCurrentUser(response.data);
            }
        } catch (error) {
            console.log("Not logged in or error checking auth:", error.response ? error.response.data : error.message);
            setCurrentUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkLoggedIn();
    }, [checkLoggedIn]);

    const handleLoginSuccess = (userData) => {
        setCurrentUser(userData);
    };

    const handleLogout = async () => {
        try {
            await axios.post("/api/logout", {}, { withCredentials: true });
            setCurrentUser(null);
        } catch (error) {
            console.error("Logout failed:", error.response ? error.response.data : error.message);
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Show loading indicator while checking auth
    }

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <HomePage />} />
                    <Route
                        path="/login"
                        element={currentUser ? <Navigate to="/dashboard" /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
                    />
                    <Route
                        path="/register"
                        element={currentUser ? <Navigate to="/dashboard" /> : <RegisterPage onLoginSuccess={handleLoginSuccess} />}
                    />
                    {/* Updated Dashboard route to handle sub-paths */}
                    <Route
                        path="/dashboard/*" // Use wildcard to match sub-paths
                        element={currentUser ? <Dashboard user={currentUser} onLogout={handleLogout} /> : <Navigate to="/login" />}
                    />
                    {/* Redirect base /dashboard to /dashboard/ */}
                    <Route path="/dashboard" element={<Navigate to="/dashboard/" />} /> 
                    
                    {/* Catch-all route */}
                    <Route path="*" element={<Navigate to={currentUser ? "/dashboard/" : "/"} />} /> 
                </Routes>
            </div>
        </Router>
    );
}

export default App;

