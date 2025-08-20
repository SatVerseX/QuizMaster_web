export const examCategories = [
  // Competitive Exams
  {
    id: 'competitive',
    name: 'Competitive Exams',
    icon: '🏆',
    subcategories: [
      { id: 'upsc', name: 'UPSC Civil Services', icon: '👨‍💼' },
      { id: 'ssc', name: 'SSC (Staff Selection Commission)', icon: '📋' },
      { id: 'banking', name: 'Banking Exams', icon: '🏦' },
      { id: 'railway', name: 'Railway Exams', icon: '🚂' },
      { id: 'defense', name: 'Defense Exams', icon: '🎖️' },
      { id: 'teaching', name: 'Teaching Exams', icon: '👨‍🏫' },
      { id: 'state-pcs', name: 'State PCS', icon: '🏛️' },
      { id: 'other-competitive', name: 'Other Competitive', icon: '📝' }
    ]
  },
  
  // Engineering & Technical
  {
    id: 'engineering',
    name: 'Engineering & Technical',
    icon: '⚙️',
    subcategories: [
      { id: 'gate', name: 'GATE', icon: '🎓' },
      { id: 'jee-main', name: 'JEE Main', icon: '🔬' },
      { id: 'jee-advanced', name: 'JEE Advanced', icon: '🚀' },
      { id: 'neet', name: 'NEET', icon: '🏥' },
      { id: 'btech', name: 'B.Tech', icon: '💻' },
      { id: 'mtech', name: 'M.Tech', icon: '🔧' },
      { id: 'diploma', name: 'Diploma', icon: '📐' },
      { id: 'other-engineering', name: 'Other Engineering', icon: '⚡' }
    ]
  },
  
  // Medical & Healthcare
  {
    id: 'medical',
    name: 'Medical & Healthcare',
    icon: '🏥',
    subcategories: [
      { id: 'mbbs', name: 'MBBS', icon: '👨‍⚕️' },
      { id: 'bds', name: 'BDS', icon: '🦷' },
      { id: 'bams', name: 'BAMS', icon: '🌿' },
      { id: 'bhms', name: 'BHMS', icon: '💊' },
      { id: 'nursing', name: 'Nursing', icon: '👩‍⚕️' },
      { id: 'pharmacy', name: 'Pharmacy', icon: '💊' },
      { id: 'physiotherapy', name: 'Physiotherapy', icon: '🦴' },
      { id: 'other-medical', name: 'Other Medical', icon: '🏨' }
    ]
  },
  
  // Programming & IT
  {
    id: 'programming',
    name: 'Programming & IT',
    icon: '💻',
    subcategories: [
      { id: 'web-development', name: 'Web Development', icon: '🌐' },
      { id: 'mobile-development', name: 'Mobile Development', icon: '📱' },
      { id: 'data-science', name: 'Data Science', icon: '📊' },
      { id: 'machine-learning', name: 'Machine Learning', icon: '🤖' },
      { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔒' },
      { id: 'cloud-computing', name: 'Cloud Computing', icon: '☁️' },
      { id: 'devops', name: 'DevOps', icon: '⚙️' },
      { id: 'other-programming', name: 'Other Programming', icon: '⌨️' }
    ]
  },
  
  // Academic & School
  {
    id: 'academic',
    name: 'Academic & School',
    icon: '📚',
    subcategories: [
      { id: 'cbse', name: 'CBSE', icon: '🎓' },
      { id: 'icse', name: 'ICSE', icon: '📖' },
      { id: 'state-board', name: 'State Board', icon: '🏫' },
      { id: 'international-board', name: 'International Board', icon: '🌍' },
      { id: 'class-10', name: 'Class 10', icon: '🔟' },
      { id: 'class-12', name: 'Class 12', icon: '1️⃣2️⃣' },
      { id: 'graduation', name: 'Graduation', icon: '🎓' },
      { id: 'post-graduation', name: 'Post Graduation', icon: '🎓' }
    ]
  },
  
  // Business & Management
  {
    id: 'business',
    name: 'Business & Management',
    icon: '💼',
    subcategories: [
      { id: 'cat', name: 'CAT', icon: '🐱' },
      { id: 'mat', name: 'MAT', icon: '📊' },
      { id: 'xat', name: 'XAT', icon: '📈' },
      { id: 'mba', name: 'MBA', icon: '🎯' },
      { id: 'bcom', name: 'B.Com', icon: '💰' },
      { id: 'mcom', name: 'M.Com', icon: '💹' },
      { id: 'ca', name: 'CA', icon: '📋' },
      { id: 'other-business', name: 'Other Business', icon: '🏢' }
    ]
  },
  
  // Science & Research
  {
    id: 'science',
    name: 'Science & Research',
    icon: '🔬',
    subcategories: [
      { id: 'physics', name: 'Physics', icon: '⚛️' },
      { id: 'chemistry', name: 'Chemistry', icon: '🧪' },
      { id: 'biology', name: 'Biology', icon: '🧬' },
      { id: 'mathematics', name: 'Mathematics', icon: '📐' },
      { id: 'computer-science', name: 'Computer Science', icon: '💾' },
      { id: 'environmental-science', name: 'Environmental Science', icon: '🌱' },
      { id: 'astronomy', name: 'Astronomy', icon: '🌌' },
      { id: 'other-science', name: 'Other Science', icon: '🔍' }
    ]
  },
  
  // Language & Literature
  {
    id: 'language',
    name: 'Language & Literature',
    icon: '🗣️',
    subcategories: [
      { id: 'english', name: 'English', icon: '🇬🇧' },
      { id: 'hindi', name: 'Hindi', icon: '🇮🇳' },
      { id: 'sanskrit', name: 'Sanskrit', icon: '📜' },
      { id: 'french', name: 'French', icon: '🇫🇷' },
      { id: 'german', name: 'German', icon: '🇩🇪' },
      { id: 'spanish', name: 'Spanish', icon: '🇪🇸' },
      { id: 'chinese', name: 'Chinese', icon: '🇨🇳' },
      { id: 'other-language', name: 'Other Languages', icon: '🌐' }
    ]
  },
  
  // Arts & Humanities
  {
    id: 'arts',
    name: 'Arts & Humanities',
    icon: '🎨',
    subcategories: [
      { id: 'history', name: 'History', icon: '📜' },
      { id: 'geography', name: 'Geography', icon: '🗺️' },
      { id: 'political-science', name: 'Political Science', icon: '🏛️' },
      { id: 'economics', name: 'Economics', icon: '📈' },
      { id: 'sociology', name: 'Sociology', icon: '👥' },
      { id: 'psychology', name: 'Psychology', icon: '🧠' },
      { id: 'philosophy', name: 'Philosophy', icon: '🤔' },
      { id: 'other-arts', name: 'Other Arts', icon: '🎭' }
    ]
  },
  
  // Law & Legal
  {
    id: 'law',
    name: 'Law & Legal',
    icon: '⚖️',
    subcategories: [
      { id: 'clat', name: 'CLAT', icon: '📚' },
      { id: 'ailet', name: 'AILET', icon: '⚖️' },
      { id: 'llb', name: 'LLB', icon: '👨‍⚖️' },
      { id: 'llm', name: 'LLM', icon: '🎓' },
      { id: 'judiciary', name: 'Judiciary', icon: '🏛️' },
      { id: 'legal-practice', name: 'Legal Practice', icon: '📋' },
      { id: 'constitutional-law', name: 'Constitutional Law', icon: '📜' },
      { id: 'other-law', name: 'Other Law', icon: '⚖️' }
    ]
  },
  
  // Design & Creative
  {
    id: 'design',
    name: 'Design & Creative',
    icon: '🎨',
    subcategories: [
      { id: 'graphic-design', name: 'Graphic Design', icon: '🎨' },
      { id: 'web-design', name: 'Web Design', icon: '🖥️' },
      { id: 'ui-ux', name: 'UI/UX Design', icon: '📱' },
      { id: 'interior-design', name: 'Interior Design', icon: '🏠' },
      { id: 'fashion-design', name: 'Fashion Design', icon: '👗' },
      { id: 'animation', name: 'Animation', icon: '🎬' },
      { id: 'photography', name: 'Photography', icon: '📸' },
      { id: 'other-design', name: 'Other Design', icon: '✨' }
    ]
  },
  
  // Finance & Accounting
  {
    id: 'finance',
    name: 'Finance & Accounting',
    icon: '💰',
    subcategories: [
      { id: 'cfa', name: 'CFA', icon: '📊' },
      { id: 'frm', name: 'FRM', icon: '📈' },
      { id: 'acca', name: 'ACCA', icon: '💼' },
      { id: 'cpa', name: 'CPA', icon: '📋' },
      { id: 'investment-banking', name: 'Investment Banking', icon: '🏦' },
      { id: 'financial-modeling', name: 'Financial Modeling', icon: '📊' },
      { id: 'taxation', name: 'Taxation', icon: '📄' },
      { id: 'other-finance', name: 'Other Finance', icon: '💳' }
    ]
  },
  
  // Other Categories
  {
    id: 'other',
    name: 'Other Categories',
    icon: '📌',
    subcategories: [
      { id: 'general-knowledge', name: 'General Knowledge', icon: '🧠' },
      { id: 'current-affairs', name: 'Current Affairs', icon: '📰' },
      { id: 'reasoning', name: 'Reasoning', icon: '🧩' },
      { id: 'aptitude', name: 'Aptitude', icon: '🎯' },
      { id: 'personality-development', name: 'Personality Development', icon: '🌟' },
      { id: 'soft-skills', name: 'Soft Skills', icon: '🤝' },
      { id: 'interview-preparation', name: 'Interview Preparation', icon: '💼' },
      { id: 'miscellaneous', name: 'Miscellaneous', icon: '📌' }
    ]
  }
];

// Helper function to get all subcategories as a flat array
export const getAllSubcategories = () => {
  return examCategories.flatMap(category => 
    category.subcategories.map(sub => ({
      ...sub,
      parentCategory: category.name,
      parentIcon: category.icon
    }))
  );
};

// Helper function to get category by ID
export const getCategoryById = (categoryId) => {
  return examCategories.find(cat => cat.id === categoryId);
};

// Helper function to get subcategory by ID
export const getSubcategoryById = (subcategoryId) => {
  for (const category of examCategories) {
    const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
    if (subcategory) {
      return {
        ...subcategory,
        parentCategory: category.name,
        parentIcon: category.icon
      };
    }
  }
  return null;
};

// Helper function to get subcategories by category ID
export const getSubcategoriesByCategoryId = (categoryId) => {
  const category = getCategoryById(categoryId);
  return category ? category.subcategories : [];
};
