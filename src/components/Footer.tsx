"use client"

import { useEffect, useState } from "react";

const Footer = () => {

    type Healthcheck = {
        version: string;
        repository: string | null;
    };

    const [health, setHealth] = useState<Healthcheck | null>({ version: null, repository: null });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/health")
        .then(async (res) => { 
            res.json()
            .then(async (json) => {
                setHealth(json);
            })
        })
        .catch((err) => {
            setError(String(err?.message ?? err ?? "unknown error"));
        });
    }, []);
    

    return (
        <footer style={{ textAlign: "center", marginTop: 32, padding: 16, color: "#888", fontFamily: "system-ui", fontSize: 14 }}>
            {health.version && (
                <>
                <a href={health.repository} target="_blank" rel="noopener noreferrer" style={{ color: "#888", textDecoration: "underline" }}>
                    Source Code
                </a>
                {" | "}
                v{health.version}
                </>
            )}
        </footer>
    )
};

export default Footer;