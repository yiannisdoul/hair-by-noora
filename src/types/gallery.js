export const PHOTO_CATEGORIES = {
  HAIRCUT: 'haircut',
  HAIRSTYLE: 'hairstyle',
  MAKEUP: 'makeup',
  OTHER: 'other',
  ALL: 'all'
};

export function isValidGalleryPhoto(photo) {
  if (!photo || typeof photo !== 'object') return false;
  
  if (!photo.id || typeof photo.id !== 'string') return false;
  if (!photo.src || typeof photo.src !== 'string') return false;
  if (!photo.alt || typeof photo.alt !== 'string') return false;
  
  const validCategories = [
    PHOTO_CATEGORIES.HAIRSTYLE,
    PHOTO_CATEGORIES.MAKEUP,
    PHOTO_CATEGORIES.OTHER
  ];
  
  return validCategories.includes(photo.category);
}

export function createGalleryPhoto(id, src, alt, category) {
  const photo = { id, src, alt, category };
  
  if (!isValidGalleryPhoto(photo)) {
    throw new Error('Invalid gallery photo properties');
  }
  
  return photo;
}