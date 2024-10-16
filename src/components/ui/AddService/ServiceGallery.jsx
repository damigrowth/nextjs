"use client";

import { createService } from "@/lib/service/create";
import { uploadMedia } from "@/lib/uploads/upload";
import useCreateServiceStore from "@/store/service/createServiceStore";
import Image from "next/image";
import { useState } from "react";
import Dropzone, { useDropzone } from "react-dropzone";
import { useFormStatus } from "react-dom";

export default function ServiceGallery() {
  const {
    service,
    media,
    setMedia,
    mediaDelete,
    loading,
    setLoading,
    gallery,
    saveGallery,
  } = useCreateServiceStore();

  const { pending } = useFormStatus();

  const handleDropMedia = (files) => {
    const data = [];

    for (const file of files) {
      const blob = URL.createObjectURL(file);
      data.push({ file, url: blob });
    }
    setMedia(data);
  };

  const handleMediaSave = async () => {
    setLoading(true);
    saveGallery();
    setLoading(false);
  };

  // console.log("MEDIA", media);

  // TODO Watch this for loading state: https://www.youtube.com/watch?v=hVTacwwtxP8

  return (
    <>
      <div className="ps-widget bgc-white bdrs12 p30 mb30 overflow-hidden position-relative">
        <div className="bdrb1 pb15 ">
          <h5 className="list-title">Φωτογραφίες - Βίντεο</h5>
        </div>
        <div className="dropzone-container">
          <span className="fz30">📁</span>
          <input
            type="file"
            name="media-files"
            id="media-files"
            accept="image/*"
            placeholder="Επιλογή αρχείων"
            multiple
            maxsize={1048576}
            onChange={(e) => handleDropMedia(e.target.files)}
            className="dropzone"
          />
          <div className="mt10">
            {media.length === 0 ? (
              <p className="fz14">Επιλογή αρχείων</p>
            ) : (
              <p className="fz14">
                Έχετε επιλέξει{" "}
                {media.length === 1
                  ? media.length + " " + "αρχείο"
                  : media.length + " " + "αρχεία"}
              </p>
            )}
            <div className="mt10">
              <p className="fz14 mt5">
                Το μέγιστο επιτρεπτό μέγεθος αρχείων είναι{" "}
                <span className="fw600">1MB</span>
              </p>
              {media.length < 1 && (
                <p className="fz12">
                  Σύρετε τα αρχεία σας εδώ, ή κάντε κλικ για να τα επιλέξετε
                </p>
              )}
            </div>
          </div>
          <div className="gallery">
            {media.map((item, i) => (
              <div
                key={i}
                className="gallery-item bdrs4 overflow-hidden position-relative"
              >
                <Image
                  height={119}
                  width={136}
                  className="object-fit-cover"
                  src={item.url}
                  style={{ height: "166px", width: " 190px" }}
                  alt="gallery"
                />
                <div className="del-edit">
                  <div className="d-flex justify-content-center">
                    {/* <a className="icon me-2">
                      <span className="flaticon-pencil" />
                    </a> */}
                    {!pending && (
                      <a
                        disabled={true}
                        className="icon"
                        onClick={() => mediaDelete(item.file.name)}
                      >
                        <span className="flaticon-delete" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          className={`ud-btn no-rotate btn-thm`}
          disabled={pending}
          onClick={handleMediaSave}
        >
          {loading ? "Αποθήκευση..." : "Αποθήκευση"}
          {loading ? (
            <div
              className="spinner-border spinner-border-sm ml10"
              role="status"
            >
              <span className="sr-only"></span>
            </div>
          ) : (
            <i className="fa-solid fa-floppy-disk"></i>
          )}
        </button>
      </div>
    </>
  );
}
