'use client';

import { submitContactForm } from '@/actions/shared/contact';
import React, { useActionState, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { ArrowRightLong } from '@/components/icon/fa';

export default function ContactForm({ form, siteKey }) {
  const [state, formAction, isPending] = useActionState(submitContactForm, {
    success: false,
    message: '',
  });

  const [captcha, setCaptcha] = useState('');

  const handleSubmit = async (formData) => {
    // formData is already a FormData object, so we just append to it directly
    formData.append('captchaToken', captcha);
    await formAction(formData);
  };

  return (
    <>
      <form action={handleSubmit} className='form-style1'>
        <div className='row'>
          <div className='col-md-6'>
            <div className='mb20'>
              <label
                htmlFor='name'
                className='heading-color ff-heading fw500 mb10'
              >
                {form.nameLabel}
              </label>
              <input
                id='name'
                name='name'
                type='text'
                className='form-control'
                placeholder={form.namePlaceholder}
                required
                disabled={isPending}
              />
            </div>
          </div>
          <div className='col-md-6'>
            <div className='mb20'>
              <label
                htmlFor='email'
                className='heading-color ff-heading fw500 mb10'
              >
                {form.emailLabel}
              </label>
              <input
                id='email'
                name='email'
                type='email'
                className='form-control'
                placeholder={form.emailPlaceholder}
                required
                disabled={isPending}
              />
            </div>
          </div>
          <div className='col-md-12'>
            <div className='mb20'>
              <label
                htmlFor='message'
                className='heading-color ff-heading fw500 mb10'
              >
                {form.messageLabel}
              </label>
              <textarea
                id='message'
                name='message'
                cols={30}
                rows={6}
                placeholder={form.messagePlaceholder}
                required
                disabled={isPending}
              />
            </div>
          </div>
          <div className='col-md-12'>
            <ReCAPTCHA sitekey={siteKey} onChange={setCaptcha} />
            <div className='mt20'>
              <button
                type='submit'
                className='ud-btn btn-thm'
                disabled={isPending || !captcha}
              >
                {form.buttonText}
                {isPending ? (
                  <span
                    className='spinner-border spinner-border-sm ml10'
                    role='status'
                  >
                    <span className='sr-only'></span>
                  </span>
                ) : (
                  <ArrowRightLong />
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
      {state.message && (
        <div
          className={`mt-3 ${state.success ? 'text-success' : 'text-danger'}`}
        >
          {state.message}
        </div>
      )}
    </>
  );
}
