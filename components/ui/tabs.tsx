"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { 
  X, Home, Settings, Users, Bell, Search, Mail, 
  FileText, Code, Database, Bot, MessageSquare, 
  BarChart, PieChart, LineChart, Table, Folder,
  FileJson, FileSpreadsheet, Filter, List,
  XCircle
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    onCloseAll?: () => void
  }
>(({ className, onCloseAll, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-12 items-center justify-start rounded-lg bg-muted/20 p-1 text-muted-foreground",
      "border border-border/40 shadow-md backdrop-blur-md",
      "transition-all duration-300 ease-in-out",
      "relative",
      className
    )}
    {...props}
  >
    {props.children}
    {onCloseAll && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="absolute right-2 cursor-pointer p-1.5 rounded-md hover:bg-destructive/10 transition-all duration-200 group"
              onClick={onCloseAll}
            >
              <XCircle className="h-4 w-4 text-muted-foreground group-hover:text-destructive group-hover:scale-110 transition-all duration-200" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            <p className="text-xs">Tüm açık tabları kapat</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </TabsPrimitive.List>
))
TabsList.displayName = TabsPrimitive.List.displayName

// İkon eşleştirme helper fonksiyonu
const getRandomIcon = () => {
  const icons = [
    FileText, Code, Database, Bot, MessageSquare, 
    BarChart, PieChart, LineChart, Table, Folder,
    FileJson, FileSpreadsheet, Filter, List
  ]
  const RandomIcon = icons[Math.floor(Math.random() * icons.length)]
  return <RandomIcon className="w-4 h-4" />
}

const getTabIcon = (label: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    home: <Home className="w-4 h-4 mr-2" />,
    settings: <Settings className="w-4 h-4 mr-2" />,
    users: <Users className="w-4 h-4 mr-2" />,
    notifications: <Bell className="w-4 h-4 mr-2" />,
    search: <Search className="w-4 h-4 mr-2" />,
    messages: <Mail className="w-4 h-4 mr-2" />,
  }
  return iconMap[label.toLowerCase()] || getRandomIcon()
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    onClose?: () => void
    icon?: React.ReactNode
  }
>(({ className, children, onClose, icon, ...props }, ref) => {
  const defaultIcon = typeof children === 'string' ? getTabIcon(children.toString()) : null
  const tabIcon = icon || defaultIcon

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium ring-offset-background",
        "transition-all duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-background/95 data-[state=active]:text-foreground",
        "data-[state=active]:shadow-lg data-[state=active]:scale-105",
        "data-[state=active]:border-b-2 data-[state=active]:border-primary",
        "hover:bg-background/90 hover:text-foreground",
        "hover:scale-102 hover:shadow-md",
        "group",
        className
      )}
      {...props}
    >
      {/* Tab içeriği */}
      <div className="flex items-center space-x-2">
        <div className="transition-transform duration-200 group-hover:scale-110">
          {tabIcon || getRandomIcon()}
        </div>
        <span className="font-medium">{children}</span>
      </div>

      {/* Kapatma butonu */}
      {onClose && (
        <div className="ml-2 transition-colors duration-200">
          <X
            className="h-4 w-4 text-muted-foreground hover:text-destructive hover:scale-110 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          />
        </div>
      )}

      {/* Aktif tab göstergesi - alt çizgi */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-0.5 rounded-full",
        "bg-primary/0 transition-all duration-300",
        "data-[state=active]:bg-primary/100"
      )} />
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 ring-offset-background rounded-lg p-4",
      "bg-background/50 backdrop-blur-sm shadow-sm",
      "border border-border/50",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-1",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }