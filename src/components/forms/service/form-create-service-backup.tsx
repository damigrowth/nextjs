'use client';

import React, { useState, useActionState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { FormButton } from '@/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Icons
import {
  CheckCircle,
  AlertCircle,
  MapPin,
  Globe,
  Building,
  Home,
  Bookmark,
  RotateCcw,
  Save,
} from 'lucide-react';

// Auth and utilities
import { useAuthUser, useAuthLoading } from '@/components/providers/auth';

// Validation schemas
import { createServiceSchema } from '@/lib/validations/service';

// Server actions
import {
  createServiceAction,
  saveServiceAsDraftAction,
} from '@/actions/services/create-service';

// Form utilities
import { populateFormData } from '@/lib/utils/form';

// Store and hooks
import {
  useCreateServiceNavigation,
  useCreateServiceSubmission,
  useCreateServiceReset,
} from '@/lib/stores/createServiceHooks';

// Step components imports will be added here
import {
  PresenceOnlineStep,
  OnsiteOnbaseStep,
  OneoffSubscriptionStep,
  ServiceDetailsStep,
  AddonsFaqStep,
  MediaStep,
} from './steps';

const STEPS = [
  {
    id: 1,
    title: 'Τύπος υπηρεσίας',
    description:
      'Παρέχετε την συγκεκριμένη υπηρεσία, με την φυσική σας παρουσία ή online (απομακρυσμένα);',
  },
  {
    id: 2,
    title: 'Τόπος/Τρόπος παροχής',
    description: 'Καθορίστε πώς θα παρέχετε την υπηρεσία',
  },
  {
    id: 3,
    title: 'Στοιχεία υπηρεσίας',
    description: 'Συμπληρώστε τα βασικά στοιχεία της υπηρεσίας σας',
  },
  {
    id: 4,
    title: 'Επιπλέον υπηρεσίες & FAQ',
    description:
      'Προσθέστε επιπλέον υπηρεσίες και συχνές ερωτήσεις (προαιρετικό)',
  },
  {
    id: 5,
    title: 'Πολυμέσα',
    description: 'Ανεβάστε εικόνες ή βίντεο για την υπηρεσία σας (προαιρετικό)',
  },
];

const initialState = {
  success: false,
  message: '',
};

export default function CreateServiceForm() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  // Use new hooks
  const { currentStep, completedSteps, isStepCompleted, goToStep } =
    useCreateServiceNavigation();
  const { isSubmitting } = useCreateServiceSubmission();
  const { resetForm } = useCreateServiceReset();

  // Server actions
  const [state, action, isPending] = useActionState(
    createServiceAction,
    initialState,
  );
  const [draftState, draftAction, isDraftPending] = useActionState(
    saveServiceAsDraftAction,
    initialState,
  );

  // Auth context
  const user = useAuthUser();
  const isLoading = useAuthLoading();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const currentStepInfo = STEPS.find((step) => step.id === currentStep);
  const progress = (currentStep / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length;

  // These functions are now handled by Zustand hooks
  const handleSaveAsDraft = async () => {
    try {
      const formData = new FormData();
      // Get current form state from Zustand store
      // This implementation will be completed when the store provides a getDraftData method
      if (process.env.NODE_ENV === 'development') {
        console.log('Save as draft - implementing with Zustand store');
      }
      // TODO: Call draftAction with proper form data when store method is ready
      // await draftAction(formData);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Draft save error:', error);
      }
    }
  };

  const handleClearForm = () => {
    if (confirm('Θέλετε να καθαρίσετε όλα τα δεδομένα της φόρμας;')) {
      resetForm();
    }
  };

  // Handle successful form submission
  React.useEffect(() => {
    if (state.success) {
      resetForm();
      // Redirect will be handled by server action
    }
  }, [state.success, resetForm]);

  // Handle successful draft save
  React.useEffect(() => {
    if (draftState.success) {
      resetForm();
      router.push('/dashboard/services?tab=drafts');
    }
  }, [draftState.success, resetForm, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Φόρτωση...</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PresenceOnlineStep />;
      case 2:
        // Determine which step 2 to show based on step 1 selection
        // This will be handled by the step components themselves now
        return <OneoffSubscriptionStep />;
      case 3:
        return <ServiceDetailsStep />;
      case 4:
        return <AddonsFaqStep />;
      case 5:
        return <MediaStep />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className='max-w-4xl mx-auto p-6'>
        {/* Progress Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Δημιουργία Υπηρεσίας
              </h1>
              <p className='text-gray-600 mt-1'>
                Με αυτήν τη φόρμα μπορείτε να προσθέσετε νέες υπηρεσίες.
              </p>
            </div>
            <div className='flex items-center space-x-3'>
              {/* Action Icons */}
              <div className='flex items-center space-x-2'>
                {/* Clear Form Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                      onClick={handleClearForm}
                      disabled={isLoading}
                    >
                      <RotateCcw className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Καθαρισμός φόρμας</p>
                  </TooltipContent>
                </Tooltip>

                {/* Save as Draft Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className={`h-8 w-8 p-0 ${
                        currentStep >= 3 && isStepCompleted(3)
                          ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                      onClick={handleSaveAsDraft}
                      disabled={
                        !(currentStep >= 3 && isStepCompleted(3)) ||
                        isDraftPending ||
                        isLoading
                      }
                    >
                      {isDraftPending ? (
                        <div className='animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full' />
                      ) : (
                        <Save className='h-4 w-4' />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className='bg-gray-800 text-white'>
                    <p>
                      {currentStep >= 3 && isStepCompleted(3)
                        ? 'Αποθήκευση ως προσχέδιο'
                        : 'Συμπληρώστε τουλάχιστον το βήμα 3'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Badge variant='outline' className='text-sm'>
                Βήμα {currentStep} από {STEPS.length}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className='space-y-2'>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Πρόοδος</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className='h-2' />
          </div>

          {/* Steps Navigation */}
          <div className='flex items-center justify-between mt-6 space-x-2'>
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = isHydrated ? isStepCompleted(step.id) : false;
              const isAccessible =
                step.id <= currentStep ||
                (isHydrated && isStepCompleted(step.id));

              return (
                <div
                  key={step.id}
                  className={`flex-1 flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-primary/10 border-2 border-primary/30'
                      : isCompleted
                        ? 'bg-secondary/10 border-2 border-secondary/30'
                        : 'bg-muted border-2 border-border'
                  } ${!isAccessible ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (isAccessible) {
                      goToStep(step.id);
                    }
                  }}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted-foreground text-muted'
                    }`}
                  >
                    {isCompleted && isHydrated ? (
                      <CheckCircle className='w-4 h-4' />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div
                      className={`text-xs font-medium truncate ${
                        isActive
                          ? 'text-primary'
                          : isCompleted
                            ? 'text-secondary'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              {currentStep === 1 && <Globe className='w-5 h-5' />}
              {currentStep === 2 && formData.type?.presence && (
                <MapPin className='w-5 h-5' />
              )}
              {currentStep === 2 && formData.type?.online && (
                <Globe className='w-5 h-5' />
              )}
              {currentStep === 3 && <Building className='w-5 h-5' />}
              {(currentStep === 4 || currentStep === 5) && (
                <Home className='w-5 h-5' />
              )}
              <span>{currentStepInfo?.title}</span>
            </CardTitle>
            <CardDescription>{currentStepInfo?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Show success/error messages */}
            {state.message && state.success && (
              <Alert className='border-green-200 bg-green-50 text-green-800 mb-6'>
                <CheckCircle className='h-4 w-4' />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            {state.message && !state.success && (
              <Alert variant='destructive' className='mb-6'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            {/* Draft save messages */}
            {draftState.message && draftState.success && (
              <Alert className='border-green-200 bg-green-50 text-green-800 mb-6'>
                <CheckCircle className='h-4 w-4' />
                <AlertDescription>{draftState.message}</AlertDescription>
              </Alert>
            )}

            {draftState.message && !draftState.success && (
              <Alert variant='destructive' className='mb-6'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{draftState.message}</AlertDescription>
              </Alert>
            )}

            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Debug info handled by Zustand hooks now */}
      </div>
    </TooltipProvider>
  );
}
