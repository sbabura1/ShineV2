export const isSectorAccessError = error => ['SECTOR_NOT_ALLOWED', 'CLASS_MEMBERSHIP_REQUIRED'].includes(error?.code);

export const availableDiscussionSectors = classroom => {
  if (classroom.status !== 'ACTIVE') return [];
  return (classroom.boards || []).filter(id => !classroom.allowedSectors || classroom.allowedSectors.includes(id));
};
