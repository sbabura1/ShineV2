const missionTaskSlugs = [
  'briefing',
  'data-lab',
  'find-signal',
  'build-evidence',
  'make-call',
  'assessment',
  'debrief',
];

const cleanPath = (value) => {
  const path = value.replace(/^#/, '').split('?')[0] || '/';
  return path.startsWith('/') ? path : `/${path}`;
};

export function createScalarisRoute(screen, { sectorId, step = 0 } = {}) {
  const sector = encodeURIComponent(sectorId || 'vitalis');
  const taskIndex = Math.max(0, Math.min(missionTaskSlugs.length - 1, Number(step) || 0));
  const paths = {
    landing: '/',
    worldview: '/worldview',
    identity: '/identity',
    nexus: '/nexus',
    preassessment: '/assessments/pre',
    postassessment: '/assessments/post',
    sector: `/sectors/${sector}`,
    sprint: `/sectors/${sector}/sprint`,
    mission: `/sectors/${sector}/missions/01/${missionTaskSlugs[taskIndex]}`,
    profile: `/sectors/${sector}/missions/01/results`,
  };

  return { screen, sectorId: sectorId || null, step: taskIndex, path: paths[screen] || '/' };
}

export function readScalarisRoute() {
  const path = cleanPath(window.location.hash);

  if (path === '/' || path === '/welcome') return createScalarisRoute('landing');
  if (path === '/worldview') return createScalarisRoute('worldview');
  if (path === '/identity') return createScalarisRoute('identity');
  if (path === '/nexus') return createScalarisRoute('nexus');
  if (path === '/assessments/pre') return createScalarisRoute('preassessment');
  if (path === '/assessments/post') return createScalarisRoute('postassessment');

  const missionMatch = path.match(/^\/sectors\/([^/]+)\/missions\/01\/([^/]+)$/);
  if (missionMatch) {
    const sectorId = decodeURIComponent(missionMatch[1]);
    if (missionMatch[2] === 'results') return createScalarisRoute('profile', { sectorId });
    const step = missionTaskSlugs.indexOf(missionMatch[2]);
    return createScalarisRoute('mission', { sectorId, step: step < 0 ? 0 : step });
  }

  const sprintMatch = path.match(/^\/sectors\/([^/]+)\/sprint$/);
  if (sprintMatch) return createScalarisRoute('sprint', { sectorId: decodeURIComponent(sprintMatch[1]) });

  const sectorMatch = path.match(/^\/sectors\/([^/]+)$/);
  if (sectorMatch) return createScalarisRoute('sector', { sectorId: decodeURIComponent(sectorMatch[1]) });

  return createScalarisRoute('landing');
}

export function pushScalarisRoute(route, { replace = false } = {}) {
  if (replace) {
    window.history.replaceState({ scalaris: true }, '', `#${route.path}`);
    return;
  }

  if (window.location.hash !== `#${route.path}`) {
    window.location.hash = route.path;
  }
}
