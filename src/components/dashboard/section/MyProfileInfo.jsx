import EditProfileForm from "@/components/ui/forms/EditProfile/EditProfileForm";
import DashboardNavigation from "../header/DashboardNavigation";
import Award from "./Award";
import ChangePassword from "./ChangePassword";
import ConfirmPassword from "./ConfirmPassword";
import Education from "./Education";
import ProfileDetails from "./ProfileDetails";
import Skill from "./Skill";
import WorkExperience from "./WorkExperience";
import Image from "next/image";

export default function MyProfileInfo({ freelancer }) {
  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2>Διαχείριση Προφίλ</h2>
              {/* <p className="text">Lorem ipsum dolor sit amet, consectetur.</p> */}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
              <EditProfileForm freelancer={freelancer} />
            </div>
            {/* <ProfileDetails /> */}
            {/* <Skill />
            <Education />
            <WorkExperience />
            <Award />
            <ChangePassword />
            <ConfirmPassword /> */}
          </div>
        </div>
      </div>
    </>
  );
}
