"use client";

import SelectInputSearch from "@/components/dashboard/option/SelectInputSearch";
import InputB from "@/components/inputs/InputB";
import ProfileImageInput from "@/components/inputs/ProfileImageInput";
import TextArea from "@/components/inputs/TextArea";
import React, { useCallback, useEffect, useState } from "react";
import SwitchB from "../../Archives/Inputs/SwitchB";
import SocialsInputs from "../../forms/EditProfile/SocialsInputs";
import ServiceGallery from "../../AddService/ServiceGallery";
import useEditProfileStore from "@/store/dashboard/profile";
import { useQuery } from "@apollo/client";
import { COUNTIES_SEARCH } from "@/lib/graphql/queries/main/location";

export default function EditProfile({ freelancer }) {
  const {
    // Basic Info
    email,
    username,
    displayName,
    setDisplayName,
    phone,
    setPhone,
    address,
    setAddress,
    coverage,

    // Profile Details
    image,
    setImage,
    tagline,
    setTagline,
    description,
    setDescription,
    rate,
    setRate,
    commencement,
    setCommencement,

    // Visibilitywebsite
    visibility,
    setVisibility,

    // Additional Info
    website,
    setWebsite,
    socials,
    setSocial,
    portfolio,
    setPortfolio,
    terms,

    setTerms,
    setCoverage,

    // Bulk Actions
    setProfile,
  } = useEditProfileStore();

  useEffect(() => {
    if (freelancer) {
      setProfile(freelancer);
    }
  }, [freelancer, setProfile]);

  const [taxonomyParams, setTaxonomyParams] = useState({
    freelancerCategoryTerm: "",
    freelancerSubcategoryTerm: "",
    countyTerm: "",
    areaTerm: "",
    skillTerm: "",
  });

  const [noResultsState, setNoResultsState] = useState({
    freelancerCategory: false,
    freelancerSubcategory: false,
    county: false,
    area: false,
    skill: false,
  });

  const handleSearch = useCallback(
    (field, term) => {
      // Reset noResults for this field when starting a new search
      if (term === "") {
        setNoResultsState((prev) => ({ ...prev, [field]: false }));
      }

      // Skip if we already know there are no results and adding more characters
      if (
        noResultsState[field] &&
        term.length > taxonomyParams[`${field}Term`].length
      ) {
        return;
      }

      setTaxonomyParams((prev) => ({ ...prev, [`${field}Term`]: term }));
    },
    [noResultsState, taxonomyParams]
  );

  const { data: countiesRes, loading: countiesLoading } = useQuery(
    COUNTIES_SEARCH,
    {
      variables: {
        name: taxonomyParams.countyTerm,
        // coverageCountyPage: 1,
        // coverageCountyPageSize: 10,
      },
      // onCompleted: (data) => {
      //   setNoResultsState((prev) => ({
      //     ...prev,
      //     subdivision: data?.subdivisions?.data?.length === 0,
      //   }));
      // },
    }
  );

  const coverageOptions = {
    counties: countiesRes?.counties?.data.map((county) => ({
      value: county.id,
      label: county.attributes.name,
    })),
  };

  console.log(
    "%cMyProject%cline:120%ccoverageOption",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(56, 13, 49);padding:3px;border-radius:2px",
    coverageOptions
  );

  // console.log(
  //   "%cMyProject%cline:59%cfreelancer",
  //   "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
  //   "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
  //   "color:#fff;background:rgb(20, 68, 106);padding:3px;border-radius:2px",
  //   coverage
  // );

  // TODO: Separate the form into parts, where each part has its own form and server action with a save button
  // TODO: ServiceInformation has similar queries and functions, create a custom hook for reusability accross all forms
  // TODO: Add validation

  return <div></div>;
  // <form>
  //   <div className="ps-widget bdrs4 mb30 position-relative">
  //     <div className="form-style1">
  //       <div>
  //         <div className="bdrb1 pb15 mb25">
  //           <h5 className="list-title heading">Λογαριασμός</h5>
  //         </div>

  //         <div className="row">
  //           <div className="mb10 col-md-3">
  //             <InputB
  //               label="Email"
  //               id="email"
  //               name="email"
  //               type="email"
  //               value={email}
  //               className="form-control input-group"
  //               disabled={true}
  //             />
  //           </div>
  //           <div className="mb10 col-md-3">
  //             <InputB
  //               label="Username"
  //               id="username"
  //               name="username"
  //               type="text"
  //               value={username}
  //               className="form-control input-group"
  //               disabled={true}
  //             />
  //           </div>
  //           <div className="mb10 col-md-3">
  //             <InputB
  //               label="Display Name"
  //               id="displayName"
  //               name="displayName"
  //               type="text"
  //               value={displayName}
  //               onChange={(value) => setDisplayName(value)}
  //               className="form-control input-group"
  //             />
  //           </div>
  //           <div className="mb10 col-md-3">
  //             <InputB
  //               label="Τηλέφωνο"
  //               id="phone"
  //               name="phone"
  //               type="phone"
  //               value={phone}
  //               onChange={(value) => setPhone(value)}
  //               className="form-control input-group"
  //             />
  //           </div>
  //           <div className="mb10 col-md-4">
  //             <InputB
  //               label="Διεύθυνση"
  //               id="address"
  //               name="address"
  //               type="address"
  //               value={address}
  //               onChange={(value) => setAddress(value)}
  //               className="form-control input-group"
  //             />
  //           </div>
  //         </div>
  //       </div>

  //       <div className="mt30 pb5">
  //         <div className="bdrb1 pb15 mb25">
  //           <h5 className="list-title heading">Βασικά στοιχεία</h5>
  //         </div>
  //         <ProfileImageInput />
  //         {/* <div className="col-sm-4">
  //                      <div className="mb20">
  //                        <SelectInputSearch
  //                          options={taxonomyOptions.categories}
  //                          name="service-category"
  //                          label="Κατηγορία"
  //                          labelPlural="κατηγορίες"
  //                          errors={errors}
  //                          isLoading={categoriesLoading}
  //                          isSearchable={true}
  //                          value={info.category}
  //                          onSelect={(selected) => handleSelect("category", selected)}
  //                          onSearch={(term) => handleSearch("category", term)}
  //                          capitalize
  //                        />
  //                      </div>
  //                    </div>
  //                    <div className="col-sm-4">
  //                      <div className="mb20">
  //                        <SelectInputSearch
  //                          options={taxonomyOptions.subcategories}
  //                          name="service-subcategory"
  //                          label="Υποκατηγορία"
  //                          labelPlural="υποκατηγορία"
  //                          errors={errors}
  //                          isLoading={subcategoriesLoading}
  //                          isSearchable={true}
  //                          value={info.subcategory}
  //                          onSelect={(selected) => handleSelect("subcategory", selected)}
  //                          onSearch={(term) => handleSearch("subcategory", term)}
  //                          capitalize
  //                        />
  //                      </div>
  //                    </div>
  //                   */}
  //         <div className="mb10 col-md-6">
  //           <InputB
  //             label="Σύντομη Περιγραφή"
  //             id="tagline"
  //             name="tagline"
  //             type="text"
  //             value={tagline}
  //             onChange={(value) => setTagline(value)}
  //             className="form-control input-group"
  //           />
  //         </div>
  //         <div className="mb10">
  //           <TextArea
  //             id="description"
  //             name="description"
  //             label="Περιγραφή"
  //             minLength={80}
  //             maxLength={5000}
  //             counter
  //             value={description}
  //             onChange={(value) => setDescription(value)}
  //             // errors={errors}
  //             // value={info.description}
  //             // defaultValue={info.description}
  //             // onChange={(formattedValue) =>
  //             //   setInfo("description", formattedValue)
  //             // }
  //           />
  //         </div>

  //         <label className="form-label fw700 dark-color mb10">Υπηρεσία</label>
  //         <div className="row">
  //           <div className="mb10 col-sm-2">
  //             <InputB
  //               label="Εργατοώρα"
  //               id="rate"
  //               name="rate"
  //               type="number"
  //               min={10}
  //               max={50000}
  //               // defaultValue={info.price}
  //               value={rate}
  //               onChange={(value) => setRate(value)}
  //               // onChange={(formattedValue) =>
  //               //   setInfo("price", formattedValue)
  //               // }
  //               className="form-control input-group"
  //               // errors={errors}
  //               // disabled={!info.fixed}
  //               append="€"
  //               formatSymbols
  //             />
  //           </div>
  //           <div className="mb10 col-sm-2">
  //             <InputB
  //               label="Έτος έναρξης δραστηριότητας"
  //               id="commencement"
  //               name="commencement"
  //               type="number"
  //               min={1900}
  //               max={2025}
  //               // defaultValue={info.price}
  //               value={commencement}
  //               onChange={(value) => setCommencement(value)}
  //               // onChange={(formattedValue) =>
  //               //   setInfo("price", formattedValue)
  //               // }
  //               className="form-control input-group"
  //               // errors={errors}
  //               // disabled={!info.fixed}
  //               formatSymbols
  //             />
  //           </div>
  //         </div>
  //         <div>
  //           <label className="form-label fw700 dark-color mb10">Κάλυψη</label>
  //           <div className="row">
  //             <label className="form-label dark-color mb10">
  //               Προσφέρω τις υπηρεσίες μου
  //             </label>
  //             <div className="col-md-2">
  //               <SwitchB
  //                 label="Online"
  //                 initialValue={coverage.online}
  //                 onChange={() =>
  //                   setCoverage({ ...coverage, online: !coverage.online })
  //                 }
  //                 // initialValue={status === "Active"}
  //                 // activeText="Ενεργή"
  //                 // inactiveText="Σε Παύση"
  //                 // onChange={(isActive) => {
  //                 // setStatus(isActive ? "Active" : "Paused");
  //                 // }}
  //               />
  //             </div>
  //             <div className="col-md-2">
  //               <SwitchB
  //                 label="Στην έδρα μου"
  //                 initialValue={coverage.onbase}
  //                 onChange={() =>
  //                   setCoverage({ ...coverage, onbase: !coverage.onbase })
  //                 }
  //                 // initialValue={status === "Active"}
  //                 // activeText="Ενεργή"
  //                 // inactiveText="Σε Παύση"
  //                 // onChange={(isActive) => {
  //                 // setStatus(isActive ? "Active" : "Paused");
  //                 // }}
  //               />
  //               <SelectInputSearch
  //                 options={coverageOptions.counties}
  //                 name="county"
  //                 label="Περιοχή έδρας"
  //                 labelPlural="Περιοχές έδρας"
  //                 errors={null}
  //                 isLoading={false}
  //                 isSearchable={true}
  //                 value={coverage.county?.data?.attributes?.name}
  //                 // onSelect={(selected) => handleSelect("tags", selected)}
  //                 // onSearch={(term) => handleSearch("tags", term)}
  //                 isMulti={true}
  //                 isClearable={true}
  //                 allowNewTerms={true}
  //               />
  //             </div>
  //             <div className="col-md-2">
  //               <SwitchB
  //                 label="Στον χώρο του πελάτη"
  //                 initialValue={coverage.onsite}
  //                 onChange={() =>
  //                   setCoverage({
  //                     ...coverage,
  //                     onsite: !coverage.onsite,
  //                   })
  //                 }
  //                 // initialValue={status === "Active"}
  //                 // activeText="Ενεργή"
  //                 // inactiveText="Σε Παύση"
  //                 // onChange={(isActive) => {
  //                 // setStatus(isActive ? "Active" : "Paused");
  //                 // }}
  //               />
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //       <div className="mt30 pb5">
  //         <div className="bdrb1 pb15 mb25">
  //           <h5 className="list-title heading">Παρουσίαση</h5>
  //         </div>

  //         <div className="mb10 col-md-3">
  //           <InputB
  //             label="Ιστότοπος"
  //             id="website"
  //             name="website"
  //             type="website"
  //             value={website}
  //             onChange={(value) => setWebsite(value)}
  //             className="form-control input-group"
  //           />
  //         </div>
  //         <label className="form-label fw700 dark-color">
  //           Κοινονικά Προφίλ
  //         </label>
  //         <SocialsInputs
  //           data={freelancer.socials}
  //           username={freelancer.username}
  //         />
  //         <label className="form-label fw700 dark-color mb0">
  //           Δείγμα εργασιών
  //         </label>
  //         <ServiceGallery isPending={false} custom />
  //         <label className="form-label fw700 dark-color mb10">
  //           Εμφάνιση στο προφίλ
  //         </label>
  //         <div className="row">
  //           <div className="col-md-1">
  //             <SwitchB
  //               label="Email"
  //               initialValue={visibility.email}
  //               onChange={() =>
  //                 setVisibility({ ...visibility, email: !visibility.email })
  //               }
  //               // initialValue={status === "Active"}
  //               // activeText="Ενεργή"
  //               // inactiveText="Σε Παύση"
  //               // onChange={(isActive) => {
  //               // setStatus(isActive ? "Active" : "Paused");
  //               // }}
  //             />
  //           </div>
  //           <div className="col-md-1">
  //             <SwitchB
  //               label="Τηλέφωνο"
  //               initialValue={visibility.phone}
  //               onChange={() =>
  //                 setVisibility({ ...visibility, phone: !visibility.phone })
  //               }
  //               // initialValue={status === "Active"}
  //               // activeText="Ενεργή"
  //               // inactiveText="Σε Παύση"
  //               // onChange={(isActive) => {
  //               // setStatus(isActive ? "Active" : "Paused");
  //               // }}
  //             />
  //           </div>
  //           <div className="col-md-1">
  //             <SwitchB
  //               label="Διεύθυνση"
  //               initialValue={visibility.address}
  //               onChange={() =>
  //                 setVisibility({
  //                   ...visibility,
  //                   address: !visibility.address,
  //                 })
  //               }
  //               // initialValue={status === "Active"}
  //               // activeText="Ενεργή"
  //               // inactiveText="Σε Παύση"
  //               // onChange={(isActive) => {
  //               // setStatus(isActive ? "Active" : "Paused");
  //               // }}
  //             />
  //           </div>
  //         </div>
  //       </div>
  //       <div className="mt30 pb5">
  //         <div className="bdrb1 pb15 mb25">
  //           <h5 className="list-title heading">Πρόσθετα Στοιχεία</h5>
  //         </div>
  //         <div className="mb10 col-md-3">
  //           <InputB
  //             label="Σύντομη Περιγραφή"
  //             id="website"
  //             name="website"
  //             type="website"
  //             value="website"
  //             className="form-control input-group"
  //           />
  //         </div>
  //         <div className="mb10 col-md-3">
  //           {/* <SelectInputSearch
  //                          options={taxonomyOptions.categories}
  //                          name="minBudgets"
  //                          label="Ελάχιστο Budget"
  //                          labelPlural="Ελάχιστα Budgets"
  //                          errors={errors}
  //                          isLoading={categoriesLoading}
  //                          isSearchable={true}
  //                          value={info.category}
  //                          onSelect={(selected) => handleSelect("category", selected)}
  //                          onSearch={(term) => handleSearch("category", term)}
  //                          capitalize
  //                        /> */}
  //         </div>
  //         <div className="mb10 col-md-3">
  //           {/* <SelectInputSearch
  //                          options={taxonomyOptions.categories}
  //                          name="industries"
  //                          label="Κύριοι Κλάδοι Πελατών"
  //                          labelPlural="Κύριοι Κλάδοι Πελατών"
  //                          errors={errors}
  //                          isLoading={categoriesLoading}
  //                          isSearchable={true}
  //                          value={info.category}
  //                          onSelect={(selected) => handleSelect("category", selected)}
  //                          onSearch={(term) => handleSearch("category", term)}
  //                          capitalize
  //                        /> */}
  //         </div>
  //         <div className="mb10 col-md-3">
  //           {/* <SelectInputSearch
  //                          options={taxonomyOptions.categories}
  //                          name="contactTypes"
  //                          label="Τρόποι Επικοινωνίας"
  //                          labelPlural="Τρόποι Επικοινωνίας"
  //                          errors={errors}
  //                          isLoading={categoriesLoading}
  //                          isSearchable={true}
  //                          value={info.category}
  //                          onSelect={(selected) => handleSelect("category", selected)}
  //                          onSearch={(term) => handleSearch("category", term)}
  //                          capitalize
  //                        /> */}
  //         </div>
  //         <div className="mb10 col-md-3">
  //           {/* <SelectInputSearch
  //                          options={taxonomyOptions.categories}
  //                          name="payment_methods"
  //                          label="Τρόποι Πληρωμής"
  //                          labelPlural="Τρόποι Πληρωμής"
  //                          errors={errors}
  //                          isLoading={categoriesLoading}
  //                          isSearchable={true}
  //                          value={info.category}
  //                          onSelect={(selected) => handleSelect("category", selected)}
  //                          onSearch={(term) => handleSearch("category", term)}
  //                          capitalize
  //                        /> */}
  //         </div>
  //         <div className="mb10 col-md-3">
  //           {/* <SelectInputSearch
  //                          options={taxonomyOptions.categories}
  //                          name="settlement_methods"
  //                          label="Μέθοδος Εξόφλησης"
  //                          labelPlural="Μέθοδος Εξόφλησης"
  //                          errors={errors}
  //                          isLoading={categoriesLoading}
  //                          isSearchable={true}
  //                          value={info.category}
  //                          onSelect={(selected) => handleSelect("category", selected)}
  //                          onSearch={(term) => handleSearch("category", term)}
  //                          capitalize
  //                        /> */}
  //         </div>

  //         <div className="mb10">
  //           <TextArea
  //             id="terms"
  //             name="terms"
  //             label="Όροι Συνεργασίας"
  //             minLength={80}
  //             maxLength={5000}
  //             counter
  //             // errors={errors}
  //             // value={info.description}
  //             // defaultValue={info.description}
  //             // onChange={(formattedValue) =>
  //             //   setInfo("description", formattedValue)
  //             // }
  //           />
  //         </div>
  //       </div>
  //     </div>
  //     {/* Submit Button */}
  //   </div>
  // </form>
}
