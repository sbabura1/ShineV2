// Shared presentation helpers. All classroom records now come from the API.
export const sectors = [
  { id: 'vitalis', name: 'Vitalis', description: 'Health & well-being' },
  { id: 'terra', name: 'Terra', description: 'Environment & sustainability' },
  { id: 'civitas', name: 'Civitas', description: 'Society & community' },
  { id: 'venture', name: 'Venture', description: 'Business & enterprise' },
];
export function getStudentStatus(student) {
  if (!student.connected) return 'Invited';
  if (student.accessUnavailable) return 'Access unavailable';
  if (student.accuracy !== null && student.accuracy < 60) return 'Check in';
  if (!student.lastActive) return 'Not started';
  return 'In progress';
}
export function classMetrics(classroom) {
  const connected = (classroom.students || []).filter(item => item.connected);
  const assessed = connected.filter(item => item.accuracy !== null);
  return {
    students: classroom.loaded ? connected.length : classroom.studentCount || 0,
    invited: classroom.loaded ? classroom.students.length - connected.length : classroom.invitedCount || 0,
    missions: connected.reduce((sum, item) => sum + item.missions, 0),
    accuracy: assessed.length ? Math.round(assessed.reduce((sum, item) => sum + item.accuracy, 0) / assessed.length) : null,
    assessed: assessed.length,
    started: connected.filter(item => item.lastActive).length,
    needsReview: classroom.needsReview ?? (classroom.discussions || []).filter(item => !item.reviewed).length,
    checkIns: connected.filter(item => ['Check in', 'Not started'].includes(getStudentStatus(item))).length,
  };
}
export function activityLabel(value) {
  if (!value) return 'No activity';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'No activity' : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}
export function discussionTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}
