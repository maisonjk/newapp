// /home/ubuntu/christian_journal_app/web_frontend/src/components/JournalList.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function JournalList() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEntries = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await axios.get("/api/entries");
                setEntries(response.data);
            } catch (err) {
                console.error("Error fetching entries:", err.response ? err.response.data : err.message);
                setError("Failed to load journal entries.");
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, []); // Fetch entries on component mount

    if (loading) {
        return <p>Loading entries...</p>;
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    return (
        <div>
            <h3>My Journal Entries</h3>
            {entries.length === 0 ? (
                <p>No entries yet. Start writing!</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {entries.map((entry) => (
                        <li key={entry.id} style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "10px" }}>
                            <h4>{entry.title || "Untitled Entry"}</h4>
                            <p>{new Date(entry.timestamp).toLocaleString()}</p>
                            <p>{entry.content.substring(0, 100)}{entry.content.length > 100 ? "..." : ""}</p>
                            {/* Add view/edit link later */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default JournalList;

