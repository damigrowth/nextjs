"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MessagesBadge from "./MessagesBadge";

export default function MessagesMenu() {
  const pathname = usePathname();

  // Don't show badge when on messages page
  const isOnMessagesPage = pathname === "/dashboard/messages";

  return (
    <div className="d-none d-sm-flex align-items-center justify-content-center">
      <Link
        href="/dashboard/messages"
        className="position-relative text-center text-thm2 fz24 d-flex"
        aria-label="Messages"
      >
        <span className="flaticon-mail d-flex" />
        {!isOnMessagesPage && <MessagesBadge />}
      </Link>
    </div>
  );
}
