"use client";

import Input from "@/components/inputs/Input";
import SelectInput from "../option/SelectInput";
import { useState } from "react";

export default function BasicInformation({
  formState,
  categories,
  skills,
  cities,
}) {
  const [getCategory, setCategory] = useState({
    option: "Επιλογή",
    value: "select",
  });

  const [getSkill, setSkill] = useState({
    option: "Επιλογή",
    value: "select",
  });

  // handlers
  const categoryHandler = (option, value) => {
    setCategory({
      option,
      value,
    });
  };

  const skillHandler = (option, value) => {
    setSkill({
      option,
      value,
    });
  };

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 pb15 mb25">
        <h5 className="list-title">Βασικές Πληροφορίες</h5>
      </div>
      <div className="col-xl-8">
        <form className="form-style1">
          <div className="row">
            <div className="col-sm-6">
              <div className="mb20">
                <Input
                  state={formState}
                  label={"Τίτλος"}
                  type={"text"}
                  placeholder={""}
                  id={"title"}
                  name={"title"}
                  disabled={formState?.loading}
                  errorId={"title-error"}
                  formatNumbers
                  formatSymbols
                  capitalize
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <Input
                  state={formState}
                  label={"Αμοιβή"}
                  type={"number"}
                  placeholder={""}
                  id={"price"}
                  name={"price"}
                  disabled={formState?.loading}
                  errorId={"price-error"}
                  formatSymbols
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <Input
                  state={formState}
                  label={"Χρόνος Παράδωσης"}
                  type={"number"}
                  placeholder={""}
                  id={"time"}
                  name={"time"}
                  disabled={formState?.loading}
                  errorId={"time-error"}
                  formatSymbols
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <SelectInput
                  label="Κατηγορία"
                  defaultSelect={getCategory}
                  handler={categoryHandler}
                  data={categories}
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <SelectInput
                  label="Δεξιότητες"
                  defaultSelect={getSkill}
                  handler={skillHandler}
                  data={skills}
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="mb10">
                <label className="heading-color ff-heading fw500 mb10">
                  Περιγραφή
                </label>
                <textarea cols={30} rows={6} placeholder="Description" />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
