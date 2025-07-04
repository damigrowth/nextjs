'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';

import {
  SAVE_FREELANCER,
  SAVE_SERVICE,
  SAVED_FREELANCER,
  SAVED_SERVICE,
  UNSAVE_FREELANCER,
  UNSAVE_SERVICE,
} from '@/lib/graphql';
import { revalidateSaved } from '@/actions/shared/save';
import { IconHeart } from '@/components/icon/fa';

export default function SaveForm({
  type,
  id,
  showDelete = false,
  className = '',
  variant = 'heart',
  isAuthenticated = false,
  initialSavedStatus = null, // Prop to skip individual queries
}) {
  const router = useRouter();

  const [optimisticSaved, setOptimisticSaved] = useState(false);

  const QUERY = type === 'service' ? SAVED_SERVICE : SAVED_FREELANCER;

  const variables =
    type === 'service' ? { serviceId: id } : { freelancerId: id };

  // Skip individual query if savedStatus is provided from context
  const skipQuery = initialSavedStatus !== null;

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(QUERY, {
    variables,
    skip: !id || skipQuery, // Skip query if we have saved status from context
    fetchPolicy: 'cache-first',
  });

  const [saveItem] = useMutation(
    type === 'service' ? SAVE_SERVICE : SAVE_FREELANCER,
    {
      onCompleted: () => {
        // Only refetch if we're using the individual query
        if (!skipQuery) {
          refetch();
        }
      },
    },
  );

  const [unsaveItem] = useMutation(
    type === 'service' ? UNSAVE_SERVICE : UNSAVE_FREELANCER,
    {
      onCompleted: () => {
        // Only refetch if we're using the individual query
        if (!skipQuery) {
          refetch();
        }
      },
    },
  );

  useEffect(() => {
    if (skipQuery && initialSavedStatus !== null) {
      // Use provided saved status from context
      setOptimisticSaved(!!initialSavedStatus);
    } else if (data) {
      // Use data from individual query
      const saved =
        type === 'service'
          ? data.checkSavedService?.isSaved
          : data.checkSavedFreelancer?.isSaved;

      setOptimisticSaved(!!saved);
    }
  }, [data, type, skipQuery, initialSavedStatus]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
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
      console.error('Save error:', error);
    }
  };

  const isLoading = skipQuery ? false : queryLoading;

  // Use saved status based on the data source
  const displaySaved = skipQuery 
    ? optimisticSaved 
    : (data ? optimisticSaved : false);

  const renderContent = () => {
    if (variant === 'heart') {
      return (
        <IconHeart
          type={displaySaved ? 'solid' : 'regular'}
          className={`${displaySaved ? 'ui-fav-active' : ''} ${isLoading ? 'opacity-75' : ''}`}
        />
      );
    }

    return (
      <div
        className={`share-save-widget d-flex align-items-center ml15 ${
          displaySaved ? 'active' : ''
        }`}
      >
        <div
          className={`icon dark-color fz12 mr10 ${displaySaved ? 'ui-fav-active' : ''}`}
        >
          <IconHeart
            type={displaySaved ? 'solid' : 'regular'}
            style={{ marginBottom: '1px' }}
          />
        </div>

        <div className='h6 mb-0'>
          {displaySaved ? 'Αποθηκεύτηκε' : 'Αποθήκευση'}
        </div>
      </div>
    );
  };

  if (showDelete) {
    return (
      <div className='save-button-form'>
        <button
          type='button'
          onClick={handleSave}
          disabled={isLoading}
          className='listing-fav fz12 btn relative'
          style={{ zIndex: 5 }}
        >
          <span
            className={`flaticon-delete ${isLoading ? 'opacity-75' : ''}`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className={variant === 'heart' ? 'save-button-form' : ''}>
      <button
        type='button'
        onClick={handleSave}
        disabled={isLoading}
        className={`${
          variant === 'heart'
            ? `listing-fav fz12 btn ${displaySaved ? 'ui-fav-active' : ''}`
            : 'btn-none'
        } ${className} ${isLoading ? 'opacity-50 pe-none' : ''}`}
        style={{ zIndex: 5 }}
      >
        {renderContent()}
      </button>
    </div>
  );
}