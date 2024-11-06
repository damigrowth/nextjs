import React from "react";

export default function Socials() {
  return (
    <div className="social-widget">
      <h5 className="text-white mb20">
        Βρείτε μας στο Linkedin{" "}
        <a
          href="https://www.linkedin.com/company/doulitsa"
          className="fz14 text-white"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-linkedin-in list-inline-item" />
        </a>
      </h5>

      <div className="social-style1">
        {/* <a>
          <i className="fab fa-facebook-f list-inline-item" />
        </a>
        <a>
          <i className="fab fa-twitter list-inline-item" />
        </a>
        <a>
          <i className="fab fa-instagram list-inline-item" />
        </a> */}
      </div>
    </div>
  );
}
