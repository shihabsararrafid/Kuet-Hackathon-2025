"use client";
import { SearchForm } from "@/components/search-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { VersionSwitcher } from "@/components/version-switcher";
import { LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

// Sample user data - in a real app, this would come from your auth system
const userData = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "/api/placeholder/32/32",
  role: "Premium User",
  notifications: 3,
};

const data = {
  versions: ["1.0.0", "1.1.0", "2.0.0"],
  navMain: [
    {
      title: "Translation Tools",
      url: "/translation",
      items: [
        {
          title: "Banglish to Bangla",
          url: "/editor",
          isActive: true,
        },
        {
          title: "Saved Translations",
          url: "/translations",
        },
      ],
    },
    {
      title: "AI Chat Assistant",
      url: "/chat",
      items: [
        {
          title: "Start New Chat",
          url: "/chat/new",
        },
        {
          title: "Saved Conversations",
          url: "/chat/saved",
        },
      ],
    },
    {
      title: "Contribution",
      url: "/contribution",
      items: [
        {
          title: "New contribution",
          url: "/contribution/new",
        },
        {
          title: "Contribution History",
          url: "/contribution/history",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathName = usePathname();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between mb-4">
          <VersionSwitcher />
        </div>
        <SearchForm />
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.url.startsWith(pathName)}
                    >
                      <Link href={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center gap-2 px-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback>{userData.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium leading-none">User</p>
                <p className="text-xs text-muted-foreground">{userData.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
