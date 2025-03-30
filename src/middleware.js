import { NextResponse } from "next/server";
import { getTokenFromRequest } from "./lib/auth/token";
import { getUser } from "@/lib/auth/user";
import { getFreelancerId } from "@/lib/users/freelancer";

export async function middleware(request) {
  const currentPath = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-path", currentPath);

  const isUnderMaintenance = false;

  const token = getTokenFromRequest(request);
  const user = await getUser();
  const isConfirmed = user?.confirmed;
  const freelancer = await getFreelancerId();
  const authenticated = Boolean(token && freelancer && isConfirmed);

  const maintenancePublicPaths = [
    "/maintenance",
    "/login",
    "/favicon.ico",
    "/_next",
    "/static",
    "/images",
    "/styles",
    "/scripts",
  ];

  const protectedPaths = [
    "/dashboard",
    "/dashboard/create-projects",
    "/dashboard/documents",
    "/dashboard/invoice",
    "/dashboard/manage-jobs",
    "/dashboard/manage-projects",
    "/dashboard/messages",
    "/dashboard/orders",
    "/dashboard/payouts",
    "/dashboard/profile",
    "/dashboard/proposal",
    "/dashboard/reviews",
    "/dashboard/saved",
    "/dashboard/services",
  ];

  // Check if path starts with /dashboard
  const isDashboardPath = currentPath.startsWith("/dashboard");

  if (isUnderMaintenance) {
    const isPublicPath = maintenancePublicPaths.some((path) =>
      currentPath.startsWith(path)
    );

    if (!isPublicPath && !authenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else {
    // Handle dashboard paths
    if (isDashboardPath && !authenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Handle other protected paths
    if (protectedPaths.includes(currentPath) && !authenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Handle login page redirect when authenticated
  const isLoginPage = currentPath === "/login";
  const isRegisterPage = currentPath === "/register";

  if (isLoginPage && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isRegisterPage && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next({
    headers: requestHeaders,
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "next-action" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
