// Helper functions for rating functionality

// Helper function to check stored ratings (you can call this from console)
export const checkStoredRating = () => {
  const hasRated = localStorage.getItem('hasRatedPlacedIn');
  const rating = localStorage.getItem('placedInRating');
  const label = localStorage.getItem('placedInRatingLabel');
  const date = localStorage.getItem('placedInRatingDate');
  
  if (hasRated && rating) {
    console.log('📊 PlacedIn Rating Data:');
    console.log('✅ Has Rated:', hasRated);
    console.log('⭐ Rating:', rating + '/5');
    console.log('😊 Label:', label);
    console.log('📅 Date:', date ? new Date(date).toLocaleString() : 'Not available');
  } else {
    console.log('❌ No rating found in localStorage');
  }
  
  return { hasRated, rating, label, date };
};
