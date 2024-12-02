"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { WebWidget, WebWidgetData, BranchModel } from "@/types/tables";
import { useFilterStore } from "@/stores/filters-store";
import { useWidgetDataStore } from "@/stores/widget-data-store";
import RingLoader from "react-spinners/RingLoader";
import LazyWidgetCard from "./components/LazyWidgetCard";
import NotificationPanel from "./components/NotificationPanel";
import { Bell, Store } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import BranchList from "./components/BranchList";

const REFRESH_INTERVAL = 90000; // 90 seconds in milliseconds

interface Branch {
    BranchID: string | number;
}

export default function Dashboard() {


    return (
        <div className="container mx-auto p-4">
        adsfasddfsa
        </div>
    );
}
