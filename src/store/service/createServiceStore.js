import { create } from "zustand";
import useStepsStore from "./stepsStore";
import useInfoStore from "./infoStore";
import usePackagesStore from "./packagesStore";
import useAddonsStore from "./addonsStore";
import useFaqStore from "./faqStore";
import useSaveServiceStore from "./saveServiceStore";
import useGalleryStore from "./galleryStore";

//TODO Create freelancer id and status and city

const useCreateServiceStore = create((set) => ({
  ...useStepsStore(set),
  ...useInfoStore(set),
  ...usePackagesStore(set),
  ...useAddonsStore(set),
  ...useFaqStore(set),
  ...useGalleryStore(set),
  ...useSaveServiceStore(set),
}));

export default useCreateServiceStore;
