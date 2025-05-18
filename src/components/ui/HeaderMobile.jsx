import React from "react";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "../dashboard/header/UserMenu";

export default function HeaderMobile() {
  return (
    <div className="mobilie_header_nav stylehome1">
      <div className="mobile-menu">
        <div className="header bdrb1">
          <div className="menu_and_widgets">
            <div className="mobile_menu_bar d-flex justify-content-between align-items-center">
              <Link className="mobile_logo" href="/">
                <Image
                  height={40}
                  width={133}
                  src="/images/doulitsa-logo.svg"
                  alt="Header Logo"
                  unoptimized
                  priority
                />
              </Link>
              <div className="d-flex align-items-center right-side text-end">
                <UserMenu isMobile />
                <a
                  className="menubar ml30"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvasExample"
                  aria-controls="offcanvasExample"
                >
                  <Image
                    height={20}
                    width={20}
                    src="/images/mobile-dark-nav-icon.svg"
                    alt="icon"
                  />
                </a>
              </div>
            </div>
          </div>
          <div className="posr">
            <div className="mobile_menu_close_btn">
              <span className="far fa-times" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
