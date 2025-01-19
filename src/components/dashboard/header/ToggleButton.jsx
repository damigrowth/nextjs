"use client";

import toggleStore from "@/store/toggleStore";
import Image from "next/image";

export default function ToggleButton() {
  const toggle = toggleStore((state) => state.dashboardSlidebarToggleHandler);
  return (
    <div className="fz20 ml90">
      <a onClick={toggle} className="dashboard_sidebar_toggle_icon vam">
        <Image
          height={18}
          width={20}
          src="/images/dashboard-navicon.svg"
          alt="navicon"
        />
      </a>
    </div>
  );
}
