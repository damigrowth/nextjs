'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import { Building, Home, AlertCircle } from 'lucide-react';

// Form context
import { useFormContext, useWatch } from 'react-hook-form';
import type { CreateServiceInput } from '@/lib/validations/service';

export default function OnsiteOnbaseStep() {
  const form = useFormContext<CreateServiceInput>();
  const { setValue, formState } = form;

  // Use useWatch for reactive form field watching
  const typeValues = useWatch({ name: 'type', control: form.control });

  // Get validation errors
  const typeError = formState.errors?.type?.message;

  // Get current selection
  const selectedLocation = typeValues?.onbase
    ? 'onbase'
    : typeValues?.onsite
      ? 'onsite'
      : null;

  const handleSelection = (locationType: 'onbase' | 'onsite') => {
    // Reset all type flags and set the selected one, preserving presence=true
    setValue(
      'type',
      {
        presence: true, // This step is only for presence services
        online: false,
        onbase: locationType === 'onbase',
        onsite: locationType === 'onsite',
        oneoff: false, // Reset online sub-options
        subscription: false, // Reset online sub-options
      },
      { shouldValidate: true },
    );
  };

  return (
    <>
      <div className='grid md:grid-cols-2 gap-6'>
        {/* Own Space Option */}
        <Card
          className={`p-6 cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${
            selectedLocation === 'onbase'
              ? 'border-green-500 bg-green-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleSelection('onbase')}
        >
          <div className='flex flex-col items-center text-center space-y-4'>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                selectedLocation === 'onbase'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Building className='w-8 h-8' />
            </div>

            <div>
              <h3
                className={`text-lg font-semibold ${
                  selectedLocation === 'onbase'
                    ? 'text-green-900'
                    : 'text-gray-900'
                }`}
              >
                Στον χώρο μου
              </h3>
              <p
                className={`text-sm mt-2 ${
                  selectedLocation === 'onbase'
                    ? 'text-green-700'
                    : 'text-gray-600'
                }`}
              >
                Ο πελάτης έρχεται στον χώρο σας (γραφείο, κατάστημα, εργαστήριο,
                κτλ.)
              </p>
            </div>

            {/* Features List */}
            <div
              className={`text-xs space-y-1 ${
                selectedLocation === 'onbase'
                  ? 'text-green-600'
                  : 'text-gray-500'
              }`}
            >
              <div>✓ Ελεγχόμενο περιβάλλον</div>
              <div>✓ Δικός σας εξοπλισμός</div>
              <div>✓ Χαμηλότερο κόστος μετακίνησης</div>
            </div>

            {selectedLocation === 'onbase' && (
              <div className='flex items-center text-green-600 text-sm font-medium'>
                <span>Επιλεγμένο</span>
              </div>
            )}
          </div>
        </Card>

        {/* Client Space Option */}
        <Card
          className={`p-6 cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${
            selectedLocation === 'onsite'
              ? 'border-green-500 bg-green-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleSelection('onsite')}
        >
          <div className='flex flex-col items-center text-center space-y-4'>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                selectedLocation === 'onsite'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Home className='w-8 h-8' />
            </div>

            <div>
              <h3
                className={`text-lg font-semibold ${
                  selectedLocation === 'onsite'
                    ? 'text-green-900'
                    : 'text-gray-900'
                }`}
              >
                Στον χώρο του πελάτη
              </h3>
              <p
                className={`text-sm mt-2 ${
                  selectedLocation === 'onsite'
                    ? 'text-green-700'
                    : 'text-gray-600'
                }`}
              >
                Επισκέπτεστε τον πελάτη στον χώρο του (σπίτι, γραφείο,
                επιχείρηση)
              </p>
            </div>

            {/* Features List */}
            <div
              className={`text-xs space-y-1 ${
                selectedLocation === 'onsite'
                  ? 'text-green-600'
                  : 'text-gray-500'
              }`}
            >
              <div>✓ Ευκολία για τον πελάτη</div>
              <div>✓ Εξοικείωση με το περιβάλλον</div>
              <div>✓ Υψηλότερες τιμές</div>
            </div>

            {selectedLocation === 'onsite' && (
              <div className='flex items-center text-green-600 text-sm font-medium'>
                <span>Επιλεγμένο</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
