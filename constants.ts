import { Article, Issue, TeamMember } from './types';

export const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Breaking the Glass Ceiling: Rwanda’s New Wave of Tech Leaders',
    slug: 'breaking-the-glass-ceiling',
    excerpt: 'From Kigali\'s Innovation City to global boardrooms, meet the entrepreneurs reshaping the digital landscape.',
    category: { id: 1, name: 'Tech & Innovation', slug: 'tech-innovation' },
    author: { id: 'a1', fullName: 'Sarah Mutesi' },
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
    featuredImage: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2938&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Why Mentorship is the Missing Link for Female Entrepreneurs',
    slug: 'mentorship-female-entrepreneurs',
    excerpt: 'Studies show that women with mentors are five times more likely to get promoted. Here is how to find the right one for you.',
    category: { id: 2, name: 'Mentorship', slug: 'mentorship' },
    author: { id: 'a2', fullName: 'Grace Uwase' },
    isFeatured: false,
    status: 'published',
    createdAt: new Date().toISOString(),
    featuredImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'New Legislation Aims to Close the Gender Pay Gap',
    slug: 'gender-pay-gap-legislation',
    excerpt: 'An in-depth look at the proposed policies that could reshape salary transparency in the private sector.',
    category: { id: 3, name: 'Policy', slug: 'policy' },
    author: { id: 'a3', fullName: 'Jean Ndayisaba' },
    isFeatured: false,
    status: 'published',
    createdAt: new Date().toISOString(),
    featuredImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: '4',
    title: 'Bridging the Digital Divide: Initiatives for Rural Women',
    slug: 'bridging-digital-divide',
    excerpt: 'Tech hubs are popping up outside of Kigali, bringing essential digital skills to women in agriculture.',
    category: { id: 4, name: 'Digital Literacy', slug: 'digital-literacy' },
    author: { id: 'a4', fullName: 'Alice Niyonsaba' },
    isFeatured: false,
    status: 'published',
    createdAt: new Date().toISOString(),
    featuredImage: 'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: '5',
    title: 'Investment Strategies for 2024: A Comprehensive Guide',
    slug: 'investment-strategies-2024',
    excerpt: 'Expert advice on diversifying your portfolio amidst global economic shifts.',
    category: { id: 5, name: 'Finance', slug: 'finance' },
    author: { id: 'a5', fullName: 'Alice K.' },
    isFeatured: false,
    status: 'published',
    createdAt: new Date().toISOString(),
    featuredImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=2000&auto=format&fit=crop'
  }
];

export const ISSUES: Issue[] = [
  {
    month: 'March',
    year: '2024',
    title: 'The Leadership Issue',
    description: 'Featuring exclusive interviews with Rwanda\'s top female executives.',
    coverImage: 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?q=80&w=1000&auto=format&fit=crop'
  },
  {
    month: 'February',
    year: '2024',
    title: 'Culture & Innovation',
    description: 'How tradition fuels modern business practices in Kigali.',
    coverImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1000&auto=format&fit=crop'
  },
  {
    month: 'January',
    year: '2024',
    title: 'New Beginnings',
    description: 'Starting the year strong: Goal setting for entrepreneurs.',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop'
  },
  {
    month: 'December',
    year: '2023',
    title: 'The Gala Edition',
    description: 'Highlights from the annual Women in Business Awards.',
    coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop'
  }
];

export const TEAM: TeamMember[] = [
  {
    name: 'Sarah Mutesi',
    role: 'Editor-in-Chief',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1000&auto=format&fit=crop'
  },
  {
    name: 'Diane Uwera',
    role: 'Senior Editor',
    image: 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?q=80&w=1000&auto=format&fit=crop'
  },
  {
    name: 'Jean-Paul Ndayisaba',
    role: 'Creative Director',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop'
  },
  {
    name: 'Grace Keza',
    role: 'Head of Strategy',
    image: 'https://images.unsplash.com/photo-1534751516042-4c54db77379e?q=80&w=1000&auto=format&fit=crop'
  }
];