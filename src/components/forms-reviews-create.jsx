"use client";

import { createReview } from "@/lib/review/create";
import { useActionState, useCallback, useState } from "react";
import ReviewSuccess from "../Reviews/ReviewSuccess";
import Rating from "../rating/Rating";
import TextArea from "@/components/inputs/TextArea";
import Alert from "../alerts/Alert";
import SaveButton from "../buttons/SaveButton";
import { SERVICES_BY_FREELANCER_FOR_REVIEWS } from "@/lib/graphql/queries/main/service";
import { normalizeQuery } from "@/utils/queries";
import { searchData } from "@/lib/client/operations";
import SearchableSelect from "../Archives/Inputs/SearchableSelect";
import { normalizeTerm } from "@/utils/normalizeTerm";

export default function AddModelReviewForm({ type, serviceId, freelancerId }) {
  const initialFormData = {
    type: type,
    service:
      type === "service"
        ? { id: serviceId, label: "", value: "" }
        : {
            id: "",
            label: "",
            value: "",
          },
    receiver: freelancerId,
    rating: 1,
    comment: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  // Using useActionState instead of useFormState
  const [formState, formAction, isPending] = useActionState(
    createReview,
    initialState
  );

  const handleRatingChange = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      rating: value,
    }));
  };

  const handleCommentChange = (text) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      comment: text,
    }));
  };

  const handleSubmit = () => {
    const reviewData = new FormData();
    reviewData.append("newReviewData", JSON.stringify(formData));
    return formAction(reviewData);
  };

  const reviewId = formState?.data?.id;

  // Check if form has changes compared to initial state
  const hasChanges =
    formData.rating !== initialFormData.rating ||
    formData.comment !== initialFormData.comment ||
    (type !== "service" && formData.service.id !== "");

  const handleServices = useCallback(async (searchTerm, page = 1) => {
    const query = normalizeQuery(SERVICES_BY_FREELANCER_FOR_REVIEWS);
    const data = await searchData({
      query,
      searchTerm: normalizeTerm(searchTerm),
      searchTermType: "title",
      page,
      additionalVariables: {
        id: freelancerId,
        page: page,
        pageSize: 10,
      },
    });

    return data;
  }, []);

  const handleServiceSelect = (selected) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      service: {
        id: selected ? selected.id : "",
        label: selected ? selected.data.attributes.title : "",
        value: selected ? selected.id : "",
      },
    }));
  };

  return (
    <>
      {reviewId ? (
        <ReviewSuccess id={reviewId} />
      ) : (
        <div className="bsp_reveiw_wrt p30 mt40 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
          <form action={handleSubmit} className="comments_form mt30 mb30-md">
            <h6 className="fz17">Προσθήκη	 Αξιολόγησης</h6>
            {type === "freelancer" && (
              <>
                <p className="text">
                  Θα πρέπει να έχετε επιλέξετε μία από τις υπηρεσίες για να
                  βάλετε βαθμολογία.
                </p>
                <div className="mb20 col-md-12">
                  <SearchableSelect
                    name="service"
                    label="Υπηρεσία"
                    labelPlural="υπηρεσίες"
                    value={formData.service}
                    nameParam="title"
                    pageParam="page"
                    pageSizeParam="pageSize"
                    pageSize={10}
                    maxSelections={1}
                    onSearch={handleServices}
                    onSelect={handleServiceSelect}
                    isMulti={false}
                    isClearable={true}
                  />
                </div>{" "}
              </>
            )}

            <div className="mb10">
              <h6>Βαθμολογία</h6>
              <Rating
                count={5}
                value={formData.rating}
                half={false}
                onChange={handleRatingChange}
                size={24}
                color1={"#6b7177"}
                color2={"#e1c03f"}
              />
              {formState?.errors?.rating && (
                <div className="text-danger small mt-1">
                  {formState.errors.rating}
                </div>
              )}
            </div>
            <div className="row">
              <div className="col-md-12">
                <TextArea
                  label="Αξιολόγηση"
                  id="comment"
                  name="comment"
                  minLength={25}
                  maxLength={350}
                  counter
                  disabled={isPending}
                  errors={formState?.errors?.comment}
                  value={formData.comment}
                  defaultValue={formData.comment}
                  onChange={(formattedValue) =>
                    handleCommentChange(formattedValue)
                  }
                  capitalize
                />
              </div>

              {formState?.errors &&
                Object.keys(formState.errors).length > 0 && (
                  <div className="col-md-12">
                    <Alert
                      type="error"
                      message={
                        <div>
                          {formState.errors.submit && (
                            <div>{formState.errors.submit}</div>
                          )}
                          {formState.errors.service && (
                            <div>{formState.errors.service}</div>
                          )}
                          {formState.errors.rating && (
                            <div>{formState.errors.rating}</div>
                          )}
                          {formState.errors.comment && (
                            <div>{formState.errors.comment}</div>
                          )}
                        </div>
                      }
                      className="mt-3"
                    />
                  </div>
                )}

              {formState?.message &&
                (!formState?.errors ||
                  Object.keys(formState.errors).length === 0) && (
                  <div className="col-md-12">
                    <Alert
                      type="success"
                      message={formState.message}
                      className="mt-3"
                    />
                  </div>
                )}

              <SaveButton
                isPending={isPending}
                icon="fa-solid fa-paper-plane"
                defaultText="Δημοσίευση Αξιολόγησης"
                hasChanges={hasChanges}
              />
            </div>
          </form>
        </div>
      )}
    </>
  );
}
