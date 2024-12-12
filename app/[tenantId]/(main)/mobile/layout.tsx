"use client";

import { MobileFooter } from "./components/MobileNavigation/MobileFooter";
import { useState } from "react";

export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <main className="flex-1 pb-20">
                {children}
            </main>
            <MobileFooter onNotificationsClick={() => setNotificationsOpen(true)} />
        </div>
    );
}
