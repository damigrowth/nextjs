import { inspect } from "@/utils/inspect";
import React from "react";

export default function Skills({ skills, specialization }) {
  if (skills.length === 0 && !specialization) {
    return;
  }

  return (
    <div className="sidebar-widget mb30 pb20 bdrs8">
      <h4 className="widget-title">Δεξιότητες</h4>
      <ul className="tags mt20">
        <li>
          <p className="specialisation">{specialization.attributes.label}</p>
        </li>
        {skills
          .filter(
            (skill) =>
              skill.attributes.label !== specialization.attributes.label
          )
          .map((skill, i) => (
            <li key={i}>
              <p>{skill.attributes.label}</p>
            </li>
          ))}
      </ul>
    </div>
  );
}
