"use client";

import { uploadMedia } from "@/lib/uploads/upload";
import useCreateServiceStore from "@/store/service/createServiceStore";
import Image from "next/image";
import { useState } from "react";
import Dropzone from "react-dropzone";

const imgs = [
  "/images/gallery/g-1.jpg",
  "/images/gallery/g-2.jpg",
  "/images/gallery/g-3.jpg",
  "/images/gallery/g-4.jpg",
];

export default function ServiceGallery() {
  const {
    service,
    media,
    setMedia,
    setMediaUrls,
    deleteMedia,
    gallery,
    setGallery,
    saveGallery,
  } = useCreateServiceStore();

  const handleDropMedia = (files) => {
    setMedia(files);
  };

  const handleMediaUpload = async () => {
    const mediaUrls = await uploadMedia(media);

    setGallery(mediaUrls);
  };

  console.log(gallery);

  // TODO Watch this for loading state: https://www.youtube.com/watch?v=hVTacwwtxP8

  return (
    <>
      <div className="ps-widget bgc-white bdrs12 p30 mb30 overflow-hidden position-relative">
        <div className="bdrb1 pb15 mb30">
          <h5 className="list-title">Φωτογραφίες - Βίντεο</h5>
        </div>
        <div className="col-xl-9">
          <Dropzone
            className="dropzone"
            value={media}
            onDrop={handleDropMedia}
            onChange={(e) => setMedia(e.target.value)}
          >
            {({ getRootProps, getInputProps }) => (
              <div>
                <div {...getRootProps({ className: "dropzone" })}>
                  <span className="fz30">🎞️</span>
                  <p className="text mt20">
                    Drag 'n' drop your media here, or click to select the media
                  </p>
                  <p>
                    Max file size is 1MB, Minimum dimension: 330x300 And
                    Suitable files are .jpg &amp; .png
                  </p>
                </div>
              </div>
            )}
          </Dropzone>
        </div>
        <div className="col-xl-9">
          <div className="d-flex mb30 flex-wrap gap-3">
            {media.map((item, i) => (
              <div
                key={i}
                className="gallery-item bdrs4 overflow-hidden position-relative"
              >
                <Image
                  height={119}
                  width={136}
                  className="object-fit-cover"
                  src={URL.createObjectURL(item)}
                  style={{ height: "166px", width: " 190px" }}
                  alt="gallery"
                />
                <div className="del-edit">
                  <div className="d-flex justify-content-center">
                    {/* <a className="icon me-2">
                      <span className="flaticon-pencil" />
                    </a> */}
                    <a className="icon" onClick={() => mediaDelete(item.name)}>
                      <span className="flaticon-delete" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="ud-btn btn-thm mt20 no-rotate"
          onClick={handleMediaUpload}
        >
          Αποθήκευση
          <i className="fa-solid fa-floppy-disk"></i>
        </button>
      </div>
    </>
  );
}
