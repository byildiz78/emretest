"use client"
import Dashboard from "./components/MobileDashboard/page";
import Filter from "./components/MobileFilter/filter";
import { MobileFooter } from "./components/MobileNavigation/MobileFooter";
import { Toaster } from "@/components/ui/toaster";
import MobileNotifications from "./components/MobileNotifications/MobileNotifications";
import { useState } from "react";

const MobilePage = () => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    return (
        <div className="w-full">
            <Filter />
            <div>
                <Dashboard />
                <MobileFooter onNotificationsClick={() => setIsNotificationsOpen(true)} />
                <MobileNotifications 
                    isOpen={isNotificationsOpen} 
                    onClose={() => setIsNotificationsOpen(false)} 
                />
                <Toaster />
            </div>
        </div>
    );
};

export default MobilePage;