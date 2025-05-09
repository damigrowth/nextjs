// Map Greek tab names to English URL-friendly names
export const tabNameToHash = {
  Λογαριασμός: "logariasmos",
  "Βασικά Στοιχεία": "basikastoixeia",
  "Πρόσθετα Στοιχεία": "prostheta",
  Παρουσίαση: "parousiasi",
  Πιστοποίηση: "pistopoihisi",
  "Στοιχεία Τιμολόγησης": "timologisi",
};

// Map English URL-friendly names back to Greek tab names
export const hashToTabName = Object.entries(tabNameToHash).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {}); 