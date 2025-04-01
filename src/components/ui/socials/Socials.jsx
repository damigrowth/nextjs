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
    facebook?.url && { icon: "fa-facebook-f", data: facebook },
    linkedin?.url && { icon: "fa-linkedin-in", data: linkedin },
    x?.url && { icon: "fa-x", data: x },
    youtube?.url && { icon: "fa-youtube", data: youtube },
    github?.url && { icon: "fa-github", data: github },
    instagram?.url && { icon: "fa-instagram", data: instagram },
    behance?.url && { icon: "fa-behance", data: behance },
    dribbble?.url && { icon: "fa-dribbble", data: dribbble },
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
                ? "noopener"
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
