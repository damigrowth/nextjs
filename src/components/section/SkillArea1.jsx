"use client";

import { useMemo, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SkillArea1() {
  const [getCurrentTab, setCurrentTab] = useState(0);

  const path = usePathname();

  // skills
  const groups1 = useMemo(() => {
    const groupsArray = [];
    for (let i = 0; i < skills1.length; i += 6) {
      groupsArray.push(skills1.slice(i, i + 6));
    }
    return groupsArray;
  }, []);

  const groups2 = useMemo(() => {
    const groupsArray = [];
    for (let i = 0; i < skills2.length; i += 6) {
      groupsArray.push(skills2.slice(i, i + 6));
    }
    return groupsArray;
  }, []);

  const groups3 = useMemo(() => {
    const groupsArray = [];
    for (let i = 0; i < skills3.length; i += 6) {
      groupsArray.push(skills3.slice(i, i + 6));
    }
    return groupsArray;
  }, []);

  const groups4 = useMemo(() => {
    const groupsArray = [];
    for (let i = 0; i < skills4.length; i += 6) {
      groupsArray.push(skills4.slice(i, i + 6));
    }
    return groupsArray;
  }, []);

  return (
    <>
      <section className="pb90 pb30-md pt110">
        <div className="container">
          <div className="row align-items-md-center">
            <div className="col-lg-12">
              <div className="home9-navtab-style">
                <div className="navtab-style2">
                  <nav>
                    <div className="nav nav-tabs mb50">
                      {tabs.map((item, i) => (
                        <button
                          onClick={() => setCurrentTab(i)}
                          key={i}
                          className={`nav-link fw600 ${
                            getCurrentTab === i ? "active" : ""
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </nav>
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5">
                    {getCurrentTab === 0 &&
                      groups1.map((item, i) => (
                        <div key={i} className="col">
                          <div className="skill-list-style1 mb20">
                            <ul className="p-0 mb-0">
                              {item.map((item2, i2) => (
                                <li key={i2}>
                                  <Link href="/home-4">{item2}</Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}{" "}
                    {getCurrentTab === 1 &&
                      groups2.map((item, i) => (
                        <div key={i} className="col">
                          <div className="skill-list-style1 mb20">
                            <ul className="p-0 mb-0">
                              {item.map((item2, i2) => (
                                <li key={i2}>
                                  <Link href="/home-4">{item2}</Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    {getCurrentTab === 2 &&
                      groups3.map((item, i) => (
                        <div key={i} className="col">
                          <div className="skill-list-style1 mb20">
                            <ul className="p-0 mb-0">
                              {item.map((item2, i2) => (
                                <li key={i2}>
                                  <Link href="/home-4">{item2}</Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    {getCurrentTab === 3 &&
                      groups4.map((item, i) => (
                        <div key={i} className="col">
                          <div className="skill-list-style1 mb20">
                            <ul className="p-0 mb-0">
                              {item.map((item2, i2) => (
                                <li key={i2}>
                                  <Link href="/home-4">{item2}</Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
