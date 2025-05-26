import {
  ShoppingBagIcon,
  HomeIcon,
  TruckIcon,
  AcademicCapIcon,
  HeartIcon,
  FilmIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  UserGroupIcon,
  GiftIcon,
  QuestionMarkCircleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

export const transactionCategories = [
  { 
    id: 'shopping', 
    name: 'Shopping', 
    icon: ShoppingBagIcon, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100',
    description: 'Purchases from retail stores, online shopping'
  },
  { 
    id: 'housing', 
    name: 'Housing', 
    icon: HomeIcon, 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    description: 'Rent, mortgage, home repairs, furniture'
  },
  { 
    id: 'transportation', 
    name: 'Transportation', 
    icon: TruckIcon, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100',
    description: 'Gas, public transit, car maintenance, ride sharing'
  },
  { 
    id: 'education', 
    name: 'Education', 
    icon: AcademicCapIcon, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-100',
    description: 'Tuition, books, courses, student loans'
  },
  { 
    id: 'healthcare', 
    name: 'Healthcare', 
    icon: HeartIcon, 
    color: 'text-red-600', 
    bgColor: 'bg-red-100',
    description: 'Doctor visits, medicine, health insurance'
  },
  { 
    id: 'entertainment', 
    name: 'Entertainment', 
    icon: FilmIcon, 
    color: 'text-pink-600', 
    bgColor: 'bg-pink-100',
    description: 'Movies, games, streaming services, hobbies'
  },
  { 
    id: 'utilities', 
    name: 'Utilities', 
    icon: BoltIcon, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-100',
    description: 'Electricity, water, gas, internet, phone'
  },
  { 
    id: 'income', 
    name: 'Income', 
    icon: BanknotesIcon, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-100',
    description: 'Salary, freelance work, investments'
  },
  { 
    id: 'business', 
    name: 'Business', 
    icon: BuildingOfficeIcon, 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100',
    description: 'Business expenses, office supplies'
  },
  { 
    id: 'travel', 
    name: 'Travel', 
    icon: GlobeAltIcon, 
    color: 'text-cyan-600', 
    bgColor: 'bg-cyan-100',
    description: 'Flights, hotels, vacation expenses'
  },
  { 
    id: 'family', 
    name: 'Family', 
    icon: UserGroupIcon, 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-100',
    description: 'Childcare, family activities, allowance'
  },
  { 
    id: 'gifts', 
    name: 'Gifts & Donations', 
    icon: GiftIcon, 
    color: 'text-rose-600', 
    bgColor: 'bg-rose-100',
    description: 'Presents, charitable donations'
  },
  { 
    id: 'other', 
    name: 'Other', 
    icon: QuestionMarkCircleIcon, 
    color: 'text-slate-600', 
    bgColor: 'bg-slate-100',
    description: 'Miscellaneous expenses'
  }
];

export const getCategoryById = (categoryId) => {
  return transactionCategories.find(category => category.id === categoryId) || transactionCategories[transactionCategories.length - 1];
};

export const getCategoryIcon = (categoryId) => {
  const category = getCategoryById(categoryId);
  const IconComponent = category.icon;
  return <IconComponent className={`h-5 w-5 ${category.color}`} />;
};
