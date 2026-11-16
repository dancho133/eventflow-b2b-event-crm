"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { CreateEventModal } from "@/components/CreateEventModal";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { AIDrawer } from "@/components/AIDrawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#090D14] text-[#EAF0F8] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Navigation */}
        <TopNav
          onOpenCreateEvent={() => setIsCreateEventOpen(true)}
          onOpenCreateTask={() => setIsCreateTaskOpen(true)}
          onToggleAIDrawer={() => setIsAIDrawerOpen((prev) => !prev)}
        />

        {/* Page Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[#090D14] p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onSuccess={() => window.location.reload()}
      />
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSuccess={() => window.location.reload()}
      />
      <AIDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
      />
    </div>
  );
}
