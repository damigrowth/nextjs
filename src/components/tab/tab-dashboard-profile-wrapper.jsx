'use client';

import React, { useEffect } from 'react';

// import { updateFreelancerStatus } from '@/actions';
import useEditProfileStore from '@/stores/dashboard/profile';

export default function TabWrapper({ children, freelancer }) {
  const { currentTab, setProfile } = useEditProfileStore();

  // const isActivating = useRef(false);

  // const prevStatus = useRef(freelancer.status?.data?.id);

  // Keep the original setProfile effect unchanged
  useEffect(() => {
    setProfile(freelancer);
  }, [freelancer, setProfile]);

  // Remove the old activation logic and replace it with the new activation logic in /dashboard/start
  // Old activation logic
  // useEffect(() => {
  //   const isTypeUser = freelancer.type?.data?.attributes?.slug === 'user';

  //   const requiredFieldsFilled = () => {
  //     if (isTypeUser) {
  //       return Boolean(
  //         freelancer.displayName &&
  //           freelancer.email &&
  //           freelancer.image?.data?.id,
  //       );
  //     } else {
  //       return Boolean(
  //         freelancer.displayName &&
  //           freelancer.email &&
  //           freelancer.coverage &&
  //           (freelancer.coverage.online ||
  //             freelancer.coverage.onbase ||
  //             freelancer.coverage.onsite) &&
  //           freelancer.category?.data?.id &&
  //           freelancer.subcategory?.data?.id &&
  //           freelancer.image?.data?.id,
  //       );
  //     }
  //   };

  //   const shouldActivate =
  //     requiredFieldsFilled() &&
  //     freelancer.status?.data?.id !== 1 &&
  //     !isActivating.current;

  //   if (shouldActivate) {
  //     isActivating.current = true;

  //     const activate = async () => {
  //       try {
  //         console.log('Updating status...');
  //         await updateFreelancerStatus(freelancer.id);
  //         prevStatus.current = 1;
  //       } catch (error) {
  //         console.error('Activation failed:', error);
  //       } finally {
  //         isActivating.current = false;
  //       }
  //     };

  //     activate();
  //   }
  // }, [
  //   freelancer.id,
  //   freelancer.status?.data?.id,
  //   freelancer.displayName,
  //   freelancer.email,
  //   freelancer.coverage?.online,
  //   freelancer.coverage?.onbase,
  //   freelancer.coverage?.onsite,
  //   freelancer.category?.data?.id,
  //   freelancer.subcategory?.data?.id,
  //   freelancer.image?.data?.id,
  // ]);

  // Rest of the component remains the same
  const [navigation, content] = React.Children.toArray(children);

  const tabs = React.Children.toArray(content.props.children);

  const currentContent = tabs.find(
    (tab) => tab.props['data-tab'] === currentTab.toString(),
  );

  return (
    <div className='navtab-style1'>
      {navigation}
      {currentContent}
    </div>
  );
}
