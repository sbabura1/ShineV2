export const mathMoments = [
  'A percentage is a part of a whole. The whole you choose matters.',
  'Zero is an even number: it can be divided by two with no remainder.',
  'An average can hide differences. Take a look at the spread, too.',
  'One is neither a prime number nor a composite number.',
  'Every square is a rectangle, but not every rectangle is a square.',
  'A quick estimate is a useful checkpoint before an exact calculation.',
];

export const studyMoments = [
  'Take your time and read each question carefully.',
  'A short pause can help you return with a fresh perspective.',
  'Find a comfortable place where you can focus.',
  'Work at your own pace and give each question your best effort.',
];

export function loadingMessage(variant, name) {
  switch (variant) {
    case 'sector': return { title: `Opening ${name || 'your sector'}`, description: 'Bringing your missions and progress together.' };
    case 'mission': return { title: 'Preparing your mission', description: name || 'Getting your questions and workspace ready.' };
    case 'resume': return { title: 'Picking up where you left off', description: name || 'Opening your saved questions and responses.' };
    case 'assessment': return { title: 'Opening your pre-assessment', description: 'A quiet space to focus and do your best.' };
    case 'nexus': return { title: 'Returning to the Nexus', description: 'Bringing your latest progress with you.' };
    default: return { title: 'Getting your Nexus ready', description: 'Bringing your identity and saved progress together.' };
  }
}
