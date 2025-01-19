import Image from "next/image";
import Link from "next/link";

export default function MessagesDropdown() {
  return (
    <div className="dropdown-menu">
      <div className="dboard_notific_dd px30 pt20 pb15">
        <div className="notif_list d-flex align-items-start bdrb1 pb25 mb10">
          <Image
            height={50}
            width={50}
            className="img-2"
            src="/images/testimonials/testi-1.png"
            alt="testimonials"
          />
          <div className="details ml15">
            <p className="dark-color fw500 mb-2">Ali Tufan</p>
            <p className="text mb-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing.
            </p>
            <p className="mb-0 text-thm">4 hours ago</p>
          </div>
        </div>
        <div className="notif_list d-flex align-items-start mb25">
          <Image
            height={50}
            width={50}
            className="img-2"
            src="/images/testimonials/testi-2.png"
            alt="testimonials"
          />
          <div className="details ml15">
            <p className="dark-color fw500 mb-2">Ali Tufan</p>
            <p className="text mb-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing.
            </p>
            <p className="mb-0 text-thm">4 hours ago</p>
          </div>
        </div>
        <div className="d-grid">
          <Link href="/message" className="ud-btn btn-thm w-100">
            View All Messages
            <i className="fal fa-arrow-right-long" />
          </Link>
        </div>
      </div>
    </div>
  );
}
