"use client";

import React from "react";

export default function ServiceAudioFiles({ audioFiles }) {
  if (!audioFiles || audioFiles.length === 0) {
    return null; // Don't render anything if there are no audio files
  }

  return (
    <div className="px30 bdr1 pt30 pb30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
      <h4 className="mb20">Αρχεία Ήχου</h4>
      {audioFiles.map((file) => (
        <div key={file.id || file.url} className="audio-player-wrapper mb10">
          <p className="mb10">{file.name || "Audio File"}</p>{" "}
          {/* Display filename if available */}
          <audio controls preload="none" style={{ width: "100%" }}>
            <source src={file.url} type={file.mime || "audio/mpeg"} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      ))}
    </div>
  );
}
