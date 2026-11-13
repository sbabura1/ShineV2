import SectorIcon from './SectorIcon';
import { displaySectors } from '../utils/sectorCatalog';
// Coordinates are presentation only; sector names, availability and progress come from the API.
const positions = [[15,16],[34,10],[63,11],[84,19],[9,38],[27,35],[79,35],[91,48],[8,64],[26,71],[76,72],[91,70],[38,87],[63,88]];
export default function Nexus({ profile, sectors: availableSectors, access, progress, lastVisited, onResume, onSector, onPreAssessment }) {
  const sectors = displaySectors(availableSectors, access);
  const disabledLabel = access?.classId ? 'Not enabled for class' : 'Unavailable';
  const baseline = progress.baseline;
  const availableIds = new Set(sectors.filter(sector => sector.enabled).map(sector => sector.id));
  const completed = progress.sectors.filter(sector => sector.completed && availableIds.has(sector.sectorId)).map(sector => sector.sectorId);
  const open = sectors.filter(sector => sector.enabled);
  const lastSector = open.find(sector => sector.id === lastVisited?.sectorId);
  const lastMission = lastSector?.missions?.find(mission => mission.id === lastVisited?.missionId);
  const canResume = lastSector && (lastVisited.screen === 'sector' || lastMission);
  const difficultyLabel = lastSector?.difficultyLevels?.find(level => level.id === lastVisited?.difficulty)?.label || lastVisited?.difficulty;
  const baselineLabel = baseline.submittedAt ? 'View submitted pre-assessment' : baseline.activeRunId ? 'Continue pre-assessment' : 'Begin pre-assessment';
  return <main className="page"><section className="card remote-baseline-card"><div><div className="eyebrow">Your starting point</div><h2>Pre-assessment</h2><p>{baseline.submittedAt ? 'Completed. Your responses and result are saved.' : 'Save and resume your baseline before its one final submission.'}</p></div><button type="button" className="btn gold" onClick={onPreAssessment}>{baselineLabel}</button></section>
    <header className="section-title"><div><div className="eyebrow">Central Hub</div><h1>Welcome to The Nexus{profile.name ? `, ${profile.name.split(' ')[0]}` : ''}</h1><p>Continue your saved work or explore an available sector.</p></div></header>
    {access?.classId && open.length === 0 && <p className="callout" role="status">Your teacher has not enabled any sectors for this class yet. You can still update your identity or complete your pre-assessment.</p>}
    {sectors.length > 0 && <div className="nexus-layout">
      <section className="card nexus-resume-card" aria-label="Your progress"><div><h2>Your progress</h2>{canResume ? <p>Last visited: <strong>{lastSector.name}</strong>{lastMission && <> / {lastMission.title} / {difficultyLabel}</>}</p> : <p>{lastVisited ? 'Your last visited path is currently unavailable. Choose an available sector to continue learning.' : 'Visit a sector to start your learning path.'}</p>}</div>{canResume && <button type="button" className="btn" onClick={() => onResume(lastVisited)}>Continue where you left off</button>}</section>
      <div className="card world-map"><svg className="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{sectors.map((sector, index) => <line key={sector.id} className="network-line" x1="50" y1="50" x2={positions[index]?.[0] || 50} y2={positions[index]?.[1] || 50} />)}</svg><div className="nexus-core"><div><strong>THE NEXUS</strong><span className="nexus-core-label">Your learning network</span></div></div>
      {sectors.map((sector, index) => <button type="button" key={sector.id} className={`sector-node ${sector.enabled ? 'open' : 'locked'}`} disabled={!sector.enabled} style={{ left: `${positions[index]?.[0] || 50}%`, top: `${positions[index]?.[1] || 50}%` }} onClick={() => onSector(sector.id)} title={`${sector.name}: ${sector.enabled ? 'Available' : disabledLabel}`}><span className="node-icon"><SectorIcon sectorId={sector.id} size={25} /></span><span className="node-name">{sector.name}</span><span className="node-status">{sector.enabled ? completed.includes(sector.id) ? 'Completed' : 'Available' : disabledLabel}</span></button>)}
    </div></div>}
    {sectors.length > 0 && <><header className="section-title"><div><h2>Sectors of Scalaris</h2><p>{access?.classId ? 'Open an enabled sector. Other sectors stay visible but are disabled for your class.' : open.length === sectors.length ? 'Every sector is open. Choose one to begin.' : `${open.map(sector => sector.name).join(', ') || 'No sectors'} ${open.length === 1 ? 'is' : 'are'} available now.`}</p></div></header><div className="grid cols-4">{sectors.map(sector => <button type="button" key={sector.id} className={`card sector ${sector.enabled ? 'open' : 'locked'}`} disabled={!sector.enabled} onClick={() => onSector(sector.id)}><div><div className="sector-icon"><SectorIcon sectorId={sector.id} size={26} /></div><h3>{sector.name}</h3>{sector.label && <p>{sector.label}</p>}</div><footer>{sector.enabled ? completed.includes(sector.id) ? 'Completed' : 'Open sector →' : disabledLabel}</footer></button>)}</div></>}
  </main>;
}
