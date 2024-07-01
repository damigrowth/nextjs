export const getYearsOfExperience = (commencement) => {
  /// Get the current year
  const currentYear = new Date().getFullYear();
  // Calculate years of experience
  const yearsOfExperience = currentYear - commencement;
  return yearsOfExperience;
};
