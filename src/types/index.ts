export interface Experience {
  _id?: string;
  studentName: string;
  email: string;
  company: string;
  graduationYear: number;
  experienceText: string; // Now required for text-based experiences
  documentName?: string; // Optional for backward compatibility
  type: 'placement' | 'internship';
  isApproved?: boolean;
  createdAt?: string;
  postedBy?: {
    googleId: string;
    name: string;
    email: string;
    picture: string;
  };
  approvedBy?: {
    googleId: string;
    name: string;
    email: string;
    picture: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  updatedAt?: string;
}

export interface User {
  email: string;
  isAdmin?: boolean;
  googleId?: string;
  name?: string;
  picture?: string;
}

export interface GoogleUser {
  googleId: string;
  name: string;
  email: string;
  picture: string;
}

export interface FilterOptions {
  company: string;
  student: string;
  graduationYear: string;
  type: string;
  search: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'normal' | 'high';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
}