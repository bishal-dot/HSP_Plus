import Image from 'next/image';
import HomeIcon from '@/icons/home.svg';
import { useState, useRef, useLayoutEffect, CSSProperties } from 'react';

type Tab = "opd" | "ipd" | "bed" | "req";

const TAB_LABELS: Record<Tab, string> = {
  opd: "OPD",
  ipd: "IPD",
  // bed: "Bed Status",
  // req: "Requisitions",
};

interface NavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function NavBar({ activeTab, onTabChange }: NavBarProps) {
  // Ref for each tab
  const tabsRef = useRef<Record<Tab, HTMLDivElement | null>>({
    opd: null,
    ipd: null,
    bed: null,
    req: null,
  });

  const [underlineStyle, setUnderlineStyle] = useState<CSSProperties>({ left: 0, width: 0 });

  // Use useLayoutEffect to calculate before paint
  useLayoutEffect(() => {
    const el = tabsRef.current[activeTab];
    if (el) {
      setUnderlineStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col w-full border-b shadow-sm">
      {/* Top Nav */}
      <div>
        {/* Left: Title */}
        {/* <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {TAB_LABELS[activeTab]} Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Consultant Panel</p>
        </div> */}

        {/* Right: Breadcrumb */}
        {/* <div className="flex items-center gap-1 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <HomeIcon className="w-4 h-4" />
            Home
          </span>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-700">{TAB_LABELS[activeTab]} Dashboard</span>
        </div> */}
      </div>

      {/* Tabs */}
      <div className="relative flex gap-6 px-6">
        {(["opd", "ipd", "bed", "req"] as Tab[]).map((tab) => (
          <div
            key={tab}
            ref={(el: HTMLDivElement | null) => {
                tabsRef.current[tab] = el
            } 
        }
            className="relative px-3 py-2 cursor-pointer font-medium transition-all duration-200 hover:text-red-500 hover:scale-105"
            onClick={() => onTabChange(tab)}
          >
            {TAB_LABELS[tab]}
          </div>
        ))}

        {/* Animated Underline */}
        <span
          className="absolute bottom-0 h-1 bg-red-500 rounded-full transition-all duration-300"
          style={underlineStyle}
        />
      </div>
    </div>
  );
}
