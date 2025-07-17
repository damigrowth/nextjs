// Form types for various components

import { TaxonomyRelation, LocationRelation, ExtendedLocationRelation, ExtendedLocationCollection } from './datasets';

// Generic form state
export interface FormState {
  errors: Record<string, string[]>;
  message: string | null;
  success: boolean;
}

// Coverage types for professional services
export interface Coverage {
  online: boolean;
  onbase: boolean;
  onsite: boolean;
  address: string;
  area: ExtendedLocationRelation;
  county: ExtendedLocationRelation;
  zipcode: ExtendedLocationRelation;
  counties: ExtendedLocationCollection;
  areas: ExtendedLocationCollection;
}

// Onboarding form data
export interface OnboardingFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  phone: string;

  // Location
  county: LocationRelation;
  area: LocationRelation;
  zipcode: LocationRelation;

  // Professional Info
  category: TaxonomyRelation;
  subcategory: TaxonomyRelation;
  tagline: string;
  description: string;
  website: string;
  experience: string;
  rate: string;

  // Coverage/Service provision
  coverage: Coverage;
}

// Service creation form data
export interface ServiceFormData {
  title: string;
  description: string;
  category: TaxonomyRelation;
  subcategory: TaxonomyRelation;
  tags: string[];
  price: number;
  delivery_time: number;
  images: File[];
  // Add more fields as needed
}

// Profile update form data
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  email: string;
  website: string;
  tagline: string;
  description: string;
  experience: string;
  rate: number;
  location: LocationRelation;
  // Add more fields as needed
}

// Contact form data
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  company?: string;
}

// Search form data
export interface SearchFormData {
  query: string;
  category?: string;
  subcategory?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
}

// Review form data
export interface ReviewFormData {
  rating: number;
  comment: string;
  pros?: string;
  cons?: string;
  serviceId: string;
  freelancerId: string;
}

// Generic form props
export interface FormProps<T = any> {
  onSubmit: (data: T) => Promise<void>;
  initialData?: Partial<T>;
  isLoading?: boolean;
  errors?: Record<string, string[]>;
  className?: string;
}

// Form field props
export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
  className?: string;
}

// Form validation
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormValidation {
  [field: string]: ValidationRule;
}

// Form handlers
export type FormChangeHandler = (field: string, value: any) => void;
export type FormSubmitHandler<T = any> = (data: T) => Promise<void>;
export type FormValidationHandler = (data: any) => Record<string, string[]>;

// Form utilities
export interface FormUtilities {
  validateField: (field: string, value: any) => string | null;
  validateForm: (data: any) => Record<string, string[]>;
  resetForm: () => void;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
}