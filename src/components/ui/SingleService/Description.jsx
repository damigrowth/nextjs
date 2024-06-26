import React from "react";

export default function Description({ description, tags }) {
  // console.log(tags);
  if (!description) {
    return;
  }

  const formattedDescription = description
    .split("\n")
    .map((description, index) =>
      description.trim() !== "" ? (
        <p key={index}>{description}</p>
      ) : (
        <div key={index} className="line-break"></div>
      )
    );

  return (
    <div className="px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
      <h4>Περιγραφή</h4>
      <div className="text mb30 rich-text-editor">
        <div className="freelancer-description text mb30">
          {formattedDescription}
        </div>
        {/* <BlocksRenderer content={service.description} /> */}
        {tags.length > 0 && (
          <div className="list1">
            <h6 className="fw500">Χαρακτηριστικά</h6>
            <ul className="tags">
              {tags.map((tag, i) => (
                <li key={i}>
                  <p>{tag.attributes.label}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
