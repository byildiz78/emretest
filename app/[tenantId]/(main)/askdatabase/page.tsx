"use client";

import { useEffect, useState } from "react";

export default function AskDatabasePage() {
    const [iframeUrl, setIframeUrl] = useState("");

    useEffect(() => {
        fetch("/api/ai/ask_database", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        })
            .then((res) => res.json())
            .then(({ url }) => {
                setIframeUrl(url);
            })
            .catch((error) => {
                console.error("Error fetching chatbot session:", error);
            });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            {iframeUrl ? (
                <iframe
                    className="rounded-lg shadow-lg overflow-x-hidden"
                    style={{
                        height: "100vh",
                        width: "100vh"
                    }}
                    src={iframeUrl}
                />
            ) : (
                <div className="animate-pulse text-muted-foreground">
                    Loading chatbot...
                </div>
            )}
        </div>
    );
}
