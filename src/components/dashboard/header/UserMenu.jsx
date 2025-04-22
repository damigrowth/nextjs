import { hasAccessUserMenuNav, noAccessUserMenuNav } from "@/data/dashboard";
import UserMenuLink from "./UserMenuLink";
import { getAccess, getUser } from "@/lib/auth/user";
import UserImage from "@/components/user/UserImage";
import Link from "next/link";
import LogoutLink from "./LogoutLink";
import MessagesMenu from "./MessagesMenu";

export default async function UserMenu({ isMobile }) {
  const user = await getUser();

  if (user && user.confirmed) {
    const hasAccess = await getAccess(["freelancer", "company"]);
    const allNav = hasAccess ? hasAccessUserMenuNav : noAccessUserMenuNav;
    const userProfilePath = `/profile/${user.username}`;

    const freelancer = user?.freelancer?.data?.attributes;

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
      <li className="user_setting d-flex">
        <div className="d-flex justify-content-center align-items-center mr20">
          <MessagesMenu />
        </div>
        <div className="dropdown">
          <div className="btn" data-bs-toggle="dropdown">
            <UserImage
              firstName={freelancer.firstName}
              lastName={freelancer.lastName}
              displayName={freelancer.displayName}
              hideDisplayName
              image={
                freelancer?.image?.data?.attributes?.formats?.thumbnail?.url
              }
              alt={
                freelancer?.image?.data?.attributes?.formats?.thumbnail
                  ?.provider_metadata?.public_id
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
      <div className="auth-btns">
        <Link
          className="mr15-xl mr10 ud-btn btn-dark add-joining bdrs50 dark-color bg-transparent"
          href="/login"
        >
          Σύνδεση
        </Link>
        <Link
          className="mr15-xl mr10 ud-btn btn-dark add-joining bdrs50 dark-color bg-transparent"
          href="/register"
        >
          Εγγραφή
        </Link>
      </div>
    ) : (
      <Link href="/login">Σύνδεση</Link>
    );
  }
}
