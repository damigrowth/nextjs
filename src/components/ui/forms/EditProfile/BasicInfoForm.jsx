"use client";

import React, { useCallback, useEffect } from "react";
import InputB from "@/components/inputs/InputB";
import TextArea from "@/components/inputs/TextArea";
import ProfileImageInput from "@/components/inputs/ProfileImageInput";
import useEditProfileStore from "@/store/dashboard/profile";
import { useActionState } from "react";
import { updateBasicInfo } from "@/lib/profile/update";
import SaveButton from "../../buttons/SaveButton";
import {
  ONBASE_ZIPCODES,
  ONSITE_AREAS,
  ONSITE_COUNTIES,
} from "@/lib/graphql/queries/main/location";
import SearchableSelect from "../../Archives/Inputs/SearchableSelect";
import { searchData } from "@/lib/client/operations";
import { normalizeQuery } from "@/utils/queries";
import {
  FREELANCER_PROFILE_CATEGORIES,
  FREELANCER_PROFILE_SUBCATEGORIES,
} from "@/lib/graphql/queries/main/taxonomies/freelancer";
import Alert from "../../alerts/Alert";
import SwitchB from "../../Archives/Inputs/SwitchB";
import { useFormChanges } from "@/hook/useFormChanges";
import { FREELANCER_PROFILE_SKILLS } from "@/lib/graphql/queries/main/taxonomies/freelancer/skill";

export default function BasicInfoForm({ freelancer, type }) {
  const {
    image,
    setImage,
    tagline,
    setTagline,
    description,
    setDescription,
    category,
    setCategory,
    subcategory,
    setSubcategory,
    skills,
    setSkills,
    rate,
    setRate,
    commencement,
    setCommencement,
    coverage,
    setCoverage,
    switchCoverageMode,
    specialization,
    setSpecialization,
  } = useEditProfileStore();

  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    updateBasicInfo,
    initialState
  );

  const originalValues = {
    image: freelancer.image,
    tagline: freelancer.tagline,
    description: freelancer.description,
    category: freelancer.category,
    subcategory: freelancer.subcategory,
    skills: freelancer.skills,
    specialization: freelancer.specialization,
    rate: Number(freelancer.rate),
    commencement: Number(freelancer.commencement),
    coverage: freelancer.coverage,
  };

  const currentValues = {
    image,
    tagline,
    description,
    category,
    subcategory,
    skills,
    specialization,
    rate: Number(rate),
    commencement: Number(commencement),
    coverage,
  };

  const { changes, hasChanges } = useFormChanges(currentValues, originalValues);

  // Handle Onbase and Onsite Searches
  const handleOnbaseZipcodes = useCallback(async (searchTerm, page = 1) => {
    const query = normalizeQuery(ONBASE_ZIPCODES);
    const data = await searchData({
      query,
      searchTerm,
      page,
      additionalVariables: {
        onsiteZipcodesPage: page,
        onsiteZipcodesPageSize: 10,
      },
    });

    return data;
  }, []);

  const handleOnsiteCounties = useCallback(async (searchTerm, page = 1) => {
    const query = normalizeQuery(ONSITE_COUNTIES);
    const data = await searchData({
      query,
      searchTerm,
      page,
      additionalVariables: {
        onsiteCountyPage: page,
        onsiteCountyPageSize: 10,
      },
    });

    return data;
  }, []);

  const handleOnsiteAreas = useCallback(
    async (searchTerm, page = 1) => {
      const countyIds = coverage.counties.data.map((c) => c.id);

      const query = normalizeQuery(ONSITE_AREAS);
      const data = await searchData({
        query,
        searchTerm,
        page,
        additionalVariables: {
          onsiteAreasPage: page,
          onsiteAreasPageSize: 10,
          counties: countyIds,
        },
      });

      return data;
    },
    [coverage.counties.data]
  );

  const handleFreelancerCategories = useCallback(
    async (searchTerm, page = 1) => {
      const query = normalizeQuery(FREELANCER_PROFILE_CATEGORIES);
      const data = await searchData({
        query,
        searchTerm,
        searchTermType: "label",
        page,
        additionalVariables: {
          categoriesPage: page,
          categoriesPageSize: 10,
        },
      });

      return data;
    },
    []
  );

  const handleFreelancerSubcategories = useCallback(
    async (searchTerm, page = 1) => {
      const query = normalizeQuery(FREELANCER_PROFILE_SUBCATEGORIES);
      const data = await searchData({
        query,
        searchTerm,
        searchTermType: "label",
        page,
        additionalVariables: {
          // type: type?.attributes?.slug || "", // Access slug from type prop
          categorySlug: category.data?.attributes?.slug || "",
          categoriesPage: page,
          categoriesPageSize: 10,
        },
      });

      return data;
    },
    [category.data?.attributes?.slug, type]
  );

  const handleSkills = useCallback(
    async (searchTerm, page = 1) => {
      const query = normalizeQuery(FREELANCER_PROFILE_SKILLS);
      const data = await searchData({
        query,
        searchTerm: searchTerm || "", // Handle empty search term
        searchTermType: "label",
        page,
        additionalVariables: {
          categorySlug: category.data?.attributes?.slug || "",
          skillsPage: page,
          skillsPageSize: 10,
        },
      });

      return data;
    },
    [category.data?.attributes?.slug]
  );

  const handleOnlineSwitch = () => {
    switchCoverageMode("online", freelancer.coverage);
  };

  const handleOnbaseSwitch = () => {
    switchCoverageMode("onbase", freelancer.coverage);
  };

  const handleOnsiteSwitch = () => {
    switchCoverageMode("onsite", freelancer.coverage);
  };

  // Handle category change
  const handleCategorySelect = (selected) => {
    const categoryObj = selected
      ? {
          id: selected.id,
          attributes: {
            label: selected.attributes.label,
            slug: selected.attributes.slug,
          },
        }
      : null;

    setCategory({ data: categoryObj });
    // Reset dependent fields when changing category
    setSubcategory({ data: null });
    setSkills({ data: [] });
    setSpecialization({ data: null });
  };

  const handleSubcategorySelect = (selected) => {
    const subcategoryObj = selected
      ? {
          id: selected.id,
          attributes: {
            label: selected.attributes.label,
            slug: selected.attributes.slug,
          },
        }
      : null;
    setSubcategory({ data: subcategoryObj });
  };

  const handleSkillsSelect = (selected) => {
    const newSkills = selected
      ? selected.map((item) => ({
          id: item.id,
          attributes: item.attributes,
        }))
      : [];

    setSkills({ data: newSkills });

    // Check if current specialization exists in the new skills
    if (
      specialization.data &&
      !newSkills.some((skill) => skill.id === specialization.data.id)
    ) {
      setSpecialization({ data: null });
    }
  };

  const handleSpecializationSelect = (selected) => {
    const specializationObj = selected
      ? {
          id: selected.id,
          attributes: {
            label: selected.data.label,
            slug: selected.data.slug,
          },
        }
      : null;

    setSpecialization({
      data: specializationObj,
    });
  };

  const handleCountiesSelect = (selected) => {
    const newCountyIds = selected ? selected.map((c) => c.id) : [];

    const currentAreas = coverage.areas.data || [];

    const updatedAreas = currentAreas.filter((area) => {
      const countyData = area.data?.attributes?.county?.data;
      return countyData && newCountyIds.includes(countyData.id);
    });

    setCoverage("counties", { data: selected });
    setCoverage("areas", { data: updatedAreas });
  };

  // Check if category is selected
  const isCategorySelected = !!category.data;
  const isSubcategorySelected = !!subcategory.data;

  const specializations =
    skills.data?.map((skill) => ({
      id: skill.id,
      slug: skill.attributes?.slug,
      label: skill.attributes?.label || skill.attributes?.name,
    })) || [];

  const handleSubmit = async (formData) => {
    formData.append("id", freelancer.id);

    // Handle image separately if it exists in changes
    if (changes.image) {
      formData.append("image", changes.image);
      const { image, ...restChanges } = changes;
      formData.append("changes", JSON.stringify(restChanges));
    } else {
      formData.append("changes", JSON.stringify(changes));
    }

    return formAction(formData);
  };

  return (
    <form action={handleSubmit}>
      <div className="form-style1">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title heading">Βασικά Στοιχεία</h5>
        </div>
        <label className="form-label fw500 dark-color">Εικόνα Προφιλ</label>
        <ProfileImageInput
          image={image?.data?.attributes?.formats?.thumbnail?.url}
          onChange={setImage}
          errors={formState?.errors?.image}
        />

        <div className="mb10 col-md-6">
          <InputB
            label="Σύντομη Περιγραφή"
            id="tagline"
            name="tagline"
            type="text"
            value={tagline}
            onChange={setTagline}
            className="form-control input-group"
            errors={formState?.errors?.tagline}
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
            value={description}
            onChange={setDescription}
            errors={formState?.errors?.description}
          />
        </div>
        <div className="row mb20">
          <div className="col-md-3">
            <SearchableSelect
              name="freelancerCategories"
              label="Κατηγορία"
              labelPlural="κατηγορίες"
              value={category.data}
              nameParam="label"
              pageParam="categoriesPage"
              pageSizeParam="categoriesPageSize"
              pageSize={10}
              onSearch={handleFreelancerCategories}
              onSelect={handleCategorySelect}
              isMulti={false}
              isClearable={true}
              formatSymbols
              capitalize
              errors={formState?.errors?.category}
            />
          </div>
          <div className="col-md-3">
            <SearchableSelect
              name="freelancerSubcategories"
              label="Υποκατηγορία"
              labelPlural="υποκατηγορίες"
              value={subcategory.data}
              nameParam="label"
              pageParam="subcategoriesPage"
              pageSizeParam="subcategoriesPageSize"
              pageSize={10}
              onSearch={handleFreelancerSubcategories}
              onSelect={handleSubcategorySelect}
              isMulti={false}
              isClearable={true}
              formatSymbols
              capitalize
              errors={formState?.errors?.subcategory}
              isDisabled={!isCategorySelected}
              resetDependency={category.data?.id}
            />
          </div>
        </div>
        <div>
          <label className="form-label fw700 dark-color mb10">Κάλυψη</label>
          <div className="row ">
            <label className="form-label dark-color mb10">
              Προσφέρω τις υπηρεσίες μου
            </label>
            <div className="col-md-2">
              <SwitchB
                label="Online"
                name="online"
                initialValue={coverage.online}
                onChange={handleOnlineSwitch}
              />
            </div>
            <div className="col-md-2">
              <SwitchB
                label="Στην έδρα μου"
                name="onbase"
                initialValue={coverage.onbase}
                onChange={handleOnbaseSwitch}
              />
            </div>
            <div className="col-md-2">
              <SwitchB
                label="Στον χώρο του πελάτη"
                name="onsite"
                initialValue={coverage.onsite}
                onChange={handleOnsiteSwitch}
              />
            </div>
            {formState?.errors?.coverage ? (
              <div>
                <p className="text-danger mb0 pb0">
                  {formState.errors.coverage.message}
                </p>
              </div>
            ) : null}
          </div>
          {coverage.onbase && (
            <div className="row mb10">
              <div className="col-md-3">
                <InputB
                  label="Διεύθυνση"
                  id="address"
                  name="address"
                  type="text"
                  value={coverage.address || ""}
                  onChange={(value) => setCoverage("address", value)}
                  className="form-control input-group"
                  errors={formState?.errors?.address}
                />
              </div>
              <div className="col-md-3">
                <SearchableSelect
                  name="zipcode"
                  label="Τ.Κ"
                  labelPlural="Τ.Κ"
                  value={coverage.zipcode.data}
                  nameParam="name"
                  pageParam="coverageZipcodePage"
                  pageSizeParam="coverageZipcodePageSize"
                  pageSize={10}
                  onSearch={handleOnbaseZipcodes}
                  onSelect={(selected) => {
                    setCoverage("zipcode", {
                      data: selected,
                    });
                    setCoverage("area", {
                      data: selected?.data?.attributes?.area?.data || null,
                    });
                    setCoverage("county", {
                      data: selected?.data?.attributes?.county?.data || null,
                    });
                  }}
                  isMulti={false}
                  isClearable={true}
                  formatSymbols
                  capitalize
                  errors={formState?.errors?.zipcode}
                />
              </div>
              <div className="col-md-3">
                <SearchableSelect
                  name="area"
                  label="Περιοχή"
                  value={coverage.area.data}
                  isDisabled={true}
                  formatSymbols
                  capitalize
                  errors={formState?.errors?.area}
                />
              </div>
              <div className="col-md-3">
                <SearchableSelect
                  name="county"
                  label="Νομός"
                  value={coverage.county.data}
                  isMulti={false}
                  isClearable={true}
                  isDisabled={true}
                  formatSymbols
                  capitalize
                  errors={formState?.errors?.county}
                />
              </div>
            </div>
          )}
          {coverage.onsite && (
            <div className="row mb10">
              <div className="col-md-3">
                <SearchableSelect
                  name="counties"
                  label="Νομοί"
                  labelPlural="νομοί"
                  value={coverage.counties.data}
                  nameParam="name"
                  pageParam="coverageCountiesPage"
                  pageSizeParam="coverageCountiesPageSize"
                  pageSize={10}
                  onSearch={handleOnsiteCounties}
                  onSelect={handleCountiesSelect}
                  isMulti={true}
                  isClearable={true}
                  formatSymbols
                  capitalize
                  errors={formState?.errors?.counties}
                />
              </div>
              <div className="col-md-3">
                <SearchableSelect
                  name="areas"
                  label="Περιοχές"
                  labelPlural="περιοχές"
                  value={coverage.areas.data}
                  nameParam="areaTerm"
                  pageParam="coverageAreasPage"
                  pageSizeParam="coverageAreasPageSize"
                  pageSize={10}
                  onSearch={handleOnsiteAreas}
                  onSelect={(selected) => {
                    setCoverage("areas", {
                      data: selected,
                    });
                  }}
                  isMulti={true}
                  isClearable={true}
                  formatSymbols
                  capitalize
                  key={coverage.counties.data.map((c) => c.id).join("-")}
                  errors={formState?.errors?.areas}
                />
              </div>
            </div>
          )}
        </div>
        <div className="row mb10">
          <div className="col-md-12">
            <SearchableSelect
              name="skills"
              label="Δεξιότητες"
              labelPlural="δεξιότητες"
              value={skills.data}
              nameParam="label"
              pageParam="skillsPage"
              pageSizeParam="skillsPageSize"
              pageSize={10}
              onSearch={handleSkills}
              onSelect={handleSkillsSelect}
              isMulti={true}
              maxSelections={5}
              isClearable={true}
              formatSymbols
              capitalize
              errors={formState?.errors?.skills}
              isDisabled={!isCategorySelected || !isSubcategorySelected}
              resetDependency={category.data?.id}
            />
          </div>
        </div>
        <div className="col-md-3 mb20">
          <SearchableSelect
            name="specialization"
            label="Εξειδίκευση"
            labelPlural="εξειδικεύσεις"
            value={specialization.data || null}
            staticOptions={specializations}
            onSelect={handleSpecializationSelect}
            isMulti={false}
            isClearable={true}
            formatSymbols
            capitalize
            errors={formState?.errors?.specialization}
            isDisabled={skills?.data?.length === 0}
            resetDependency={
              skills.data ? skills.data.map((s) => s.id).join("-") : "none"
            }
          />
        </div>

        <label className="form-label fw700 dark-color mb10">Υπηρεσία</label>
        <div className="row">
          <div className="mb10 col-sm-2">
            <InputB
              label="Εργατοώρα"
              id="rate"
              name="rate"
              type="number"
              min={10}
              max={50000}
              value={rate}
              onChange={setRate}
              className="form-control input-group"
              append="€"
              formatSymbols
              errors={formState?.errors?.rate}
            />
          </div>
          <div className="mb10 col-sm-3">
            <InputB
              label="Έτος έναρξης δραστηριότητας"
              id="commencement"
              name="commencement"
              type="number"
              min={1900}
              max={2025}
              value={commencement}
              onChange={setCommencement}
              className="form-control input-group"
              formatSymbols
              errors={formState?.errors?.commencement}
            />
          </div>
        </div>

        {formState?.errors && (
          <Alert
            type="error"
            message={formState.errors?.submit}
            className="mt-3"
          />
        )}

        {formState?.message && !formState?.errors?.submit && (
          <Alert type="success" message={formState.message} className="mt-3" />
        )}

        <SaveButton
          orientation="end"
          isPending={isPending}
          hasChanges={hasChanges}
        />
      </div>
    </form>
  );
}
