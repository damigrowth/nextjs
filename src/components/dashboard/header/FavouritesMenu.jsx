import NotificationItem from "./NotificationItem";

export default function FavoritesMenu() {
  return (
    <li className="d-none d-sm-block">
      <a
        className="text-center mr5 text-thm2 dropdown-toggle fz20"
        type="button"
        data-bs-toggle="dropdown"
      >
        <span className="flaticon-like" />
      </a>
      <div className="dropdown-menu">
        <div className="dboard_notific_dd px30 pt10 pb15">
          <NotificationItem
            image="/images/resource/notif-1.png"
            text1="Your resume"
            text2="updated!"
          />
          <NotificationItem
            image="/images/resource/notif-2.png"
            text1="You changed"
            text2="password"
          />
          <NotificationItem
            image="/images/resource/notif-3.png"
            text1="Your account has been"
            text2="created successfully"
          />
          <NotificationItem
            image="/images/resource/notif-4.png"
            text1="You applied for a job"
            text2="Front-end Developer"
          />
          <NotificationItem
            image="/images/resource/notif-5.png"
            text1="Your course uploaded"
            text2="successfully"
          />
        </div>
      </div>
    </li>
  );
}
