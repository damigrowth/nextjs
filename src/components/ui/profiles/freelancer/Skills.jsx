import { inspect } from "@/utils/inspect";
import React from "react";

export default function Skills({ skills, specialisations }) {
  if (skills.length === 0 && specialisations.length === 0) {
    return;
  }

  // Combine skills and flag specialisations
  const combinedSkills = skills.map((skill) => ({
    ...skill,
    isSpecialisation: specialisations.some((spec) => spec.id === skill.id),
  }));

  // Sort combined skills to have specialisations first
  combinedSkills.sort(
    (a, b) => (b.isSpecialisation ? 1 : 0) - (a.isSpecialisation ? 1 : 0)
  );

  return (
    <div className="sidebar-widget mb30 pb20 bdrs8">
      <h4 className="widget-title">Δεξιότητες</h4>
      <ul className="tags mt20">
        {combinedSkills.map((skill, i) => (
          <li key={i}>
            <p className={skill.isSpecialisation ? "specialisation" : ""}>
              {skill.attributes.label}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
