"use client";

import { reviewReaction } from "@/lib/review/reaction";
import React, { useState } from "react";
import { useFormState } from "react-dom";

function ReactionButton({ type, formData, setFormData }) {
  const handleReaction = () => {
    setFormData((prevFormData) => {
      let newLikes = [...prevFormData.likes];
      let newDislikes = [...prevFormData.dislikes];

      if (type === "like") {
        if (prevFormData.likes.includes(prevFormData.uid)) {
          newLikes = newLikes.filter((id) => id !== prevFormData.uid);
        } else {
          newLikes.push(prevFormData.uid);
          newDislikes = newDislikes.filter((id) => id !== prevFormData.uid);
        }
      } else if (type === "dislike") {
        if (prevFormData.dislikes.includes(prevFormData.uid)) {
          newDislikes = newDislikes.filter((id) => id !== prevFormData.uid);
        } else {
          newDislikes.push(prevFormData.uid);
          newLikes = newLikes.filter((id) => id !== prevFormData.uid);
        }
      }

      return {
        ...prevFormData,
        likes: newLikes,
        dislikes: newDislikes,
        type: type === prevFormData.type ? "" : type,
      };
    });
  };
  return (
    <button onClick={handleReaction}>
      <i
        className={
          type === "like"
            ? `fas fa-thumbs-up ${
                formData.likes.includes(formData.uid) ? "reacted_on_like" : ""
              }`
            : `fas fa-thumbs-down ${
                formData.dislikes.includes(formData.uid)
                  ? "reacted_on_dislike"
                  : ""
              }`
        }
      />
      <span className="review_reactions_counter">
        {type === "like" ? formData.likes.length : formData.dislikes.length}
      </span>
      <span>{type === "like" ? "Θετικά" : "Αρνητικά"}</span>
    </button>
  );
}

export default function ReviewReactionsForm({ data }) {
  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction] = useFormState(reviewReaction, initialState);

  const [formData, setFormData] = useState({
    ...data,
    type: "",
  });

  // console.log("formData", formData);

  return (
    <form action={formAction} className="review_reactions d-flex">
      <input
        hidden
        readOnly
        type="text"
        id="reactions"
        name="reactions"
        value={JSON.stringify(formData)}
      />
      <ReactionButton
        type="like"
        formData={formData}
        setFormData={setFormData}
      />
      <ReactionButton
        type="dislike"
        formData={formData}
        setFormData={setFormData}
      />
    </form>
  );
}
