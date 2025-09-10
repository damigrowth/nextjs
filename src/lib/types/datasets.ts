export interface DatasetItem {
  id: string;
  name?: string;
  label?: string;
  slug?: string;
  description?: string;
  icon?: string;
  plural?: string;
  child_count?: number;
  children?: DatasetItem[];
  [key: string]: any;
}
