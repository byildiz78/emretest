"use client"
import Dashboard from "./components/MobileDashboard/page";
import Filter from "./components/MobileFilter/filter";
import { MobileFooter } from "./components/MobileNavigation/MobileFooter";
import { Toaster } from "@/components/ui/toaster";
import MobileNotifications from "./components/MobileNotifications/MobileNotifications";
import { useEffect, useState } from "react";

const MobilePage = () => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    useEffect(() => {   
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'loginSuccess',
                userId: "1297"
            }));
        }
    }, []);
    return (
        <div className="w-full min-w-full">
            <Filter />
            <div className="w-full min-w-full px-4">
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