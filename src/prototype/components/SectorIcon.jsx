import {
  BadgeDollarSign,
  Cog,
  Compass,
  DoorOpen,
  Globe2,
  HeartPulse,
  Landmark,
  Layers3,
  Microscope,
  ShieldCheck,
  TrainFront,
  TrendingUp,
  Trophy,
  Wheat,
} from 'lucide-react';

const icons = {
  gateway: DoorOpen,
  mosaic: Layers3,
  civitas: Landmark,
  horizon: Compass,
  sentinel: ShieldCheck,
  lumina: Microscope,
  vitalis: HeartPulse,
  terra: Globe2,
  forge: Cog,
  transit: TrainFront,
  harvest: Wheat,
  arena: Trophy,
  venture: TrendingUp,
  mercator: BadgeDollarSign,
};

export default function SectorIcon({ sectorId, size = 24, className = '' }) {
  const Icon = icons[sectorId] || Compass;
  return <Icon className={className} size={size} strokeWidth={1.7} aria-hidden="true" />;
}
