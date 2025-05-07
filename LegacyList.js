// /home/ubuntu/christian_journal_app/web_frontend/src/components/LegacyList.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function LegacyList() {
    const [legacyEntries, setLegacyEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchLegacyEntries = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await axios.get("/api/legacy_entries");
                setLegacyEntries(response.data);
            } catch (err) {
                console.error("Error fetching legacy entries:", err.response ? err.response.data : err.message);
                setError("Failed to load legacy messages.");
            } finally {
                setLoading(false);
            }
        };

        fetchLegacyEntries();
    }, []); // Fetch entries on component mount

    if (loading) {
        return <p>Loading legacy messages...</p>;
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    return (
        <div style={{ marginTop: "20px" }}>
            <h3>My Legacy Messages</h3>
            {legacyEntries.length === 0 ? (
                <p>No legacy messages saved yet.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {legacyEntries.map((entry) => (
                        <li key={entry.id} style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "10px" }}>
                            <h4>{entry.title}</h4>
                            <p>For: {entry.recipient}</p>
                            <p>Saved: {new Date(entry.timestamp).toLocaleString()}</p>
                            <p>{entry.message}</p>
                            {/* Add view/edit/delete options later */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default LegacyList;

