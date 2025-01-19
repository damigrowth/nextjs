import { hasAccessAllNav, noAccessAllNav } from "@/data/dashboard";
import UserMenuLink from "./UserMenuLink";
import { getAccess, getUser } from "@/lib/auth/user";
import UserImage from "@/components/user/UserImage";
import Link from "next/link";

export default async function UserMenu({ isMobile }) {
  const user = await getUser();

  if (user) {
    const hasAccess = await getAccess(["freelancer", "company"]);
    const allNav = hasAccess ? hasAccessAllNav : noAccessAllNav;
    return (
      <li className="user_setting">
        <div className="dropdown">
          <div className="btn" data-bs-toggle="dropdown">
            <UserImage
              firstName={user.firstName}
              lastName={user.lastName}
              displayName={user.displayName}
              hideDisplayName
              image={user?.image?.formats?.thumbnail?.url}
              alt={
                user?.image?.formats?.thumbnail?.provider_metadata?.public_id
              }
              width={40}
              height={40}
            />
          </div>
          <div className="dropdown-menu">
            <div className="user_setting_content">
              {allNav.map((item, i) => (
                <UserMenuLink key={i} item={item} index={i} />
              ))}
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
          Εγγραφή
        </Link>
      </>
    ) : (
      <Link href="/login">Σύνδεση</Link>
    );
  }
}
