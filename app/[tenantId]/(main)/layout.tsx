"use client";
import "../../globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BranchProvider } from "@/providers/branch-provider";

export default function TenantLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SidebarProvider>
			{children}
		</SidebarProvider>
	);
}
