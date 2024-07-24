import { NextResponse } from "next/server";
import { getMaintenanceStatus } from "./lib/maintenance/maintenance";
import { isAuthenticated } from "./lib/auth/authenticated";

export async function middleware(request) {
  // Add a new header x-current-path which passes the path to downstream components
  const headers = new Headers(request.headers);
  const currentPath = request.nextUrl.pathname;
  headers.set("x-current-path", currentPath);

  const { isUnderMaintenance } = await getMaintenanceStatus();
  const { authenticated } = await isAuthenticated();
  // List of paths that should be publicly accessible
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
    "/dashboard/invoices",
    "/dashboard/customers",
    "/add-services",
    "/manage-services",
    "/message",
    "my-profile",
  ];

  if (isUnderMaintenance) {
    // Check if the current path starts with any of the public paths
    const isPublicPath = maintenancePublicPaths.some((path) =>
      currentPath.startsWith(path)
    );

    // If the path is not public and the cookie is missing, redirect to the login page
    if (!isPublicPath && !authenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else {
    // Redirect to the login page if trying to access protected paths without a cookie
    if (protectedPaths.includes(currentPath) && authenticated === false) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    // match all routes except static files and APIs
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
