"use client";
import { usePathname } from "next/navigation";

export default function PathChecker({ children, excludes, includes, paths }) {
  const pathname = usePathname();

  // Check exclusions
  if (excludes && pathname?.startsWith(excludes)) {
    return null;
  }

  // Check inclusions
  if (includes && !pathname?.startsWith(includes)) {
    return null;
  }

  // Check specific paths
  if (paths?.length > 0 && !paths.includes(pathname)) {
    return null;
  }

  return children;
}
