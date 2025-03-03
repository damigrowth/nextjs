import React from "react";
import InputB from "@/components/inputs/InputB";

const SocialsInputs = ({ data = {}, username, onChange, errors }) => {
  const socialPlatforms = {
    facebook: {
      label: "Facebook",
      icon: "facebook-f",
      placeholder: "https://facebook.com/",
    },
    linkedin: {
      label: "LinkedIn",
      icon: "linkedin-in",
      placeholder: "https://linkedin.com/",
    },
    x: {
      label: "X",
      icon: "x",
      placeholder: "https://x.com/",
    },
    youtube: {
      label: "YouTube",
      icon: "youtube",
      placeholder: "https://youtube.com/@",
    },
    github: {
      label: "GitHub",
      icon: "github",
      placeholder: "https://github.com/",
    },
    instagram: {
      label: "Instagram",
      icon: "instagram",
      placeholder: "https://instagram.com/",
    },
    behance: {
      label: "Behance",
      icon: "behance",
      placeholder: "https://behance.net/",
    },
    dribbble: {
      label: "Dribbble",
      icon: "dribbble",
      placeholder: "https://dribbble.com/",
    },
  };

  const handleInputChange = (platform, url) => {
    onChange(platform, url.trim());
  };

  return (
    <div className="row">
      {Object.entries(socialPlatforms).map(([platform, config]) => (
        <div key={platform} className="col-md-3 mb-3">
          <InputB
            label={config.label}
            id={platform}
            name={platform}
            type="url"
            value={data[platform]?.url || ""}
            onChange={(value) => handleInputChange(platform, value)}
            placeholder={`${config.placeholder}username`}
            className="form-control"
            errors={errors?.[platform]}
            icon={`fab fa-${config.icon}`}
          />
        </div>
      ))}
    </div>
  );
};

export default SocialsInputs;
