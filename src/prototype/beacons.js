import original from './assets/beacons/Beacon-Original.jpg';
import cosmicOriginal from './assets/beacons/Beacon-Cosmic-Original.jpg';
import cosmicRevised from './assets/beacons/Beacon-Cosmic-Revised.jpg';
import forest from './assets/beacons/Beacon-Forest.jpg';
import midnightHelmet from './assets/beacons/Beacon-Midnight-Helmet.jpg';
import oceanOriginal from './assets/beacons/Beacon-Ocean-Original.jpg';
import oceanRevised from './assets/beacons/Beacon-Ocean-Revised.jpg';
import solar from './assets/beacons/Beacon-Solar.jpg';
import tealFace from './assets/beacons/Beacon-Teal-Face.jpg';
import whiteFace from './assets/beacons/Beacon-White-Face.jpg';

export const beaconOptions = [
  { id: 'Beacon-Original.jpg', label: 'Original', src: original },
  { id: 'Beacon-Cosmic-Original.jpg', label: 'Cosmic Original', src: cosmicOriginal },
  { id: 'Beacon-Cosmic-Revised.jpg', label: 'Cosmic Revised', src: cosmicRevised },
  { id: 'Beacon-Forest.jpg', label: 'Forest', src: forest },
  { id: 'Beacon-Midnight-Helmet.jpg', label: 'Midnight Helmet', src: midnightHelmet },
  { id: 'Beacon-Ocean-Original.jpg', label: 'Ocean Original', src: oceanOriginal },
  { id: 'Beacon-Ocean-Revised.jpg', label: 'Ocean Revised', src: oceanRevised },
  { id: 'Beacon-Solar.jpg', label: 'Solar', src: solar },
  { id: 'Beacon-Teal-Face.jpg', label: 'Teal Face', src: tealFace },
  { id: 'Beacon-White-Face.jpg', label: 'White Face', src: whiteFace },
];

export function selectedBeacon(identity = {}) {
  return beaconOptions.find((option) => option.id === identity.beacon) || beaconOptions[0];
}
