'use client';
import { useAuthToken } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import AppDashboard from "@/layout/ConsultantAppDashboard";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { authToken, username } = useAuthToken();
  const router = useRouter();

  useEffect(() => {
    if (!authToken || !username) {
      router.push("/");
    }
  }, [authToken, username, router]);

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[200px]"
      : "lg:ml-[90px]";

  return (
    <>
    <div className="min-h-screen xl:flex">
      <AppSidebar />  
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="max-w-(--breakpoint-3xl) md:py-4">
          {children}
        </div>
      </div>
    </div>
    
    </>
  );
}