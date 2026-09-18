import { ArrowRight } from 'lucide-react';
import { sectors } from '../data';
import Button from '../components/ui/Button';
import PageIntro from '../components/ui/PageIntro';
import NexusMap from '../components/nexus/NexusMap';
import NexusSidebar from '../components/nexus/NexusSidebar';
import SectorGrid from '../components/nexus/SectorGrid';

export default function Nexus({ identity, onSector, onMission }) {
  const currentSector = sectors.find((sector) => sector.id === identity.sector);

  return (
    <main className="page">
      <PageIntro
        eyebrow="Central hub"
        title="Welcome to the Nexus"
        copy="A connected network of professional contexts."
        action={<Button variant="accent" onClick={onMission}>Continue mission <ArrowRight size={17} /></Button>}
      />
      <div className="nexus-layout">
        <NexusMap sectors={sectors} onSector={onSector} />
        <NexusSidebar identity={identity} currentSector={currentSector} onMission={onMission} />
      </div>
      <SectorGrid sectors={sectors} onSector={onSector} />
    </main>
  );
}
