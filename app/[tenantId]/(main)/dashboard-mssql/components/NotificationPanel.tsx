"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWidgetDataStore } from "@/stores/widget-data-store";
import { WebWidgetData } from "@/types/tables";

export default function NotificationPanel() {
    const [notifications, setNotifications] = useState<
        { id: string; message: string }[]
    >([]);
    const { widgetDatas } = useWidgetDataStore();

    useEffect(() => {
        const newNotifications: { id: string; message: string }[] = [];

        Object.entries(widgetDatas).forEach(([reportId, data]) => {
            if (data) {
                const widgetData = data as WebWidgetData;
                if (widgetData.V1Type === "notification" && widgetData.V1) {
                    newNotifications.push({
                        id: reportId,
                        message: widgetData.V1,
                    });
                }
            }
        });

        setNotifications(newNotifications);
    }, [widgetDatas]);

    return (
        <ScrollArea className="h-[calc(100vh-100px)]">
            <div className="space-y-4 p-4">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                    >
                        <p className="text-sm">{notification.message}</p>
                    </div>
                ))}
                {notifications.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                        Bildirim bulunmamaktadır.
                    </p>
                )}
            </div>
        </ScrollArea>
    );
}
