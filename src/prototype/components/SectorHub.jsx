import { useState } from 'react';
import SectorIcon from './SectorIcon';
export default function SectorHub({ sector, progress, onBack, onMission }) {
  const [levels, setLevels] = useState({});
  const complete = progress.sectors.find(item => item.sectorId === sector.id)?.completed;
  return <main className="page"><button type="button" className="btn secondary" onClick={onBack}>← Back to Nexus</button><section className="card sector-hero"><SectorIcon sectorId={sector.id} size={34} /><div className="eyebrow">{sector.name} sector</div><h1>{sector.label}</h1><p>{sector.workforceConnection}</p>
    {complete && <div className="callout"><strong>Sector completed</strong><p>All missions are complete. More sectors are coming soon.</p><button type="button" className="btn" onClick={onBack}>Back to the Nexus</button></div>}
    <div className="grid cols-3">{sector.sourceSkillGroups?.map(group => <section key={group.id}><h3>{group.title}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></section>)}</div><button type="button" className="btn secondary" disabled>Skills sprint · Coming soon</button></section>
    <header className="section-title"><div><h2>{sector.name} Missions</h2><p>Every difficulty keeps its own saved work. Completing any one difficulty completes the mission.</p></div></header>
    <div className="mission-card-grid">{sector.missions.map((mission, index) => {
      const difficulty = levels[mission.id] || sector.difficultyLevels[0].id;
      const track = progress.difficultyStates.find(item => item.sectorId === sector.id && item.missionId === mission.id && item.difficulty === difficulty);
      const summary = progress.missions.find(item => item.sectorId === sector.id && item.missionId === mission.id);
      const draft = track && ['IN_PROGRESS', 'CHANGES_REQUESTED'].includes(track.status);
      const submitted = track && ['COMPLETED', 'PENDING_REVIEW'].includes(track.status);
      return <article className="card sector-mission-card active" key={mission.id}><div className="mission-card-top"><div className="eyebrow">Mission {index + 1}</div><span className="tag">{summary?.completed ? 'Completed' : 'Available'}</span></div><h3>{mission.title}</h3>
        <label htmlFor={`difficulty-${mission.id}`}>Difficulty<select id={`difficulty-${mission.id}`} value={difficulty} onChange={event => setLevels(current => ({ ...current, [mission.id]: event.target.value }))}>{sector.difficultyLevels.map(level => <option key={level.id} value={level.id}>{level.label}</option>)}</select></label>
        <ul className="track-status-list">{sector.difficultyLevels.map(level => { const saved = progress.difficultyStates.find(item => item.sectorId === sector.id && item.missionId === mission.id && item.difficulty === level.id); return <li key={level.id}><span>{level.label}</span><span>{saved?.status === 'COMPLETED' ? 'Completed' : saved?.status === 'PENDING_REVIEW' ? 'Awaiting review' : saved?.activeRunId ? 'Saved work' : 'Not started'}</span></li>; })}</ul>
        <div className="cta-row"><button type="button" className="btn" onClick={() => onMission(mission.id, difficulty, submitted ? { existingRunId: track.activeRunId } : {})}>{draft ? 'Continue mission' : submitted ? 'View submission' : 'Start mission'}</button>{track?.activeRunId && <button type="button" className="btn secondary" onClick={() => onMission(mission.id, difficulty, { restart: true, previousRunId: track.activeRunId })}>Start again</button>}</div>
      </article>;
    })}</div></main>;
}
