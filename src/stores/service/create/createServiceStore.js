import { create } from 'zustand';

import useAddonsStore from './addonsStore';
import useFaqStore from './faqStore';
import useGalleryStore from './galleryStore';
import useInfoStore from './infoStore';
import usePackagesStore from './packagesStore';
import resetStores from './resetStores';
import useSaveServiceStore from './saveServiceStore';
import useStepsStore from './stepsStore';
import useTypeStore from './typeStore';

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
