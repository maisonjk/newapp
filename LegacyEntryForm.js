// /home/ubuntu/christian_journal_app/web_frontend/src/components/LegacyEntryForm.js
import React, { useState } from "react";
import axios from "axios";

function LegacyEntryForm({ onNewLegacyEntry }) {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [recipient, setRecipient] = useState("Future Generations");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!message.trim()) {
            setError("Message cannot be empty.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const response = await axios.post("/api/legacy_entries", {
                title: title || "Legacy Message", // Default title if empty
                message,
                recipient,
                // media: [] // Placeholder for future media uploads
            });
            console.log("Legacy entry created:", response.data);
            if (onNewLegacyEntry) {
                onNewLegacyEntry(response.data); // Notify parent component
            }
            // Clear form
            setTitle("");
            setMessage("");
            setRecipient("Future Generations");
        } catch (err) {
            console.error("Error creating legacy entry:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || "Failed to save legacy entry.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ border: "1px solid #eee", padding: "15px", marginTop: "20px" }}>
            <h3>Create New Legacy Message</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "10px" }}>
                    <label htmlFor="legacyTitle">Title (Optional):</label><br />
                    <input
                        type="text"
                        id="legacyTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: "95%" }}
                    />
                </div>
                 <div style={{ marginBottom: "10px" }}>
                    <label htmlFor="legacyRecipient">Recipient (Optional):</label><br />
                    <input
                        type="text"
                        id="legacyRecipient"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        style={{ width: "95%" }}
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label htmlFor="legacyMessage">Message:</label><br />
                    <textarea
                        id="legacyMessage"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={6}
                        style={{ width: "95%" }}
                    />
                </div>
                {/* Add media upload button here later */}
                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Legacy Message"}
                </button>
            </form>
        </div>
    );
}

export default LegacyEntryForm;

