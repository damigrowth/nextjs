import Image from "next/image";
import React from "react";

export default function ProfileImageInput() {
  return (
    <div className="col-xl-7">
      <div className="profile-box d-sm-flex align-items-center mb30">
        <div className="profile-img mb20-sm">
          <Image
            height={71}
            width={71}
            className="rounded-circle wa-xs"
            src={"/images/team/fl-1.png"}
            style={{
              height: "71px",
              width: "71px",
              objectFit: "cover",
            }}
            alt="profile"
          />
        </div>
        <div className="profile-content ml20 ml0-xs">
          <div className="d-flex align-items-center my-3">
            <a
              className="tag-delt text-thm2"
              // onClick={() => setSelectedImage(null)}
            >
              <span className="flaticon-delete text-thm2" />
            </a>
            <label>
              <input
                type="file"
                accept=".png, .jpg, .jpeg"
                className="d-none"
                // onChange={handleImageChange}
              />
              <a className="upload-btn ml10">Upload Images</a>
            </label>
          </div>
          <p className="text mb-0">
            Max file size is 1MB, Minimum dimension: 330x300 And Suitable files
            are .jpg &amp; .png
          </p>
        </div>
      </div>
    </div>
  );
}
