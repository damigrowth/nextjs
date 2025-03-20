import React from "react";

export default function Socials({ socials = {}, email, phone, website }) {
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
    email && { icon: "flaticon-mail", data: { url: `mailto:${email}` } },
    phone && { icon: "flaticon-call", data: { url: `tel:${phone}` } },
    website && { icon: "flaticon-website", data: { url: website } },
  ].filter(Boolean); // Filter out any null entries

  return (
    <div className="social-style1 pt20 pb30 light-style2 socials-list">
      {socialsData.map((social, index) =>
        social.data ? (
          <a
            key={index}
            id={social.data.label}
            href={social.data.url}
            target={
              social.data.url && social.data.url.startsWith("http")
                ? "_blank"
                : undefined
            }
            rel={
              social.data.url && social.data.url.startsWith("http")
                ? "noopener noreferrer"
                : undefined
            }
          >
            <i
              className={`fab ${social.icon} list-inline-item d-flex align-items-center justify-content-center`}
            />
          </a>
        ) : null
      )}
    </div>
  );
}
