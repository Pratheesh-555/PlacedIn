export interface Experience {
  _id?: string;
  studentName: string;
  email: string;
  company: string;
  year: number;
  experienceText: string;
  type: 'placement' | 'internship';
  isApproved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  email: string;
  isAdmin?: boolean;
}

export interface FilterOptions {
  company: string;
  student: string;
  year: string;
  type: string;
  search: string;
}