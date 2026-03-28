/**
 * Static blog categories
 * These are fixed and don't need admin management.
 */

export interface BlogCategory {
  slug: string;
  label: string;
  description: string;
  order: number;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  // Topic categories
  {
    slug: 'nea',
    label: 'Νέα',
    description: 'Τα τελευταία νέα και ενημερώσεις από τον κόσμο των freelancers.',
    order: 0,
  },
  {
    slug: 'anakoinoseis',
    label: 'Ανακοινώσεις',
    description: 'Επίσημες ανακοινώσεις και ενημερώσεις της πλατφόρμας.',
    order: 1,
  },
  {
    slug: 'tips',
    label: 'Tips',
    description: 'Χρήσιμα tips και κόλπα για επαγγελματίες.',
    order: 2,
  },
  {
    slug: 'diy',
    label: 'DIY',
    description: 'Οδηγοί Do-It-Yourself για πρακτικές λύσεις.',
    order: 3,
  },
  {
    slug: 'symvoules',
    label: 'Συμβουλές',
    description: 'Συμβουλές και καθοδήγηση για επαγγελματική ανάπτυξη.',
    order: 4,
  },
  // Main categories
  {
    slug: 'dimiourgia-periechomenou',
    label: 'Δημιουργία Περιεχομένου',
    description: 'Άρθρα σχετικά με τη δημιουργία περιεχομένου και content marketing.',
    order: 5,
  },
  {
    slug: 'ekdiloseis',
    label: 'Εκδηλώσεις',
    description: 'Εκδηλώσεις, events και networking για επαγγελματίες.',
    order: 6,
  },
  {
    slug: 'eyexia-frontida',
    label: 'Ευεξία & Φροντίδα',
    description: 'Άρθρα για ευεξία, φροντίδα και ισορροπία εργασίας-ζωής.',
    order: 7,
  },
  {
    slug: 'mathimata',
    label: 'Μαθήματα',
    description: 'Εκπαιδευτικά μαθήματα και tutorials για επαγγελματίες.',
    order: 8,
  },
  {
    slug: 'marketingk',
    label: 'Μάρκετινγκ',
    description: 'Στρατηγικές μάρκετινγκ και προώθησης για freelancers.',
    order: 9,
  },
  {
    slug: 'pliroforiki',
    label: 'Πληροφορική',
    description: 'Τεχνολογία, λογισμικό και ψηφιακά εργαλεία.',
    order: 10,
  },
  {
    slug: 'technika',
    label: 'Τεχνικά',
    description: 'Τεχνικά άρθρα και οδηγοί για εξειδικευμένα θέματα.',
    order: 11,
  },
  {
    slug: 'ypostirixi',
    label: 'Υποστήριξη',
    description: 'Οδηγοί υποστήριξης και επίλυσης προβλημάτων.',
    order: 12,
  },
];

/**
 * Get a blog category by slug
 */
export function getBlogCategoryBySlug(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((cat) => cat.slug === slug);
}

/**
 * Get all blog categories (already ordered)
 */
export function getAllBlogCategories(): BlogCategory[] {
  return BLOG_CATEGORIES;
}
