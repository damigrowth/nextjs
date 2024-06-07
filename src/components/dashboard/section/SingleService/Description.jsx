import React from "react";

export default function Description({ description, tags }) {
  // console.log(tags);

  return (
    <div className="px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
      <h4>Περιγραφή</h4>
      <div className="text mb30 rich-text-editor">
        <p className="pb20">{description}</p>
        {/* <BlocksRenderer content={service.description} /> */}
        <div className="list1">
          <h6 className="fw500">Χαρακτηριστικά</h6>
          {tags.length > 0 ? (
            <ul className="tags">
              {tags.map((tag, i) => (
                <li key={i}>
                  <p>{tag.attributes.title}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
