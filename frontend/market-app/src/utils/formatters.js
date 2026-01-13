// Currency formatting utility
export const formatCurrency = (amount, currency = 'KES') => {
  if (amount === null || amount === undefined) return '0 KES';

  const numAmount = Number(amount);
  if (isNaN(numAmount)) return '0 KES';

  // For Kenyan Shillings
  if (currency === 'KES') {
    return `KES ${numAmount.toLocaleString('en-KE')}`;
  }

  // For USD
  if (currency === 'USD') {
    return `$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // For EUR
  if (currency === 'EUR') {
    return `€${numAmount.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Generic currency formatting
  return `${currency} ${numAmount.toLocaleString()}`;
};

// Date formatting utilities
export const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(dateString);
};

// Number formatting utilities
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';

  const number = Number(num);
  if (isNaN(number)) return '0';

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return number.toLocaleString();
};

// Text formatting utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const titleCase = (str) => {
  if (!str) return '';
  return str.split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

// Phone number formatting (Kenyan format)
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Check if it's a Kenyan number
  if (cleaned.startsWith('254')) {
    // Format as +254 XXX XXX XXX
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    return `+254 ${formatted.substring(3)}`;
  }

  if (cleaned.startsWith('0')) {
    // Format local Kenyan number as 0XX XXX XXXX
    const formatted = cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    return formatted;
  }

  return phoneNumber;
};

// Rating utilities
export const formatRating = (rating) => {
  if (rating === null || rating === undefined) return '0.0';
  return Number(rating).toFixed(1);
};

export const getRatingStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push('full');
    } else if (i === fullStars && hasHalfStar) {
      stars.push('half');
    } else {
      stars.push('empty');
    }
  }

  return stars;
};
