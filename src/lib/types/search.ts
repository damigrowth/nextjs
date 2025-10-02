// Search-related type definitions

export interface TaxonomySuggestion {
  type: 'taxonomy';
  id: string;
  label: string;
  category: string; // Category label for display
  subcategory: string;
  subdivision: string;
  url: string; // Full URL: /ipiresies/{subcategory}/{subdivision}
}

export interface ServicePreview {
  type: 'service';
  id: number;
  title: string;
  category: string;
  slug: string | null;
  url: string; // Service detail URL
}

export type SearchSuggestion = TaxonomySuggestion | ServicePreview;

export interface SearchSuggestionsResult {
  taxonomies: TaxonomySuggestion[];
  services: ServicePreview[];
  hasResults: boolean;
}
