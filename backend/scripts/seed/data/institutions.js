/**
 * Indian educational institutions for candidate profile generation.
 * Covers IITs, NITs, IIITs, BITS, top private universities, and state universities.
 */

export const institutions = [
  // IITs
  'Indian Institute of Technology Bombay',
  'Indian Institute of Technology Delhi',
  'Indian Institute of Technology Madras',
  'Indian Institute of Technology Kanpur',
  'Indian Institute of Technology Kharagpur',
  'Indian Institute of Technology Hyderabad',
  'Indian Institute of Technology Roorkee',
  'Indian Institute of Technology Guwahati',
  'Indian Institute of Technology BHU Varanasi',
  'Indian Institute of Technology Indore',
  'Indian Institute of Technology Dhanbad',
  'Indian Institute of Technology Patna',
  'Indian Institute of Technology Mandi',

  // NITs
  'National Institute of Technology Tiruchirappalli',
  'National Institute of Technology Surathkal',
  'National Institute of Technology Warangal',
  'National Institute of Technology Calicut',
  'National Institute of Technology Rourkela',
  'National Institute of Technology Allahabad',
  'National Institute of Technology Durgapur',
  'National Institute of Technology Kurukshetra',
  'National Institute of Technology Jaipur',
  'National Institute of Technology Nagpur',
  'Motilal Nehru National Institute of Technology Allahabad',
  'Visvesvaraya National Institute of Technology Nagpur',

  // IIITs
  'International Institute of Information Technology Hyderabad',
  'Indian Institute of Information Technology Allahabad',
  'Indian Institute of Information Technology Bangalore',
  'Indian Institute of Information Technology Delhi',
  'Indian Institute of Information Technology Lucknow',

  // BITS
  'Birla Institute of Technology and Science Pilani',
  'BITS Pilani Hyderabad Campus',
  'BITS Pilani Goa Campus',
  'Birla Institute of Technology Mesra',

  // Top Private Universities
  'VIT Vellore',
  'SRM Institute of Science and Technology',
  'Manipal Institute of Technology',
  'Amity University Noida',
  'Lovely Professional University',
  'KIIT University Bhubaneswar',
  'Symbiosis Institute of Technology Pune',
  'Thapar Institute of Engineering and Technology',
  'PES University Bangalore',
  'RV College of Engineering Bangalore',
  'BMS College of Engineering Bangalore',
  'Christ University Bangalore',
  'Shiv Nadar University',
  'Ashoka University',
  'IIIT Hyderabad',

  // State / Central Universities
  'Delhi University',
  'University of Mumbai',
  'University of Pune',
  'Anna University Chennai',
  'Osmania University Hyderabad',
  'Jadavpur University Kolkata',
  'University of Calcutta',
  'Bangalore University',
  'Gujarat Technological University',
  'Jawaharlal Nehru Technological University Hyderabad',
  'Savitribai Phule Pune University',
  'Cochin University of Science and Technology',
  'University of Kerala',
  'Andhra University Visakhapatnam',
  'PSG College of Technology Coimbatore',
  'College of Engineering Pune',
  'Dhirubhai Ambani Institute of Information and Communication Technology',

  // Management / MBA Institutes
  'Indian Institute of Management Ahmedabad',
  'Indian Institute of Management Bangalore',
  'Indian Institute of Management Calcutta',
  'Indian Institute of Management Lucknow',
  'Indian Institute of Management Indore',
  'Indian School of Business Hyderabad',
  'XLRI Jamshedpur',
  'Narsee Monjee Institute of Management Studies Mumbai',
  'SP Jain Institute of Management and Research Mumbai',
  'Symbiosis Institute of Business Management Pune',

  // Engineering Colleges
  'Government Engineering College Thrissur',
  'National Institute of Engineering Mysuru',
  'Sagar Institute of Research and Technology Bhopal',
  'Maulana Abul Kalam Azad University of Technology',
  'Rajiv Gandhi Proudyogiki Vishwavidyalaya Bhopal',
  'APJ Abdul Kalam Technological University',
  'Visvesvaraya Technological University Belgaum',
  'Maharashtra Institute of Technology Pune',
  'Pune Institute of Computer Technology',
  'Walchand College of Engineering Sangli',
];

/**
 * Degree programs for education entries.
 */
export const degrees = [
  { degree: 'B.Tech', field: 'Computer Science and Engineering', weight: 35 },
  { degree: 'B.Tech', field: 'Information Technology', weight: 15 },
  { degree: 'B.Tech', field: 'Electronics and Communication Engineering', weight: 8 },
  { degree: 'B.Tech', field: 'Electrical Engineering', weight: 5 },
  { degree: 'B.E.', field: 'Computer Science and Engineering', weight: 10 },
  { degree: 'B.E.', field: 'Information Science and Engineering', weight: 5 },
  { degree: 'M.Tech', field: 'Computer Science and Engineering', weight: 5 },
  { degree: 'M.Tech', field: 'Software Engineering', weight: 3 },
  { degree: 'M.Tech', field: 'Data Science', weight: 2 },
  { degree: 'BCA', field: 'Computer Applications', weight: 4 },
  { degree: 'MCA', field: 'Computer Applications', weight: 3 },
  { degree: 'B.Sc', field: 'Computer Science', weight: 3 },
  { degree: 'M.Sc', field: 'Computer Science', weight: 2 },
  { degree: 'MBA', field: 'Information Technology', weight: 1 },
  { degree: 'MBA', field: 'Business Analytics', weight: 1 },
  { degree: 'Ph.D', field: 'Computer Science', weight: 1 },
];

/**
 * Returns a weighted random degree.
 * @returns {{ degree: string, field: string }}
 */
export const getWeightedDegree = () => {
  const totalWeight = degrees.reduce((sum, d) => sum + d.weight, 0);
  let random = Math.random() * totalWeight;

  for (const d of degrees) {
    random -= d.weight;
    if (random <= 0) return { degree: d.degree, field: d.field };
  }

  return { degree: degrees[0].degree, field: degrees[0].field };
};

export default institutions;
