// Simplified Greek error translations - only the essentials

export const greekErrorTranslations = {
  // Most common network errors
  'Network Error': 'Σφάλμα δικτύου',
  'Connection failed': 'Αποτυχία σύνδεσης',
  'Request timeout': 'Λήξη χρονικού ορίου',
  'Failed to fetch': 'Αποτυχία λήψης δεδομένων',

  // Authentication errors
  Unauthorized: 'Μη εξουσιοδοτημένη πρόσβαση',
  'Authentication failed': 'Αποτυχία ταυτοποίησης',
  'Invalid credentials': 'Μη έγκυρα διαπιστευτήρια',
  'Access denied': 'Απαγορεύεται η πρόσβαση',
  Forbidden: 'Απαγορευμένο',

  // Server errors
  'Internal Server Error': 'Εσωτερικό σφάλμα διακομιστή',
  'Server Error': 'Σφάλμα διακομιστή',
  'Service Unavailable': 'Η υπηρεσία δεν είναι διαθέσιμη',

  // Common validation errors
  'Validation Error': 'Σφάλμα επικύρωσης',
  'Required field': 'Υποχρεωτικό πεδίο',
  'Invalid email': 'Μη έγκυρο email',
  'Field is required': 'Το πεδίο είναι υποχρεωτικό',

  // File upload errors
  'File too large': 'Το αρχείο είναι πολύ μεγάλο',
  'Invalid file type': 'Μη έγκυρος τύπος αρχείου',
  'Upload failed': 'Αποτυχία μεταφόρτωσης',

  // Strapi specific errors
  'Entity not found': 'Δεν βρέθηκε',
  'Duplicate entry': 'Διπλότυπη εγγραφή',
  'Invalid identifier or password': 'Μη έγκυρο όνομα χρήστη ή κωδικός',
  'This attribute must be unique': 'Αυτό το πεδίο πρέπει να είναι μοναδικό',
  'The provided current password is invalid':
    'Ο τρέχων κωδικός είναι λανθασμένος',

  // General errors
  'An error occurred': 'Προέκυψε σφάλμα',
  'Something went wrong': 'Κάτι πήγε στραβά',
  'Error during update': 'Σφάλμα κατά την ενημέρωση',
  'Update failed': 'Αποτυχία ενημέρωσης',
  'Operation failed': 'Αποτυχία λειτουργίας',

  // Rate limiting
  'Too many requests': 'Πάρα πολλά αιτήματα',
  'Rate limit exceeded': 'Υπέρβαση ορίου ρυθμού',

  // Common timeouts
  'Request timed out': 'Λήξη χρονικού ορίου αιτήματος',
  'Connection timed out': 'Λήξη χρονικού ορίου σύνδεσης',
};
