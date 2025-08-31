'use client';

import React, {
  useState,
  useActionState,
  useEffect,
  useRef,
  useTransition,
} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { FormButton } from '@/components/shared';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Icons
import {
  CheckCircle,
  AlertCircle,
  MapPin,
  Globe,
  Building,
  Home,
  RotateCcw,
  Save,
} from 'lucide-react';

// Auth and utilities
import { populateFormData } from '@/lib/utils/form';
import { useToast } from '@/lib/hooks/ui/use-toast';

// Validation schemas
import {
  createServiceSchema,
  presenceOnlineSchema,
  onbaseOnsiteSchema,
  oneoffSubscriptionSchema,
  serviceDetailsSchema,
  addonsAndFaqSchema,
  serviceMediaUploadSchema,
  type CreateServiceInput,
} from '@/lib/validations/service';

// Server actions
import {
  createServiceAction,
  saveServiceAsDraftAction,
} from '@/actions/services/create-service';

// Step components
import {
  PresenceOnlineStep,
  OnsiteOnbaseStep,
  OneoffSubscriptionStep,
  ServiceDetailsStep,
  AddonsFaqStep,
  MediaStep,
} from './steps';
import { AuthUser } from '@/lib/types/auth';

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

// Step validation schemas
const STEP_SCHEMAS = {
  1: presenceOnlineSchema,
  2: onbaseOnsiteSchema.or(oneoffSubscriptionSchema),
  3: serviceDetailsSchema,
  4: addonsAndFaqSchema,
  5: serviceMediaUploadSchema,
} as const;

const STEP_FIELDS: Record<number, (keyof CreateServiceInput)[]> = {
  1: ['type'],
  2: ['type', 'subscriptionType'],
  3: [
    'title',
    'description',
    'category',
    'subcategory',
    'subdivision',
    'tags',
    'price',
    'fixed',
  ],
  4: ['addons', 'faq'],
  5: ['media'],
};

interface CreateServiceFormProps {
  initialUser: AuthUser | null;
}

export default function CreateServiceForm({ initialUser }: CreateServiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Alert dialog states
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // Media upload ref
  const mediaRef = useRef<any>(null);

  // Transition for manual server action calls
  const [isPendingTransition, startTransition] = useTransition();

  // React Hook Form setup with zodResolver like other forms
  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    mode: 'onChange',
    defaultValues: {
      type: {
        presence: false,
        online: false,
        oneoff: false,
        onbase: false,
        subscription: false,
        onsite: false,
      },
      subscriptionType: undefined,
      title: '',
      description: '',
      category: '',
      subcategory: '',
      subdivision: '',
      tags: [],
      price: 0,
      fixed: true,
      duration: undefined,
      addons: [],
      faq: [],
      media: [],
    },
  });

  // Server actions
  const [state, action, isPending] = useActionState(
    createServiceAction,
    initialState,
  );
  const [draftState, draftAction, isDraftPending] = useActionState(
    saveServiceAsDraftAction,
    initialState,
  );

  // Use initialUser prop
  const user = initialUser;
  const isLoading = false; // No loading state needed since user is passed as prop

  const {
    formState: { errors, isValid, isDirty },
    getValues,
    watch,
  } = form;

  // Step navigation helpers
  const isStepCompleted = (step: number): boolean => {
    return completedSteps.includes(step);
  };

  // Watch form values for reactive button state
  const watchedType = watch('type');
  const watchedSubscriptionType = watch('subscriptionType');

  // Check if current step is valid and ready to proceed
  const isCurrentStepValid = (): boolean => {
    const type = watchedType || getValues('type');
    const subscriptionType =
      watchedSubscriptionType || getValues('subscriptionType');

    switch (currentStep) {
      case 1:
        return type.presence || type.online;

      case 2:
        if (type.presence) {
          return type.onbase || type.onsite;
        }
        if (type.online) {
          if (type.subscription) {
            return subscriptionType !== undefined;
          }
          return type.oneoff || type.subscription;
        }
        return false;

      case 3:
        const formValues = getValues();
        return !!(
          formValues.title &&
          formValues.title.length >= 10 &&
          formValues.description &&
          formValues.description.length >= 80 &&
          formValues.category &&
          formValues.subcategory &&
          formValues.subdivision &&
          formValues.tags &&
          formValues.tags.length > 0 &&
          formValues.price &&
          formValues.price > 0
        );

      case 4:
      case 5:
        return true;

      default:
        return false;
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const stepSchema = STEP_SCHEMAS[currentStep as keyof typeof STEP_SCHEMAS];
    const formValues = getValues();

    try {
      stepSchema.parse(formValues);
      form.clearErrors();
      return true;
    } catch (error) {
      if (error.errors) {
        error.errors.forEach((err) => {
          const fieldPath = err.path.join('.');
          form.setError(fieldPath as any, {
            type: 'validation',
            message: err.message,
          });
        });
      }
      return false;
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
    }
  };

  const goNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      const { type, subscriptionType } = getValues();

      // Handle specific logic for subscription type
      if (
        currentStep === 2 &&
        type.subscription &&
        (!subscriptionType || subscriptionType.length === 0)
      ) {
        form.setError('subscriptionType', {
          type: 'manual',
          message: 'Please select at least one subscription type.',
        });
        return;
      }

      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep].sort());
      }

      // Implement conditional step logic
      let nextStep = currentStep + 1;

      if (currentStep === 1) {
        // Step 1 -> Step 2: Only if type.presence OR type.online is true
        if (!type.presence && !type.online) {
          return;
        }
        nextStep = 2;
      } else if (currentStep === 2) {
        // Step 2 -> Step 3: Check if ready to proceed
        if (type.presence && (type.onbase || type.onsite)) {
          nextStep = 3;
        } else if (type.online && (type.oneoff || type.subscription)) {
          // For subscription, ensure subscriptionType is selected
          if (type.subscription && !subscriptionType) {
            return;
          }
          nextStep = 3;
        } else {
          return;
        }
      }

      if (nextStep <= STEPS.length) {
        setCurrentStep(nextStep);
      }
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Get step 2 component based on step 1 selection
  const getStep2Component = () => {
    const typeValues = watch('type');
    if (typeValues?.presence) {
      return <OnsiteOnbaseStep />;
    }
    if (typeValues?.online) {
      return <OneoffSubscriptionStep />;
    }
    // If neither is selected, show a message or default component
    return (
      <div className='text-center text-gray-500'>
        Please select a service type in step 1
      </div>
    );
  };

  const currentStepInfo = STEPS.find((step) => step.id === currentStep);
  const progress = (currentStep / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length;

  // Form submission handler
  const handleFormSubmit = (formData: FormData) => {
    // Handle media uploads if needed (sync operation)
    if (mediaRef.current?.hasFiles()) {
      mediaRef.current.uploadFiles();
    }

    // Get all form values and populate FormData using ENHANCED utility
    const allValues = getValues();

    populateFormData(formData, allValues, {
      stringFields: [
        'title',
        'description',
        'category',
        'subcategory',
        'subdivision',
        'subscriptionType',
      ],
      jsonFields: ['type', 'tags', 'addons', 'faq', 'media'],
      numericFields: ['price', 'duration'],
      booleanFields: ['fixed'],
      skipEmpty: true,
    });

    // Call server action directly (no await)
    action(formData);
  };

  const handleSaveAsDraft = (formData: FormData) => {
    // Handle media uploads if needed (sync operation)
    if (mediaRef.current?.hasFiles()) {
      mediaRef.current.uploadFiles();
    }

    // Get all form values and populate FormData using ENHANCED utility
    const allValues = getValues();

    populateFormData(formData, allValues, {
      stringFields: [
        'title',
        'description',
        'category',
        'subcategory',
        'subdivision',
        'subscriptionType',
      ],
      jsonFields: ['type', 'tags', 'addons', 'faq', 'media'],
      numericFields: ['price', 'duration'],
      booleanFields: ['fixed'],
      skipEmpty: true,
    });

    // Call draft action directly (no await)
    draftAction(formData);
  };

  const handleClearForm = () => {
    form.reset();
    setCurrentStep(1);
    setCompletedSteps([]);
    setShowResetDialog(false);

    // Clear any media uploads if needed
    if (mediaRef.current?.clearFiles) {
      mediaRef.current.clearFiles();
    }
  };

  const handleConfirmDraft = () => {
    // Keep dialog open, start the save process
    startTransition(() => {
      const formData = new FormData();
      handleSaveAsDraft(formData);
    });
  };

  // Handle successful form submission
  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      form.reset();
      setCurrentStep(1);
      setCompletedSteps([]);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state.success, state.message]);

  // Handle draft save response
  useEffect(() => {
    if (draftState.success && draftState.message) {
      // Show success toast
      toast.success('Η υπηρεσία αποθηκεύτηκε ως προσχέδιο επιτυχώς!');

      // Close dialog after a short delay
      setTimeout(() => {
        setShowDraftDialog(false);
        form.reset();
        setCurrentStep(1);
        setCompletedSteps([]);

        // Comment out navigation for now as requested
        // router.push('/dashboard/services?tab=drafts');
      }, 1500);
    } else if (draftState.message && !draftState.success) {
      // Show error toast and close dialog
      toast.error(draftState.message);
      setTimeout(() => {
        setShowDraftDialog(false);
      }, 1000);
    }
  }, [draftState.success, draftState.message]);

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
        return getStep2Component();
      case 3:
        return <ServiceDetailsStep />;
      case 4:
        return <AddonsFaqStep />;
      case 5:
        return <MediaStep user={user} />;
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
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
                  <AlertDialog
                    open={showResetDialog}
                    onOpenChange={setShowResetDialog}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                            disabled={isLoading}
                          >
                            <RotateCcw className='h-4 w-4' />
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Καθαρισμός φόρμας</p>
                      </TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Καθαρισμός φόρμας</AlertDialogTitle>
                        <AlertDialogDescription>
                          Θέλετε να καθαρίσετε όλα τα δεδομένα της φόρμας; Αυτή
                          η ενέργεια δεν μπορεί να αναιρεθεί.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearForm}
                          className='bg-red-600 hover:bg-red-700'
                        >
                          Καθαρισμός
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Save as Draft Button */}
                  <AlertDialog
                    open={showDraftDialog}
                    onOpenChange={setShowDraftDialog}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className={`h-8 w-8 p-0 ${
                              currentStep >= 3
                                ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={
                              currentStep < 3 ||
                              isDraftPending ||
                              isPendingTransition ||
                              isLoading
                            }
                          >
                            {isDraftPending || isPendingTransition ? (
                              <div className='animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full' />
                            ) : (
                              <Save className='h-4 w-4' />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {currentStep >= 3
                            ? 'Αποθήκευση ως προσχέδιο'
                            : 'Διαθέσιμο από το βήμα 3'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Αποθήκευση ως προσχέδιο
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Θέλετε να αποθηκεύσετε την υπηρεσία ως προσχέδιο;
                          Μπορείτε να την επεξεργαστείτε αργότερα.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          disabled={isDraftPending || isPendingTransition}
                        >
                          Ακύρωση
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault();
                            handleConfirmDraft();
                          }}
                          disabled={isDraftPending || isPendingTransition}
                          className='bg-green-600 hover:bg-green-700 disabled:opacity-50'
                        >
                          {isDraftPending || isPendingTransition ? (
                            <>
                              <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2' />
                              Αποθήκευση...
                            </>
                          ) : (
                            'Αποθήκευση'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
              {STEPS.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = isStepCompleted(step.id);
                const isAccessible =
                  step.id <= currentStep || isStepCompleted(step.id);

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
                      {isCompleted ? (
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
                {currentStep === 2 && watch('type')?.presence && (
                  <MapPin className='w-5 h-5' />
                )}
                {currentStep === 2 && watch('type')?.online && (
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
              <div className='space-y-6'>
                {renderStepContent()}
                {/* Step Navigation */}
                <div className='flex justify-between items-center mt-6 pt-6 border-t'>
                  <FormButton
                    type='button'
                    variant='outline'
                    text='Προηγουμένο'
                    onClick={goBack}
                    disabled={currentStep === 1}
                  />
                  <div className='flex gap-3'>
                    {isLastStep ? (
                      <FormButton
                        type='button'
                        text='Δημιουργία υπηρεσίας'
                        loading={isPending || isPendingTransition}
                        disabled={
                          isPending ||
                          isPendingTransition ||
                          !isCurrentStepValid() ||
                          isDraftPending
                        }
                        onClick={() => {
                          startTransition(() => {
                            const formData = new FormData();
                            handleFormSubmit(formData);
                          });
                        }}
                      />
                    ) : (
                      <FormButton
                        type='button'
                        text='Επόμενο'
                        onClick={goNext}
                        disabled={isPending || !isCurrentStepValid()}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </Form>
  );
}
