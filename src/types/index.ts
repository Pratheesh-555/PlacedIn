export interface Experience {
  _id?: string;
  studentName: string;
  email: string;
  company: string;
  graduationYear: number;
  experienceText: string; // Now required for text-based experiences
  documentName?: string; // Optional for backward compatibility
  type: 'placement' | 'internship';
  linkedinUrl?: string;
  otherDiscussions?: string;
  rounds?: Array<{
    id: string;
    name: string;
    content: string;
  }>;
  isApproved?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  version?: number;
  submissionCount?: number;
  isResubmission?: boolean;
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

export interface Update {
  _id: string;
  companyName: string;
  title: string;
  content: string;
  priority: number;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  postedBy: {
    googleId: string;
    name: string;
    email: string;
  };
  aiModeration?: {
    checked: boolean;
    approved: boolean;
    confidence: number;
    issues: string[];
    category: 'SAFE' | 'COLLEGE_CRITICISM' | 'PROFANITY' | 'UNPROFESSIONAL' | 'SPAM' | 'ERROR' | 'NOT_CHECKED';
    checkedAt: string;
  };
  autoApproved?: boolean;
  autoApprovalScheduledFor?: string;
  manuallyReviewed?: boolean;
}