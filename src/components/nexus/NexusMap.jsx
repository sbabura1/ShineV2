const positions = [
  ['gateway', 15, 18], ['mosaic', 34, 11], ['civitas', 63, 12], ['horizon', 84, 20],
  ['sentinel', 10, 39], ['lumina', 27, 35], ['vitalis', 79, 36], ['terra', 90, 50],
  ['forge', 9, 65], ['transit', 27, 72], ['harvest', 76, 73], ['arena', 91, 71],
  ['venture', 38, 87], ['mercator', 63, 88],
];

export default function NexusMap({ sectors, onSector }) {
  return (
    <section className="map-panel">
      <div className="map-lines" />
      <div className="nexus-center"><span>&infin;</span><b>THE NEXUS</b><small>central hub</small></div>
      {positions.map(([id, left, top], index) => {
        const sector = sectors.find((item) => item.id === id);
        return (
          <button
            className={`node ${index > 3 ? 'locked' : ''}`}
            style={{ left: `${left}%`, top: `${top}%`, '--node-color': sector.color }}
            key={id}
            onClick={() => onSector(id)}
            title={sector.label}
          >
            <span>{sector.icon}</span><b>{sector.name}</b><small>{index > 3 ? 'Clearance' : 'Open'}</small>
          </button>
        );
      })}
      <div className="map-key"><span><i /> Nexus connection</span><span><i className="dash" /> Cross-sector link</span></div>
    </section>
  );
}
