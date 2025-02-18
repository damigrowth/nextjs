// UserMenu.jsx
import { hasAccessUserMenuNav, noAccessUserMenuNav } from "@/data/dashboard";
import UserMenuLink from "./UserMenuLink";
import { getAccess, getUser } from "@/lib/auth/user";
import UserImage from "@/components/user/UserImage";
import Link from "next/link";
import LogoutLink from "./LogoutLink";

export default async function UserMenu({ isMobile }) {
  const user = await getUser();

  if (user && user.confirmed) {
    const hasAccess = await getAccess(["freelancer", "company"]);
    const allNav = hasAccess ? hasAccessUserMenuNav : noAccessUserMenuNav;
    const userProfilePath = `/profile/${user.username}`;

    // Modify the nav items to use dynamic profile path or filter out profile for non-access users
    const modifiedNav = allNav
      .map((item) => {
        if (item.path === "/profile") {
          return hasAccess ? { ...item, path: userProfilePath } : null;
        }
        return item;
      })
      .filter(Boolean); // Remove null items

    return (
      <li className="user_setting">
        <div className="dropdown">
          <div className="btn" data-bs-toggle="dropdown">
            <UserImage
              firstName={user.firstName}
              lastName={user.lastName}
              displayName={user.displayName}
              hideDisplayName
              image={
                user?.freelancer?.data?.attributes?.image?.data?.attributes
                  ?.formats?.thumbnail?.url
              }
              alt={
                user?.image?.formats?.thumbnail?.provider_metadata?.public_id
              }
              width={40}
              height={40}
            />
          </div>
          <div className="dropdown-menu">
            <div className="user_setting_content">
              {modifiedNav.map((item, i) => {
                if (item.path === "/logout") {
                  return (
                    <div key={i}>
                      <LogoutLink item={item} key={i} custom />
                    </div>
                  );
                } else {
                  return (
                    <div key={i}>
                      <UserMenuLink key={i} item={item} />
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </li>
    );
  } else {
    return !isMobile ? (
      <>
        <Link
          className="login-info mr15-xl mr10 ud-btn btn-dark add-joining bdrs50 dark-color bg-transparent"
          href="/login"
        >
          Σύνδεση
        </Link>
        <Link
          className="login-info mr15-xl mr10 ud-btn btn-dark add-joining bdrs50 dark-color bg-transparent"
          href="/register"
        >
          Εγγραφή
        </Link>
      </>
    ) : (
      <Link href="/login">Σύνδεση</Link>
    );
  }
}
