import { greekToLatinMap } from './greek-latin';

// Function to replace Greek letters with Latin equivalents
function greekToLatin(text) {
  // Replace multi-character sequences first
  let result = text;

  // Handle multi-character sequences (diphthongs and double consonants) first
  const sequences = Object.keys(greekToLatinMap).sort(
    (a, b) => b.length - a.length,
  );

  for (const greekSequence of sequences) {
    const latinEquivalent = greekToLatinMap[greekSequence];

    const regex = new RegExp(greekSequence, 'g'); // Global match for the sequence

    result = result.replace(regex, latinEquivalent);
  }
  // Replace any remaining Greek characters that are not part of sequences
  result = result.replace(
    /[α-ωΑ-Ωά-ώ]/g,
    (char) => greekToLatinMap[char] || char,
  );

  return result;
}

// Custom slugify function
export function createSlug(text) {
  // Replace Greek characters with Latin equivalents
  const latinizedText = greekToLatin(text);

  // Remove all non-alphanumeric characters except dashes and spaces
  const cleanedText = latinizedText.replace(/[^a-zA-Z0-9\s-]/g, '');

  // Replace spaces with dashes and convert to lowercase
  return cleanedText.trim().toLowerCase().replace(/\s+/g, '-');
}
