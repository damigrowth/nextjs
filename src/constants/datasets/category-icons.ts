/**
 * Category Icon Mappings
 * Maps category icon identifiers to Flaticon icon components
 * Used across the application for consistent category icon display
 *
 * Icon to Category Mapping (from serviceTaxonomies):
 * - flaticon-content: Δημιουργία Περιεχομένου (Content Creation)
 * - flaticon-place: Εκδηλώσεις (Events)
 * - flaticon-like: Ζωή & Στυλ (Life & Style)
 * - flaticon-star: Ψυχαγωγία (Entertainment)
 * - flaticon-digital-marketing: Ψηφιακό Μάρκετινγκ (Digital Marketing)
 * - flaticon-developer: Προγραμματισμός & Τεχνολογία (Programming & Technology)
 * - flaticon-ruler: Σχεδιασμός (Design)
 * - flaticon-customer-service: Υποστήριξη & Διοίκηση (Support & Administration)
 */

import {
  FlaticonContent,
  FlaticonPlace,
  FlaticonLike,
  FlaticonStar,
  FlaticonDigitalMarketing,
  FlaticonDeveloper,
  FlaticonRuler,
  FlaticonCustomerService,
} from '@/components/icon/flaticon';
import React from 'react';

export type CategoryIconKey =
  | 'flaticon-content'
  | 'flaticon-place'
  | 'flaticon-like'
  | 'flaticon-star'
  | 'flaticon-digital-marketing'
  | 'flaticon-developer'
  | 'flaticon-ruler'
  | 'flaticon-customer-service';

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number; color?: string }>;

/**
 * Map category icon identifiers to Flaticon icon components
 */
export const categoryIconMap: Record<CategoryIconKey, IconComponent> = {
  'flaticon-content': FlaticonContent, // Δημιουργία Περιεχομένου
  'flaticon-place': FlaticonPlace, // Εκδηλώσεις
  'flaticon-like': FlaticonLike, // Ζωή & Στυλ
  'flaticon-star': FlaticonStar, // Ψυχαγωγία
  'flaticon-digital-marketing': FlaticonDigitalMarketing, // Ψηφιακό Μάρκετινγκ
  'flaticon-developer': FlaticonDeveloper, // Προγραμματισμός & Τεχνολογία
  'flaticon-ruler': FlaticonRuler, // Σχεδιασμός
  'flaticon-customer-service': FlaticonCustomerService, // Υποστήριξη & Διοίκηση
};

/**
 * Get icon component by category icon key
 * @param iconKey - The icon identifier from category data
 * @returns Flaticon icon component or undefined if not found
 */
export function getCategoryIcon(iconKey?: string): IconComponent | undefined {
  if (!iconKey) return undefined;
  return categoryIconMap[iconKey as CategoryIconKey];
}
