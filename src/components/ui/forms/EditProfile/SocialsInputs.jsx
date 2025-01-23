"use client";

import InputB from "@/components/inputs/InputB";
import React, { useState } from "react";

export default function SocialsInputs({ data, username }) {
  const socialPlatforms = {
    facebook: {
      label: "Facebook",
      placeholder: `https://facebook.com/${username}`,
    },
    linkedin: {
      label: "LinkedIn",
      placeholder: `https://linkedin.com/in/${username}`,
    },
    x: {
      label: "X",
      placeholder: `https://x.com/${username}`,
    },
    youtube: {
      label: "YouTube",
      placeholder: `https://youtube.com/@${username}`,
    },
    github: {
      label: "GitHub",
      placeholder: `https://github.com/${username}`,
    },
    instagram: {
      label: "Instagram",
      placeholder: `https://instagram.com/${username}`,
    },
    behance: {
      label: "Behance",
      placeholder: `https://behance.net/${username}`,
    },
    dribbble: {
      label: "Dribbble",
      placeholder: `https://dribbble.com/${username}`,
    },
  };

  // Initialize state with existing profile URLs or empty strings
  const [socials, setSocials] = useState(() => {
    const initialSocials = {};
    Object.keys(socialPlatforms).forEach((platform) => {
      initialSocials[platform] = {
        label: socialPlatforms[platform].label,
        url: data?.[platform]?.url || "",
      };
    });
    return initialSocials;
  });

  const handleInputChange = (platform, value) => {
    setSocials((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], url: value },
    }));
  };

  const socialIcons = {
    facebook: "facebook-f",
    linkedin: "linkedin-in",
    x: "x",
    youtube: "youtube",
    github: "github",
    instagram: "instagram",
    behance: "behance",
    dribbble: "dribbble",
  };

  return (
    <div className="row">
      {Object.entries(socials).map(([platform, social]) => (
        <div key={platform} className="col-md-3 mb-3">
          <span className={`fab fa-${socialIcons[platform]} mr10`} />
          <InputB
            label={social.label}
            id={`socials-${platform}`}
            name={`socials-${platform}`}
            type="url"
            value={social.url}
            onChange={(formattedValue) =>
              handleInputChange(platform, formattedValue)
            }
            placeholder={socialPlatforms[platform].placeholder}
            className="form-control input-group"
          />
        </div>
      ))}
    </div>
  );
}
