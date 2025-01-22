"use client";

import SelectInputSearch from "@/components/dashboard/option/SelectInputSearch";
import InputB from "@/components/inputs/InputB";
import ProfileImageInput from "@/components/inputs/ProfileImageInput";
import TextArea from "@/components/inputs/TextArea";
import React, { useState } from "react";
import SwitchB from "../../Archives/Inputs/SwitchB";
import SocialsInputs from "./SocialsInputs";
import ServiceGallery from "../../AddService/ServiceGallery";

export default function EditProfileForm({ freelancer }) {
  return (
    <form>
      <div className="ps-widget bdrs4 mb30 position-relative">
        <div className="form-style1">
          <div>
            <div className="bdrb1 pb15 mb25">
              <h5 className="list-title heading">Λογαριασμός</h5>
            </div>

            <div className="row">
              <div className="mb10 col-md-3">
                <InputB
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  value={"email"}
                  className="form-control input-group"
                  disabled={true}
                />
              </div>
              <div className="mb10 col-md-3">
                <InputB
                  label="Username"
                  id="username"
                  name="username"
                  type="text"
                  value={"domvournias"}
                  className="form-control input-group"
                  disabled={true}
                />
              </div>
              <div className="mb10 col-md-3">
                <InputB
                  label="Display Name"
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={"Kyriakos Vournias"}
                  className="form-control input-group"
                />
              </div>
              <div className="mb10 col-md-3">
                <InputB
                  label="Τηλέφωνο"
                  id="phone"
                  name="phone"
                  type="phone"
                  value={6949939998}
                  className="form-control input-group"
                />
              </div>
              <div className="mb10 col-md-4">
                <InputB
                  label="Διεύθυνση"
                  id="address"
                  name="address"
                  type="address"
                  value={"Αγίου Νικολάου 12, Αθήνα"}
                  className="form-control input-group"
                />
              </div>
            </div>
          </div>
          <div className="mt30 pb5">
            <div className="bdrb1 pb15 mb25">
              <h5 className="list-title heading">Βασικά στοιχεία</h5>
            </div>
            <ProfileImageInput />
            {/* <div className="col-sm-4">
                         <div className="mb20">
                           <SelectInputSearch
                             options={taxonomyOptions.categories}
                             name="service-category"
                             label="Κατηγορία"
                             labelPlural="κατηγορίες"
                             errors={errors}
                             isLoading={categoriesLoading}
                             isSearchable={true}
                             value={info.category}
                             onSelect={(selected) => handleSelect("category", selected)}
                             onSearch={(term) => handleSearch("category", term)}
                             capitalize
                           />
                         </div>
                       </div>
                       <div className="col-sm-4">
                         <div className="mb20">
                           <SelectInputSearch
                             options={taxonomyOptions.subcategories}
                             name="service-subcategory"
                             label="Υποκατηγορία"
                             labelPlural="υποκατηγορία"
                             errors={errors}
                             isLoading={subcategoriesLoading}
                             isSearchable={true}
                             value={info.subcategory}
                             onSelect={(selected) => handleSelect("subcategory", selected)}
                             onSearch={(term) => handleSearch("subcategory", term)}
                             capitalize
                           />
                         </div>
                       </div>
                      */}
            <div className="mb10 col-md-6">
              <InputB
                label="Σύντομη Περιγραφή"
                id="tagline"
                name="tagline"
                type="text"
                value="tagline"
                className="form-control input-group"
              />
            </div>
            <div className="mb10">
              <TextArea
                id="description"
                name="description"
                label="Περιγραφή"
                minLength={80}
                maxLength={5000}
                counter
                // errors={errors}
                // value={info.description}
                // defaultValue={info.description}
                // onChange={(formattedValue) =>
                //   setInfo("description", formattedValue)
                // }
              />
            </div>
            <div className="mb10 col-md-2">
              <InputB
                label="Εργατοώρα"
                id="rate"
                name="rate"
                type="number"
                min={10}
                max={50000}
                // defaultValue={info.price}
                value={50}
                // onChange={(formattedValue) =>
                //   setInfo("price", formattedValue)
                // }
                // className="form-control input-group"
                // errors={errors}
                // disabled={!info.fixed}
                append="€"
                formatSymbols
              />
            </div>
            <div className="mb10 col-md-2">
              <InputB
                label="Έτος έναρξης δραστηριότητας"
                id="commencement"
                name="commencement"
                type="number"
                min={1900}
                max={2025}
                // defaultValue={info.price}
                value={50}
                // onChange={(formattedValue) =>
                //   setInfo("price", formattedValue)
                // }
                // className="form-control input-group"
                // errors={errors}
                // disabled={!info.fixed}
                formatSymbols
              />
            </div>
          </div>
          <div className="mt30 pb5">
            <div className="bdrb1 pb15 mb25">
              <h5 className="list-title heading">Παρουσίαση</h5>
            </div>
            <label className="form-label fw700 dark-color mb10">
              Εμφάνιση στο προφίλ
            </label>
            <div className="row">
              <div className="col-md-1">
                <SwitchB
                  label="Email"
                  // initialValue={status === "Active"}
                  // activeText="Ενεργή"
                  // inactiveText="Σε Παύση"
                  // onChange={(isActive) => {
                  // setStatus(isActive ? "Active" : "Paused");
                  // }}
                />
              </div>
              <div className="col-md-1">
                <SwitchB
                  label="Τηλέφωνο"
                  // initialValue={status === "Active"}
                  // activeText="Ενεργή"
                  // inactiveText="Σε Παύση"
                  // onChange={(isActive) => {
                  // setStatus(isActive ? "Active" : "Paused");
                  // }}
                />
              </div>
              <div className="col-md-1">
                <SwitchB
                  label="Διεύθυνση"
                  // initialValue={status === "Active"}
                  // activeText="Ενεργή"
                  // inactiveText="Σε Παύση"
                  // onChange={(isActive) => {
                  // setStatus(isActive ? "Active" : "Paused");
                  // }}
                />
              </div>
            </div>

            <div className="mb10 col-md-3">
              <InputB
                label="Ιστότοπος"
                id="website"
                name="website"
                type="website"
                value="website"
                className="form-control input-group"
              />
            </div>
            <label className="form-label fw700 dark-color">
              Κοινονικά Προφίλ
            </label>
            <SocialsInputs
              data={freelancer.socials}
              username={freelancer.username}
            />
            <label className="form-label fw700 dark-color mb0">
              Δείγμα εργασιών
            </label>
            <ServiceGallery isPending={false} custom />
          </div>
          <div className="mt30 pb5">
            <div className="bdrb1 pb15 mb25">
              <h5 className="list-title heading">Πρόσθετα Στοιχεία</h5>
            </div>
            <div className="mb10 col-md-3">
              <InputB
                label="Σύντομη Περιγραφή"
                id="website"
                name="website"
                type="website"
                value="website"
                className="form-control input-group"
              />
            </div>
            <div className="mb10 col-md-3">
              {/* <SelectInputSearch
                             options={taxonomyOptions.categories}
                             name="minBudgets"
                             label="Ελάχιστο Budget"
                             labelPlural="Ελάχιστα Budgets"
                             errors={errors}
                             isLoading={categoriesLoading}
                             isSearchable={true}
                             value={info.category}
                             onSelect={(selected) => handleSelect("category", selected)}
                             onSearch={(term) => handleSearch("category", term)}
                             capitalize
                           /> */}
            </div>
            <div className="mb10 col-md-3">
              {/* <SelectInputSearch
                             options={taxonomyOptions.categories}
                             name="industries"
                             label="Κύριοι Κλάδοι Πελατών"
                             labelPlural="Κύριοι Κλάδοι Πελατών"
                             errors={errors}
                             isLoading={categoriesLoading}
                             isSearchable={true}
                             value={info.category}
                             onSelect={(selected) => handleSelect("category", selected)}
                             onSearch={(term) => handleSearch("category", term)}
                             capitalize
                           /> */}
            </div>
            <div className="mb10 col-md-3">
              {/* <SelectInputSearch
                             options={taxonomyOptions.categories}
                             name="contactTypes"
                             label="Τρόποι Επικοινωνίας"
                             labelPlural="Τρόποι Επικοινωνίας"
                             errors={errors}
                             isLoading={categoriesLoading}
                             isSearchable={true}
                             value={info.category}
                             onSelect={(selected) => handleSelect("category", selected)}
                             onSearch={(term) => handleSearch("category", term)}
                             capitalize
                           /> */}
            </div>
            <div className="mb10 col-md-3">
              {/* <SelectInputSearch
                             options={taxonomyOptions.categories}
                             name="payment_methods"
                             label="Τρόποι Πληρωμής"
                             labelPlural="Τρόποι Πληρωμής"
                             errors={errors}
                             isLoading={categoriesLoading}
                             isSearchable={true}
                             value={info.category}
                             onSelect={(selected) => handleSelect("category", selected)}
                             onSearch={(term) => handleSearch("category", term)}
                             capitalize
                           /> */}
            </div>
            <div className="mb10 col-md-3">
              {/* <SelectInputSearch
                             options={taxonomyOptions.categories}
                             name="settlement_methods"
                             label="Μέθοδος Εξόφλησης"
                             labelPlural="Μέθοδος Εξόφλησης"
                             errors={errors}
                             isLoading={categoriesLoading}
                             isSearchable={true}
                             value={info.category}
                             onSelect={(selected) => handleSelect("category", selected)}
                             onSearch={(term) => handleSearch("category", term)}
                             capitalize
                           /> */}
            </div>

            <div className="mb10">
              <TextArea
                id="terms"
                name="terms"
                label="Όροι Συνεργασίας"
                minLength={80}
                maxLength={5000}
                counter
                // errors={errors}
                // value={info.description}
                // defaultValue={info.description}
                // onChange={(formattedValue) =>
                //   setInfo("description", formattedValue)
                // }
              />
            </div>
          </div>
        </div>
        {/* Submit Button */}
      </div>
    </form>
  );
}
