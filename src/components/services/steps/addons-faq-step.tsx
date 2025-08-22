'use client';

import React, { useState, useEffect } from 'react';

// Standard shadcn/ui imports
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormButton } from "@/components/shared";

// Custom components
import { Currency } from '@/components/ui/currency';

// Icons
import { AlertCircle, Plus, Trash2, HelpCircle, Package } from 'lucide-react';

// Form context
import { useFormContext } from 'react-hook-form';

// Types
import type { CreateServiceInput } from '@/lib/validations/service';

export default function AddonsFaqStep() {
  const form = useFormContext<CreateServiceInput>();
  const { register, watch, setValue, formState, trigger } = form;

  // Local state
  const [activeTab, setActiveTab] = useState('addons');

  // Get current values
  const addons = watch('addons') || [];
  const faq = watch('faq') || [];
  const errors = formState.errors;

  // Force re-render when arrays change
  useEffect(() => {
    trigger(['addons', 'faq']);
  }, [addons.length, faq.length, trigger]);

  // Add new addon
  const handleAddAddon = () => {
    const currentAddons = addons || [];
    const newAddons = [
      ...currentAddons,
      {
        title: '',
        description: '',
        price: 0,
      },
    ];
    setValue('addons', newAddons, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  // Add new FAQ
  const handleAddFaq = () => {
    const currentFaq = faq || [];
    const newFaq = [
      ...currentFaq,
      {
        question: '',
        answer: '',
      },
    ];
    setValue('faq', newFaq, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  // Remove addon
  const removeAddon = (index: number) => {
    const currentAddons = addons || [];
    const newAddons = currentAddons.filter((_, i) => i !== index);
    setValue('addons', newAddons, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  // Remove FAQ
  const removeFaq = (index: number) => {
    const currentFaq = faq || [];
    const newFaq = currentFaq.filter((_, i) => i !== index);
    setValue('faq', newFaq, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  return (
    <>
      <div className='text-center mb-6'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Επιπλέον υπηρεσίες & Συχνές ερωτήσεις
        </h3>
        <p className='text-sm text-gray-600 mt-2'>
          Προσθέστε επιπλέον υπηρεσίες και απαντήστε σε συχνές ερωτήσεις
          (προαιρετικό)
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='addons' className='flex items-center space-x-2'>
            <Package className='w-4 h-4' />
            <span>Επιπλέον υπηρεσίες</span>
            {addons.length > 0 && (
              <span className='ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full'>
                {addons.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value='faq' className='flex items-center space-x-2'>
            <HelpCircle className='w-4 h-4' />
            <span>Συχνές ερωτήσεις</span>
            {faq.length > 0 && (
              <span className='ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full'>
                {faq.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='addons' className='space-y-6'>
          <div className='text-center'>
            <h4 className='text-base font-medium text-gray-900'>
              Επιπλέον υπηρεσίες
            </h4>
            <p className='text-sm text-gray-600 mt-1'>
              Προσθέστε έως 3 επιπλέον υπηρεσίες που μπορείτε να προσφέρετε
            </p>
          </div>

          {addons.length === 0 ? (
            <div className='text-center py-12 border-2 border-dashed border-gray-200 rounded-lg'>
              <Package className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <h4 className='text-lg font-medium text-gray-900 mb-2'>
                Δεν έχετε προσθέσει επιπλέον υπηρεσίες
              </h4>
              <p className='text-gray-600 mb-6'>
                Προσθέστε επιπλέον υπηρεσίες για να αυξήσετε την αξία της
                προσφοράς σας
              </p>
              <Button
                type='button'
                onClick={handleAddAddon}
                className='flex items-center space-x-2 place-self-center'
              >
                <Plus className='w-4 h-4' />
                <span>Προσθήκη επιπλέον υπηρεσίας</span>
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              {addons.map((addon, index) => (
                <Card key={index} className='relative'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-base'>
                        Επιπλέον υπηρεσία #{index + 1}
                      </CardTitle>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => removeAddon(index)}
                        className='text-red-600 hover:text-red-700 hover:bg-red-50'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {/* Addon Title */}
                    <FormField
                      control={form.control}
                      name={`addons.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Τίτλος*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='π.χ. Επιπλέον αναθεώρηση'
                              maxLength={100}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.slice(0, 100);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <div className='text-sm text-gray-500'>
                            {field.value?.length || 0}/100 χαρακτήρες
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Addon Description */}
                    <FormField
                      control={form.control}
                      name={`addons.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Περιγραφή*</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Περιγράψτε την επιπλέον υπηρεσία...'
                              rows={3}
                              maxLength={500}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.slice(0, 500);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <div className='text-sm text-gray-500'>
                            {field.value?.length || 0}/500 χαρακτήρες
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Addon Price */}
                    <FormField
                      control={form.control}
                      name={`addons.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Τιμή*</FormLabel>
                          <FormControl>
                            <Currency
                              currency='€'
                              position='right'
                              placeholder='π.χ. 20'
                              min={1}
                              max={5000}
                              allowDecimals={false}
                              value={field.value || 0}
                              onValueChange={(value) => {
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}

              {/* Add Another Addon Button */}
              {addons.length < 3 && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleAddAddon}
                  className='w-full flex items-center space-x-2'
                >
                  <Plus className='w-4 h-4' />
                  <span>Προσθήκη άλλης επιπλέον υπηρεσίας</span>
                </Button>
              )}

              {addons.length >= 3 && (
                <p className='text-sm text-gray-500 text-center'>
                  Μπορείτε να προσθέσετε έως 3 επιπλέον υπηρεσίες
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value='faq' className='space-y-6'>
          <div className='text-center'>
            <h4 className='text-base font-medium text-gray-900'>
              Συχνές ερωτήσεις
            </h4>
            <p className='text-sm text-gray-600 mt-1'>
              Προσθέστε έως 5 συχνές ερωτήσεις και απαντήσεις
            </p>
          </div>

          {faq.length === 0 ? (
            <div className='text-center py-12 border-2 border-dashed border-gray-200 rounded-lg'>
              <HelpCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <h4 className='text-lg font-medium text-gray-900 mb-2'>
                Δεν έχετε προσθέσει συχνές ερωτήσεις
              </h4>
              <p className='text-gray-600 mb-6'>
                Προσθέστε συχνές ερωτήσεις για να βοηθήσετε τους πελάτες σας
              </p>
              <Button
                type='button'
                onClick={handleAddFaq}
                className='flex items-center space-x-2 place-self-center'
              >
                <Plus className='w-4 h-4' />
                <span>Προσθήκη ερώτησης</span>
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              {faq.map((item, index) => (
                <Card key={index} className='relative'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-base'>
                        Ερώτηση #{index + 1}
                      </CardTitle>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => removeFaq(index)}
                        className='text-red-600 hover:text-red-700 hover:bg-red-50'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {/* FAQ Question */}
                    <FormField
                      control={form.control}
                      name={`faq.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ερώτηση*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='π.χ. Πόσο χρόνο χρειάζεται για την ολοκλήρωση;'
                              maxLength={200}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.slice(0, 200);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <div className='text-sm text-gray-500'>
                            {field.value?.length || 0}/200 χαρακτήρες
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* FAQ Answer */}
                    <FormField
                      control={form.control}
                      name={`faq.${index}.answer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Απάντηση*</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Δώστε μια αναλυτική απάντηση...'
                              rows={4}
                              maxLength={1000}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.slice(0, 1000);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <div className='text-sm text-gray-500'>
                            {field.value?.length || 0}/1000 χαρακτήρες
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}

              {/* Add Another FAQ Button */}
              {faq.length < 5 && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleAddFaq}
                  className='w-full flex items-center space-x-2'
                >
                  <Plus className='w-4 h-4' />
                  <span>Προσθήκη άλλης ερώτησης</span>
                </Button>
              )}

              {faq.length >= 5 && (
                <p className='text-sm text-gray-500 text-center'>
                  Μπορείτε να προσθέσετε έως 5 συχνές ερωτήσεις
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
