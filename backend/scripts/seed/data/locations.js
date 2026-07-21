/**
 * Indian city data for job locations and candidate profiles.
 * These 10 tier-1 cities cover the major tech hubs in India.
 */

const locations = [
  { city: 'Hyderabad', state: 'Telangana', weight: 18 },
  { city: 'Bangalore', state: 'Karnataka', weight: 25 },
  { city: 'Pune', state: 'Maharashtra', weight: 14 },
  { city: 'Chennai', state: 'Tamil Nadu', weight: 10 },
  { city: 'Mumbai', state: 'Maharashtra', weight: 10 },
  { city: 'Delhi', state: 'Delhi', weight: 5 },
  { city: 'Noida', state: 'Uttar Pradesh', weight: 6 },
  { city: 'Gurgaon', state: 'Haryana', weight: 7 },
  { city: 'Kochi', state: 'Kerala', weight: 2 },
  { city: 'Ahmedabad', state: 'Gujarat', weight: 3 },
];

/**
 * Returns a weighted random city name.
 * Cities with higher weight (more tech companies) are picked more often.
 * @returns {string} City name
 */
export const getWeightedCity = () => {
  const totalWeight = locations.reduce((sum, loc) => sum + loc.weight, 0);
  let random = Math.random() * totalWeight;

  for (const loc of locations) {
    random -= loc.weight;
    if (random <= 0) return loc.city;
  }

  return locations[0].city;
};

/**
 * Returns city names as a flat array.
 * @returns {string[]} Array of city names
 */
export const getCityNames = () => locations.map((loc) => loc.city);

export default locations;
