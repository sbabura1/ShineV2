const difficulties = ['beginning', 'intermediate', 'advanced'];
const identifier = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);

export function validLearningPath(value) {
  return value && identifier(value.sectorId) && (value.screen === 'sector' ||
    (value.screen === 'mission' && identifier(value.missionId) && difficulties.includes(value.difficulty)));
}

export function readLastVisited(userId) {
  try {
    const value = JSON.parse(localStorage.getItem(`scalaris:last-visited:${userId}`));
    return validLearningPath(value) ? value : null;
  } catch { return null; }
}

export function saveLastVisited(userId, value) {
  if (!userId || !validLearningPath(value)) return;
  try { localStorage.setItem(`scalaris:last-visited:${userId}`, JSON.stringify(value)); }
  catch { /* Keep the current session usable when browser storage is unavailable. */ }
}

export function latestSavedPath(progress) {
  const track = [...progress.difficultyStates].filter(item => item.updatedAt && validLearningPath({ ...item, screen: 'mission' }))
    .sort((a, b) => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0))[0];
  return track ? { screen: 'mission', sectorId: track.sectorId, missionId: track.missionId, difficulty: track.difficulty } : null;
}
