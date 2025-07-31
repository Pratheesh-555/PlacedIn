import { usePageTracking } from '../hooks/useAnalytics';
import { GoogleUser } from '../types';

interface PageTrackerProps {
  user: GoogleUser | null;
}

const PageTracker: React.FC<PageTrackerProps> = ({ user }) => {
  // Track page views with user ID
  usePageTracking(user?.googleId);
  
  // This component doesn't render anything
  return null;
};

export default PageTracker;
