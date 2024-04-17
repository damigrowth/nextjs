import { create } from "zustand";
import useInfoStore from "./infoStore";
import usePackagesStore from "./packagesStore";
import useAddonsStore from "./addonsStore";
import useFaqStore from "./faqStore";
import useSaveServiceStore from "./saveServiceStore";

//TODO Create freelancer id and status and city

const useCreateServiceStore = create((set) => ({
  ...useInfoStore(set),
  ...usePackagesStore(set),
  ...useAddonsStore(set),
  ...useFaqStore(set),
  ...useSaveServiceStore(set),
}));

export default useCreateServiceStore;
