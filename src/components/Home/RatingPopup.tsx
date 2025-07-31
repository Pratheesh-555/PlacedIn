import React, { useState, useEffect } from 'react';
import { Rating, styled } from '@mui/material';
import { 
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
} from '@mui/icons-material';
import { X } from 'lucide-react';

const StyledRating = styled(Rating)(() => ({
  '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
    color: '#e0e0e0',
  },
}));

const customIcons: {
  [index: string]: {
    icon: React.ReactElement;
    label: string;
  };
} = {
  1: {
    icon: <SentimentVeryDissatisfied color="error" fontSize="large" />,
    label: 'Very Dissatisfied',
  },
  2: {
    icon: <SentimentDissatisfied color="error" fontSize="large" />,
    label: 'Dissatisfied',
  },
  3: {
    icon: <SentimentNeutral color="warning" fontSize="large" />,
    label: 'Neutral',
  },
  4: {
    icon: <SentimentSatisfied color="success" fontSize="large" />,
    label: 'Satisfied',
  },
  5: {
    icon: <SentimentVerySatisfied color="success" fontSize="large" />,
    label: 'Very Satisfied',
  },
};

interface IconContainerProps {
  value: number;
}

function IconContainer(props: IconContainerProps) {
  const { value, ...other } = props;
  return <span {...other}>{customIcons[value].icon}</span>;
}

const RatingPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [rating, setRating] = useState<number | null>(2);

  useEffect(() => {
    // Temporarily disable rating popup - admin will handle feedback requests manually
    return;
    
    // Check if user has visited before
    const hasVisited = localStorage.getItem('hasVisitedPlacedIn');
    const hasRated = localStorage.getItem('hasRatedPlacedIn');
    
    if (!hasVisited && !hasRated) {
      // Show popup after 3 seconds for first-time visitors
      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem('hasVisitedPlacedIn', 'true');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRatingSubmit = async () => {
    if (rating) {
      // For now, just store locally (you can add backend later)
      localStorage.setItem('hasRatedPlacedIn', 'true');
      localStorage.setItem('placedInRating', rating.toString());
      localStorage.setItem('placedInRatingLabel', customIcons[rating].label);
      localStorage.setItem('placedInRatingDate', new Date().toISOString());
      
      console.log('User rated the site:', rating, customIcons[rating].label);
      
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    localStorage.setItem('hasRatedPlacedIn', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 max-w-sm">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How would you rate PlacedIn? 
          </h3>
          <p className="text-sm text-gray-600">
            Your feedback helps us improve the platform for everyone!
          </p>
        </div>

        {/* Rating Component */}
        <div className="mb-4 text-center">
          <StyledRating
            name="highlight-selected-only"
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            IconContainerComponent={IconContainer}
            getLabelText={(value: number) => customIcons[value].label}
            highlightSelectedOnly
            size="large"
          />
          {rating && (
            <p className="text-sm text-gray-600 mt-2">
              {customIcons[rating].label}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Maybe Later
          </button>
          <button
            onClick={handleRatingSubmit}
            disabled={!rating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingPopup;
