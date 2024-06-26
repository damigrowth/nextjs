import React from "react";

export default function Socials({ socials = {} }) {
  const {
    facebook = null,
    linkedin = null,
    x = null,
    youtube = null,
    github = null,
    instagram = null,
    behance = null,
    dribbble = null,
  } = socials || {};

  const socialsData = [
    { icon: "fa-facebook-f", data: facebook },
    { icon: "fa-linkedin-in", data: linkedin },
    { icon: "fa-twitter", data: x },
    { icon: "fa-youtube", data: youtube },
    { icon: "fa-github", data: github },
    { icon: "fa-instagram", data: instagram },
    { icon: "fa-behance", data: behance },
    { icon: "fa-dribbble", data: dribbble },
  ];
  return (
    <div className="social-style1">
      {socialsData.map((social) =>
        social.data ? (
          <a
            key={social.data.label}
            id={social.data.label}
            href={social.data.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className={`fab ${social.icon} list-inline-item`} />
          </a>
        ) : null
      )}
    </div>
  );
}
