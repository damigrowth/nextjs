import { create } from "zustand";
import useStepsStore from "./stepsStore";
import useInfoStore from "./infoStore";
import usePackagesStore from "./packagesStore";
import useAddonsStore from "./addonsStore";
import useFaqStore from "./faqStore";
import useSaveServiceStore from "./saveServiceStore";
import useGalleryStore from "./galleryStore";
import useTypeStore from "./typeStore";
import resetStores from "./resetStores";

const useCreateServiceStore = create((set) => ({
  ...useStepsStore(set),
  ...useTypeStore(set),
  ...useInfoStore(set),
  ...usePackagesStore(set),
  ...useAddonsStore(set),
  ...useFaqStore(set),
  ...useGalleryStore(set),
  ...useSaveServiceStore(set),
  ...resetStores(set),
}));

export default useCreateServiceStore;
