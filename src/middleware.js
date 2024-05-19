import { NextResponse } from "next/server";
import { getMaintenanceStatus } from "./lib/maintenance/maintenance";

export async function middleware(request) {
  const cookie = request.cookies.get("jwt");
  const currentPath = request.nextUrl.pathname;
  const { isUnderMaintenance } = await getMaintenanceStatus();

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
  ];

  if (isUnderMaintenance) {
    // Check if the current path starts with any of the public paths
    const isPublicPath = maintenancePublicPaths.some((path) =>
      currentPath.startsWith(path)
    );

    // If the path is not public and the cookie is missing, redirect to the login page
    if (!isPublicPath && !cookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else {
    // Redirect to the login page if trying to access protected paths without a cookie
    if (protectedPaths.includes(currentPath) && cookie === undefined) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}
