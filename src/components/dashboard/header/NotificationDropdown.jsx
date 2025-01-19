import NotificationItem from "./NotificationItem";

export default function NotificationDropdown() {
  const notifications = [
    {
      image: "/images/resource/notif-1.png",
      text1: "Your resume",
      text2: "updated!",
    },
    {
      image: "/images/resource/notif-2.png",
      text1: "You changed",
      text2: "password",
    },
    {
      image: "/images/resource/notif-3.png",
      text1: "Your account has been",
      text2: "created successfully",
    },
    {
      image: "/images/resource/notif-4.png",
      text1: "You applied for a job",
      text2: "Front-end Developer",
    },
    {
      image: "/images/resource/notif-5.png",
      text1: "Your course uploaded",
      text2: "successfully",
    },
  ];

  return (
    <div className="dropdown-menu">
      <div className="dboard_notific_dd px30 pt10 pb15">
        {notifications.map((notification, index) => (
          <NotificationItem
            key={index}
            image={notification.image}
            text1={notification.text1}
            text2={notification.text2}
          />
        ))}
      </div>
    </div>
  );
}
