"use client"
import { useState } from "react"
import DashboardOPD from "@/components/dashboard/consultant/DashboardOPD"
import DashboardIPD from "@/components/dashboard/consultant/DashboardIPD"
import React from "react";
import Tab from "@/types/types"
import NavBar from "@/components/header/Navbar";
import BedStatusDashboard from "@/components/dashboard/consultant/DashboardBedStatus";
import DashboardRequition from "@/components/dashboard/consultant/DashboardRequisition";
import { useRouter, useSearchParams } from "next/navigation";

const ConsultantAppDashboard: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const activeTab = (searchParams.get('tab') as Tab || 'opd');

    const handleTabChange = (tab: Tab) => {
        router.push(`?tab=${tab}`);
    }
    return(
        <>
        <div className="min-h-screen mb-20">
            <NavBar activeTab={activeTab} onTabChange={handleTabChange} />


            <div>
               {activeTab === "opd" && <DashboardOPD />}
                {activeTab === "ipd" && <DashboardIPD />}
                {/* {activeTab === "bed" && <BedStatusDashboard />}
                {activeTab === "req" && <DashboardRequition />} */}
            </div>
        </div>
        </>
    )
}

export default ConsultantAppDashboard