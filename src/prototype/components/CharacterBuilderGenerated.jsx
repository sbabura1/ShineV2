import React, { useEffect, useState } from 'react';
import masculineAtlas from '../assets/characters/avatar-complete-masculine-v5.png';
import feminineAtlas from '../assets/characters/avatar-complete-feminine-v5.png';
import masculineShortAtlas from '../assets/characters/avatar-complete-masculine-short-v6.png';
import masculineTiedAtlas from '../assets/characters/avatar-complete-masculine-tied-v6.png';
import feminineShortAtlas from '../assets/characters/avatar-complete-feminine-short-v6.png';
import feminineTiedAtlas from '../assets/characters/avatar-complete-feminine-tied-v6.png';
import avatarInitial from '../assets/characters/avatar-initial-v2.png';
import beaconBase from '../assets/characters/beacon-base.png';
import { AVATAR_DEFAULT, AVATAR_FIELDS, BEACON_DEFAULT, BEACON_FIELDS } from '../characterOptions';

export { AVATAR_DEFAULT, BEACON_DEFAULT } from '../characterOptions';

export const AVATAR_RENDER_VERSION = 'generated-complete-v7';
export const BEACON_RENDER_VERSION = 'beacon-custom-v2';

const avatarCache = new Map();
const beaconCache = new Map();
const avatarAtlases = {
  Masculine: { Short: masculineShortAtlas, Wavy: masculineAtlas, 'Long (tied)': masculineTiedAtlas },
  Feminine: { Short: feminineShortAtlas, Wavy: feminineAtlas, 'Long (tied)': feminineTiedAtlas },
};
const loadImage = (source) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = source;
});

async function renderCompleteAvatar(values) {
  const design = { ...AVATAR_DEFAULT, ...values };
  if (design.gender === 'Neutral') design.gender = 'Masculine';
  const key = `${design.gender}:${design.body}:${design.occupation}:${design.hair}:${design.skin}:${design.hairColor}`;
  if (avatarCache.has(key)) return avatarCache.get(key);

  const atlasSource = avatarAtlases[design.gender]?.[design.hair] || avatarAtlases.Masculine.Wavy;
  const atlas = await loadImage(atlasSource);
  const column = { Slim: 0, Medium: 1, Bulky: 2 }[design.body] ?? 1;
  const row = { Healthcare: 0, Technology: 1, Engineer: 2, Business: 3, Educator: 4, Astronaut: 5 }[design.occupation] ?? 0;
  const cellHeight = atlas.height / 6;
  // The generated atlas deliberately has wide outside breathing room, so its
  // character centers are not the mathematical centers of three equal columns.
  // Anchor each crop to the rendered figure instead of slicing the full sheet.
  const characterCenters = [.3, .5, .695];
  const cropWidth = atlas.width * .2;
  const sourceX = atlas.width * characterCenters[column] - cropWidth / 2;
  const verticalInset = cellHeight * .04;
  const sourceY = row * cellHeight + verticalInset;
  const sourceHeight = cellHeight - verticalInset * 2;
  const canvas = document.createElement('canvas');
  canvas.width = 420;
  canvas.height = 560;
  const context = canvas.getContext('2d');
  context.drawImage(atlas, sourceX, sourceY, cropWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = pixels.data;
  const hex = (value) => value.replace('#', '').match(/../g).map((part) => parseInt(part, 16));
  const skinTarget = hex(design.skin);
  const hairTarget = hex(design.hairColor);
  const recolor = (index, target, minimum = .35) => {
    const lightness = (.2126 * data[index] + .7152 * data[index + 1] + .0722 * data[index + 2]) / 255;
    const shade = minimum + lightness * (1.12 - minimum);
    for (let channel = 0; channel < 3; channel += 1) data[index + channel] = Math.min(255, target[channel] * shade);
  };
  for (let y = 0; y < canvas.height; y += 1) for (let x = 0; x < canvas.width; x += 1) {
    const index = (y * canvas.width + x) * 4;
    if (data[index + 3] < 20) continue;
    const red = data[index]; const green = data[index + 1]; const blue = data[index + 2];
    const sourceHairPigment = red > 38 && red < 145 && green > 22 && green < 105 && blue < 88
      && red - green > 13 && green - blue > 3;
    const warmSkin = !sourceHairPigment && red > 72 && red - green > 8 && green - blue > 5;
    const faceZone = y < 170 && x > 125 && x < 295;
    const handZone = y > 135 && y < 365 && ((x > 70 && x < 175) || (x > 245 && x < 350));
    const upperHair = y < 86 && x > 126 && x < 294;
    const sideHair = design.hair !== 'Short' && y >= 62 && y < 146
      && ((x > 120 && x < 168) || (x > 252 && x < 300));
    const tiedHair = design.hair === 'Long (tied)' && y >= 112 && y < 196
      && ((x > 112 && x < 154) || (x > 266 && x < 308));
    const protectedFace = y >= 86 && y < 170 && x >= 164 && x <= 256;
    const darkHair = !protectedFace && (upperHair || sideHair || tiedHair) && sourceHairPigment;
    if (darkHair) recolor(index, hairTarget, .2);
    else if (warmSkin && (faceZone || handZone)) recolor(index, skinTarget, .48);
  }
  context.putImageData(pixels, 0, 0);
  const source = canvas.toDataURL('image/png');
  avatarCache.set(key, source);
  return source;
}

const hexToRgb = (value) => value.replace('#', '').match(/../g).map((part) => parseInt(part, 16));

function tintPixel(data, index, color, strength = 1) {
  const target = hexToRgb(color);
  const lightness = .2126 * data[index] + .7152 * data[index + 1] + .0722 * data[index + 2];
  for (let channel = 0; channel < 3; channel += 1) {
    data[index + channel] = data[index + channel] * (1 - strength)
      + Math.min(255, target[channel] * (.5 + lightness / 255 * .75)) * strength;
  }
}

async function renderBeacon(values) {
  const design = { ...BEACON_DEFAULT, ...values };
  if (!['Original', 'Soft glow', 'Bright glow'].includes(design.bulb)) design.bulb = 'Original';
  const key = JSON.stringify(design);
  if (beaconCache.has(key)) return beaconCache.get(key);

  const sourceImage = await loadImage(beaconBase);
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 640;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = pixels.data;

  for (let y = 0; y < canvas.height; y += 1) for (let x = 0; x < canvas.width; x += 1) {
    const index = (y * canvas.width + x) * 4;
    if (!data[index + 3]) continue;
    const sourceX = x * 1254 / 640;
    const sourceY = y * 1254 / 640;
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);

    if (design.coat !== '#ffffff'
      && sourceY < 880
      && (sourceY > 572 || (sourceX > 870 && sourceY > 490))
      && maximum - minimum < 36
      && minimum > 95) tintPixel(data, index, design.coat, .8);

    if (design.faceColor !== '#152631'
      && ((sourceX - 596) / 174) ** 2 + ((sourceY - 390) / 145) ** 2 < 1) {
      const target = hexToRgb(design.faceColor);
      const lightFace = target.reduce((sum, channel) => sum + channel, 0) > 540;
      if (lightFace) {
        const lightness = .2126 * red + .7152 * green + .0722 * blue;
        const shade = lightness > 110 ? Math.max(18, 255 - lightness) : 240 + lightness * .12;
        for (let channel = 0; channel < 3; channel += 1) data[index + channel] = shade * target[channel] / 255;
      } else if (maximum < 110) {
        const lightness = .2126 * red + .7152 * green + .0722 * blue;
        for (let channel = 0; channel < 3; channel += 1) {
          data[index + channel] = Math.min(255, target[channel] * (.78 + lightness / 175));
        }
      }
    }

    if (((sourceX - 568) / 32) ** 2 + ((sourceY - 110) / 32) ** 2 < 1
      && maximum < 210
      && design.bulbColor !== '#171717') tintPixel(data, index, design.bulbColor, .8);

    if (sourceY > 1045
      && sourceY < 1105
      && ((sourceX > 346 && sourceX < 460) || (sourceX > 710 && sourceX < 820))
      && maximum - minimum > 65) tintPixel(data, index, design.sneakers, .94);
  }

  context.putImageData(pixels, 0, 0);
  if (design.bulb !== 'Original') {
    context.save();
    context.globalCompositeOperation = 'screen';
    const x = 568 * 640 / 1254;
    const y = 110 * 640 / 1254;
    const radius = design.bulb === 'Bright glow' ? 39 : 27;
    const glow = context.createRadialGradient(x, y, 6, x, y, radius);
    glow.addColorStop(0, `${design.bulbColor}b0`);
    glow.addColorStop(1, `${design.bulbColor}00`);
    context.fillStyle = glow;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    context.restore();
  }

  const source = canvas.toDataURL('image/png');
  beaconCache.set(key, source);
  return source;
}

export function IdentityAvatar({ identity, className = '' }) {
  const current = identity.avatarRenderVersion === AVATAR_RENDER_VERSION ? identity.avatarImage : null;
  return <img className={className} src={current || avatarInitial} alt="Your customized avatar" width="34" height="34" />;
}

export default function CharacterBuilderGenerated({ kind, identity, setIdentity }) {
  const avatar = kind === 'avatar';
  const [open, setOpen] = useState(avatar);
  const [preview, setPreview] = useState(() => avatar && identity.avatarRenderVersion === AVATAR_RENDER_VERSION ? identity.avatarImage : null);
  const design = { ...AVATAR_DEFAULT, ...identity.avatarDesign };
  const beaconDesign = { ...BEACON_DEFAULT, ...identity.beaconDesign };

  useEffect(() => {
    let active = true;
    const render = avatar ? renderCompleteAvatar(design) : renderBeacon(beaconDesign);
    render.then((source) => {
      if (!active) return;
      setPreview(source);
      setIdentity((current) => {
        if (avatar) return current.avatarImage === source && current.avatarRenderVersion === AVATAR_RENDER_VERSION
          ? current
          : { ...current, avatarImage: source, avatarRenderVersion: AVATAR_RENDER_VERSION };
        return current.beaconImage === source && current.beaconRenderVersion === BEACON_RENDER_VERSION
          ? current
          : { ...current, beacon: 'custom', beaconDesign, beaconImage: source, beaconRenderVersion: BEACON_RENDER_VERSION };
      });
    }).catch(() => {});
    return () => { active = false; };
  }, [avatar, design.gender, design.body, design.occupation, design.hair, design.skin, design.hairColor,
    beaconDesign.faceColor, beaconDesign.coat, beaconDesign.bulb, beaconDesign.bulbColor, beaconDesign.sneakers, setIdentity]);

  const updateAvatar = (field, value) => setIdentity((current) => ({
    ...current,
    avatarDesign: { ...AVATAR_DEFAULT, ...current.avatarDesign, [field]: value },
  }));
  const updateBeacon = (field, value) => setIdentity((current) => ({
    ...current,
    beaconDesign: { ...BEACON_DEFAULT, ...current.beaconDesign, [field]: value },
  }));
  const fields = avatar ? AVATAR_FIELDS : BEACON_FIELDS;
  const activeDesign = avatar ? design : beaconDesign;
  return <section className={`character-builder ${avatar ? 'character-builder-avatar' : 'character-builder-beacon'}`} aria-label={avatar ? 'Avatar builder' : 'Beacon builder'}>
    <div className="eyebrow">{avatar ? 'Your Avatar' : 'Your Beacon'}</div>
    <div className="character-preview generated-character-preview">{preview && <img src={preview} alt={avatar ? 'Complete customized avatar' : 'Beacon appearance preview'} width={420} height={avatar ? 560 : 420} />}</div>
    <p className="builder-caption">{avatar ? `${design.body} build · ${design.occupation} · Complete generated character` : 'Your companion, your style'}</p>
    <button type="button" className="btn secondary builder-toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? `Close ${avatar ? 'avatar' : 'Beacon'} editor` : `Edit your ${avatar ? 'avatar' : 'Beacon'}`} <span aria-hidden="true">{open ? '▴' : '▾'}</span></button>
    {open && <div className="builder-fields">
      <p>{avatar ? 'Choose a complete character render. Heads, bodies and clothing always stay together.' : 'Customize your companion. Your choices save automatically.'}</p>
      {fields.map(([field, label, options]) => <label key={field}>{label}<select value={activeDesign[field]} onChange={(event) => (avatar ? updateAvatar : updateBeacon)(field, event.target.value)}>{options.map((option) => <option key={Array.isArray(option) ? option[0] : option} value={Array.isArray(option) ? option[0] : option}>{Array.isArray(option) ? option[1] : option}</option>)}</select></label>)}
      <button type="button" className="btn good" onClick={() => setOpen(false)}>Save {avatar ? 'avatar' : 'Beacon'}</button>
    </div>}
    <small className="builder-saved">✓ Appearance saved</small>
  </section>;
}
