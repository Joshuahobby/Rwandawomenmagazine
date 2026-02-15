export type PageView =
  | 'HOME'
  | 'ARTICLE'
  | 'SEARCH'
  | 'ARCHIVE'
  | 'DASHBOARD'
  | 'EDITOR'
  | 'SUBSCRIBE'
  | 'CONTACT'
  | 'ABOUT'
  | 'PARTNERS'
  | 'MEMBER_PROFILE'
  | 'ARTICLES'
  | 'MEDIA'
  | 'USERS'
  | 'LOGIN'
  | 'EVENTS'
  | 'NOMINATION'
  | 'NEWSLETTER'
  | 'CATEGORY'
  | 'VOTING';


export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featuredImage?: string;
  isFeatured: boolean;
  status: 'draft' | 'review' | 'published' | 'archived';
  author: {
    id: string;
    fullName: string;
    profileImage?: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    color?: string;
  };
  createdAt: string;
  publishedAt?: string;
  tags?: any[];
}

export interface Media {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
  uploader?: {
    id: string;
    fullName: string;
  };
}

export interface Issue {
  month: string;
  year: string;
  title: string;
  description: string;
  coverImage: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}