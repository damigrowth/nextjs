'use client';

import React from 'react';
import { useWatch } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import { MapPin, Globe, AlertCircle } from 'lucide-react';

// Form context
import { useFormContext } from 'react-hook-form';
import type { CreateServiceInput } from '@/lib/validations/service';

export default function PresenceOnlineStep() {
  const form = useFormContext<CreateServiceInput>();
  const { setValue, formState } = form;

  // Use useWatch for reactive form field watching
  const presenceValue = useWatch({
    name: 'type.presence',
    control: form.control,
  });
  const onlineValue = useWatch({ name: 'type.online', control: form.control });

  // Get current selection
  const selectedType = presenceValue
    ? 'presence'
    : onlineValue
      ? 'online'
      : null;

  // Get validation errors for this step
  const typeError = formState.errors?.type?.message;

  const handleSelection = (type: 'presence' | 'online') => {
    setValue(
      'type',
      {
        presence: type === 'presence',
        online: type === 'online',
        oneoff: false,
        onbase: false,
        subscription: false,
        onsite: false,
      },
      { shouldValidate: true },
    );
  };

  return (
    <>
      <div className='grid md:grid-cols-2 gap-6'>
        {/* Physical Presence Option */}
        <Card
          className={`p-6 cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${
            selectedType === 'presence'
              ? 'border-green-500 bg-green-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleSelection('presence')}
        >
          <div className='flex flex-col items-center text-center space-y-4'>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                selectedType === 'presence'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <MapPin className='w-8 h-8' />
            </div>

            <div>
              <h3
                className={`text-lg font-semibold ${
                  selectedType === 'presence'
                    ? 'text-green-900'
                    : 'text-gray-900'
                }`}
              >
                Φυσική παρουσία
              </h3>
              <p
                className={`text-sm mt-2 ${
                  selectedType === 'presence'
                    ? 'text-green-700'
                    : 'text-gray-600'
                }`}
              >
                Παρέχω την υπηρεσία με φυσική παρουσία
              </p>
            </div>

            {/* Features List */}
            <div
              className={`text-xs space-y-1 ${
                selectedType === 'presence' ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <div>✓ Άμεση επικοινωνία</div>
              <div>✓ Προσωπική εξυπηρέτηση</div>
              <div>✓ Επιτόπια εργασία</div>
            </div>

            {selectedType === 'presence' && (
              <div className='flex items-center text-green-600 text-sm font-medium'>
                <span>Επιλεγμένο</span>
              </div>
            )}
          </div>
        </Card>

        {/* Online Service Option */}
        <Card
          className={`p-6 cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${
            selectedType === 'online'
              ? 'border-green-500 bg-green-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleSelection('online')}
        >
          <div className='flex flex-col items-center text-center space-y-4'>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                selectedType === 'online'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Globe className='w-8 h-8' />
            </div>

            <div>
              <h3
                className={`text-lg font-semibold ${
                  selectedType === 'online' ? 'text-green-900' : 'text-gray-900'
                }`}
              >
                Online/Απομακρυσμένα
              </h3>
              <p
                className={`text-sm mt-2 ${
                  selectedType === 'online' ? 'text-green-700' : 'text-gray-600'
                }`}
              >
                Παρέχω την υπηρεσία online ή απομακρυσμένα
              </p>
            </div>

            {/* Features List */}
            <div
              className={`text-xs space-y-1 ${
                selectedType === 'online' ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <div>✓ Ευελιξία τοποθεσίας</div>
              <div>✓ Μείωση κόστους</div>
              <div>✓ Ψηφιακή παράδοση</div>
            </div>

            {selectedType === 'online' && (
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
