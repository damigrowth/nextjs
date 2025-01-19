import React from "react";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationsMenu() {
  return (
    <li className="d-none d-sm-block">
      <a
        className="text-center mr5 text-thm2 dropdown-toggle fz20"
        type="button"
        data-bs-toggle="dropdown"
      >
        <span className="flaticon-notification" />
      </a>
      <NotificationDropdown />
    </li>
  );
}
