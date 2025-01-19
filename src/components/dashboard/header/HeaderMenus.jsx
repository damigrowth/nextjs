import FavoritesMenu from "./FavouritesMenu";
import MessagesMenu from "./MessagesMenu";
import NotificationsMenu from "./NotificationsMenu";
import UserMenu from "./UserMenu";

export default function HeaderMenus() {
  return (
    <div className="col-6 col-lg-auto">
      <div className="text-center text-lg-end header_right_widgets">
        <ul className="dashboard_dd_menu_list d-flex align-items-center justify-content-center justify-content-sm-end mb-0 p-0">
          <NotificationsMenu />
          <MessagesMenu />
          <FavoritesMenu />
          <UserMenu />
        </ul>
      </div>
    </div>
  );
}
