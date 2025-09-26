
export const formatJoinDate = (dateString) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  return `Joined ${date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })}`;
};