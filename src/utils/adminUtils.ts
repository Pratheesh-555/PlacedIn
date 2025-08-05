import { GoogleUser } from '../types';

// Define admin email addresses
export const ADMIN_EMAILS = [
  'pratheeshkrishnan595@gmail.com', // Add your admin email
  'saivaishnaviporeddy@gmail.com',               // Add domain admin email
  // Add more admin emails here as needed
];

/**
 * Check if a user is an admin
 * @param user - The Google user object
 * @returns boolean - true if user is an admin
 */
export const isUserAdmin = (user: GoogleUser | null): boolean => {
  if (!user) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
};

/**
 * Check if an email is an admin email
 * @param email - The email address to check
 * @returns boolean - true if email is an admin email
 */
export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
