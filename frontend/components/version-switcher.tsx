"use client";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export function VersionSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="font-bold text-center mt-3">BanglaBridge</span>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
