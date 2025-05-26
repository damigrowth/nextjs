"use client";

import { useQuery, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import {
  SAVED_SERVICE,
  SAVED_FREELANCER,
  SAVE_SERVICE,
  SAVE_FREELANCER,
  UNSAVE_SERVICE,
  UNSAVE_FREELANCER,
} from "@/lib/graphql/mutations";
import { revalidateSaved } from "@/lib/save";
import { useRouter } from "next/navigation";

export default function SaveForm({
  type,
  id,
  showDelete = false,
  className = "",
  variant = "heart",
  isAuthenticated = false,
}) {
  const router = useRouter();

  const [optimisticSaved, setOptimisticSaved] = useState(false);
  const QUERY = type === "service" ? SAVED_SERVICE : SAVED_FREELANCER;
  const variables =
    type === "service" ? { serviceId: id } : { freelancerId: id };

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(QUERY, {
    variables,
    skip: !id,
    fetchPolicy: "cache-first",
  });

  const [saveItem] = useMutation(
    type === "service" ? SAVE_SERVICE : SAVE_FREELANCER,
    {
      onCompleted: () => refetch(),
    }
  );
  const [unsaveItem] = useMutation(
    type === "service" ? UNSAVE_SERVICE : UNSAVE_FREELANCER,
    {
      onCompleted: () => refetch(),
    }
  );

  useEffect(() => {
    if (data) {
      const saved =
        type === "service"
          ? data.checkSavedService?.isSaved
          : data.checkSavedFreelancer?.isSaved;
      setOptimisticSaved(!!saved);
    }
  }, [data, type]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return; // Important: exit the function early
    }
    const previousState = optimisticSaved;
    setOptimisticSaved(!previousState);

    try {
      if (previousState) {
        await unsaveItem({ variables });
      } else {
        await saveItem({ variables });
      }

      await revalidateSaved(type, id);
    } catch (error) {
      setOptimisticSaved(previousState);
      console.error("Save error:", error);
    }
  };

  const isLoading = queryLoading;
  const displaySaved = data ? optimisticSaved : false;

  const renderContent = () => {
    if (variant === "heart") {
      return (
        <span
          className={`${
            displaySaved ? "fas fa-heart ui-fav-active" : "far fa-heart"
          } ${isLoading ? "opacity-75" : ""}`}
        />
      );
    }

    return (
      <div
        className={`share-save-widget d-flex align-items-center ml15 ${
          displaySaved ? "active" : ""
        }`}
      >
        <span
          className={`icon dark-color fz12 mr10 ${
            displaySaved ? "fas fa-heart ui-fav-active" : "far fa-heart"
          }`}
        />
        <div className="h6 mb-0">
          {displaySaved ? "Αποθηκεύτηκε" : "Αποθήκευση"}
        </div>
      </div>
    );
  };

  if (showDelete) {
    return (
      <div className="save-button-form">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="listing-fav fz12 btn relative"
          style={{ zIndex: 5 }}
        >
          <span
            className={`flaticon-delete ${isLoading ? "opacity-75" : ""}`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className={variant === "heart" ? "save-button-form" : ""}>
      <button
        type="button"
        onClick={handleSave}
        disabled={isLoading}
        className={`${
          variant === "heart"
            ? `listing-fav fz12 btn ${displaySaved ? "ui-fav-active" : ""}`
            : "btn-none"
        } ${className} ${isLoading ? "opacity-50 pe-none" : ""}`}
        style={{ zIndex: 5 }}
      >
        {renderContent()}
      </button>
    </div>
  );
}
