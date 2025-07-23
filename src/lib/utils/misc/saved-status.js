/**
 * Utility functions for checking saved status from user's saved data
 * instead of making individual GraphQL queries
 */

/**
 * Check if a service is saved by the user
 * @param {string} serviceId - The service ID to check
 * @param {Array} savedServices - Array of saved services from user data
 * @returns {boolean} - True if service is saved
 */
export function isServiceSaved(serviceId, savedServices = []) {
  if (!serviceId || !savedServices.length) return false;
  
  return savedServices.some(savedService => 
    savedService.id === serviceId || savedService.id === parseInt(serviceId)
  );
}

/**
 * Check if a freelancer is saved by the user
 * @param {string} freelancerId - The freelancer ID to check
 * @param {Array} savedFreelancers - Array of saved freelancers from user data
 * @returns {boolean} - True if freelancer is saved
 */
export function isFreelancerSaved(freelancerId, savedFreelancers = []) {
  if (!freelancerId || !savedFreelancers.length) return false;
  
  return savedFreelancers.some(savedFreelancer => 
    savedFreelancer.id === freelancerId || savedFreelancer.id === parseInt(freelancerId)
  );
}

/**
 * Get saved status for multiple services at once
 * @param {Array} serviceIds - Array of service IDs to check
 * @param {Array} savedServices - Array of saved services from user data
 * @returns {Object} - Object with serviceId as key and boolean as value
 */
export function getBatchServiceSavedStatuses(serviceIds = [], savedServices = []) {
  const statuses = {};
  
  serviceIds.forEach(serviceId => {
    statuses[serviceId] = isServiceSaved(serviceId, savedServices);
  });
  
  return statuses;
}

/**
 * Get saved status for multiple freelancers at once
 * @param {Array} freelancerIds - Array of freelancer IDs to check
 * @param {Array} savedFreelancers - Array of saved freelancers from user data
 * @returns {Object} - Object with freelancerId as key and boolean as value
 */
export function getBatchFreelancerSavedStatuses(freelancerIds = [], savedFreelancers = []) {
  const statuses = {};
  
  freelancerIds.forEach(freelancerId => {
    statuses[freelancerId] = isFreelancerSaved(freelancerId, savedFreelancers);
  });
  
  return statuses;
}
