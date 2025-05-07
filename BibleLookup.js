// /home/ubuntu/christian_journal_app/web_frontend/src/components/BibleLookup.js
import React, { useState } from "react";
import axios from "axios";

function BibleLookup() {
    const [reference, setReference] = useState("John 3:16");
    const [translation, setTranslation] = useState("web"); // Default to World English Bible
    const [scripture, setScripture] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLookup = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setScripture(null);
        try {
            // Encode the reference to handle spaces and special characters in URL path
            const encodedReference = encodeURIComponent(reference);
            const response = await axios.get(`/api/bible/${encodedReference}?translation=${translation}`);
            setScripture(response.data);
        } catch (err) {
            console.error("Error fetching scripture:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || "Failed to fetch scripture. Please check the reference and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ border: "1px solid #eee", padding: "15px", marginTop: "20px" }}>
            <h3>Bible Lookup</h3>
            <form onSubmit={handleLookup}>
                <div style={{ marginBottom: "10px" }}>
                    <label htmlFor="reference">Reference (e.g., John 3:16, Romans 12:1-2):</label><br />
                    <input
                        type="text"
                        id="reference"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        required
                        style={{ width: "70%", marginRight: "10px" }}
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label htmlFor="translation">Translation:</label><br />
                    <select 
                        id="translation" 
                        value={translation} 
                        onChange={(e) => setTranslation(e.target.value)}
                        style={{ marginRight: "10px" }}
                    >
                        <option value="web">WEB (World English Bible)</option>
                        <option value="kjv">KJV (King James Version)</option>
                        <option value="bbe">BBE (Bible in Basic English)</option>
                        {/* Add other translations supported by bible-api.com if needed */}
                    </select>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Looking up..." : "Lookup Scripture"}
                </button>
            </form>

            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

            {scripture && (
                <div style={{ marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                    <h4>{scripture.reference} ({scripture.translation_name})</h4>
                    {scripture.verses.map((verse) => (
                        <p key={verse.verse}>
                            <strong>{verse.book_name} {verse.chapter}:{verse.verse}</strong> {verse.text}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BibleLookup;

