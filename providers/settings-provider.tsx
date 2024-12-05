"use client";

import { createContext, useContext, useEffect } from "react";
import axios from "axios";
import { useSettingsStore } from "@/stores/settings-store";
import { ProjectSettings } from "@/types/tables";


const SettingContext = createContext<{
    refetchSettings: () => Promise<void>;
}>({
    refetchSettings: async () => {},
});

export const useSettingContext = () => useContext(SettingContext);

export function SettingsProvider({ children }: { children: React.ReactNode}) {
    const { setSettings  } = useSettingsStore();

    const fetchSettings = async () => {
        try {
            const response = await axios.get<ProjectSettings[]>("/api/settings", {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setSettings(response.data);
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingContext.Provider value={{ refetchSettings: fetchSettings }}>
            {children}
        </SettingContext.Provider>
    );
}
