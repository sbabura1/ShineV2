// Public display metadata only. Learning content and access still come from the API.
// Keep all sector positions visible even when a class-filtered API omits locked sectors.
const sectorCatalog = [
  { id: 'gateway', name: 'Gateway', label: 'Immigration and migration' },
  { id: 'mosaic', name: 'Mosaic', label: 'Humanities and culture' },
  { id: 'civitas', name: 'Civitas', label: 'Government and community' },
  { id: 'horizon', name: 'Horizon', label: 'Workforce and future planning' },
  { id: 'sentinel', name: 'Sentinel', label: 'Public safety and crime' },
  { id: 'lumina', name: 'Lumina', label: 'Science and research' },
  { id: 'vitalis', name: 'Vitalis', label: 'Health and wellness' },
  { id: 'terra', name: 'Terra', label: 'Environment and sustainability' },
  { id: 'forge', name: 'Forge', label: 'Engineering and manufacturing' },
  { id: 'transit', name: 'Transit', label: 'Transportation and logistics' },
  { id: 'harvest', name: 'Harvest', label: 'Food and agricultural systems' },
  { id: 'arena', name: 'Arena', label: 'Sports and performance' },
  { id: 'venture', name: 'Venture', label: 'Business and entrepreneurship' },
  { id: 'mercator', name: 'Mercator', label: 'Finance and economics' },
];

export function displaySectors(available, access) {
  const byId = new Map(available.map(sector => [sector.id, sector]));
  const knownIds = new Set(sectorCatalog.map(sector => sector.id));
  return [...sectorCatalog, ...available.filter(sector => !knownIds.has(sector.id))].map(metadata => {
    const sector = byId.get(metadata.id);
    return { ...metadata, ...sector, enabled: Boolean(sector?.enabled &&
      (!access?.classId || access.allowedSectors?.includes(metadata.id))) };
  });
}
