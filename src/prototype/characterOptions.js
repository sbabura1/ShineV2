export const AVATAR_DEFAULT = {
  gender: 'Masculine',
  body: 'Medium',
  occupation: 'Healthcare',
  hair: 'Wavy',
  skin: '#c98b63',
  hairColor: '#38251f',
};

export const BEACON_DEFAULT = {
  faceColor: '#152631',
  coat: '#ffffff',
  bulb: 'Original',
  bulbColor: '#171717',
  sneakers: '#087e9b',
};

export const CHARACTER_COLORS = [
  ['#ffffff', 'White'],
  ['#087e9b', 'Ocean'],
  ['#7043ad', 'Purple'],
  ['#e46536', 'Orange'],
  ['#148375', 'Teal'],
  ['#e55183', 'Pink'],
  ['#ffd166', 'Gold'],
  ['#263c50', 'Navy'],
];

export const BEACON_FIELDS = [
  ['faceColor', 'Face color', [
    ['#152631', 'Original black'],
    ['#ffffff', 'White'],
    ['#e6c6a5', 'Light brown'],
    ['#c49a6c', 'Warm tan'],
    ['#a8744f', 'Caramel brown'],
    ['#805438', 'Medium brown'],
    ['#593b2b', 'Deep brown'],
    ['#38251f', 'Espresso brown'],
    ['#354f6b', 'Blue'],
    ['#75499b', 'Violet'],
    ['#148375', 'Teal'],
  ]],
  ['coat', 'Coat color', CHARACTER_COLORS],
  ['bulb', 'Bulb finish', ['Original', 'Soft glow', 'Bright glow']],
  ['bulbColor', 'Bulb color', CHARACTER_COLORS],
  ['sneakers', 'Sneaker color', CHARACTER_COLORS],
];

export const AVATAR_FIELDS = [
  ['gender', 'Presentation', ['Masculine', 'Feminine']],
  ['skin', 'Skin tone', [['#f5d6b9', 'Light'], ['#e0b08b', 'Warm'], ['#c98b63', 'Medium'], ['#986342', 'Brown'], ['#5e3d2e', 'Deep']]],
  ['hair', 'Hair style', ['Short', 'Wavy', 'Long (tied)']],
  ['hairColor', 'Hair color', [['#38251f', 'Dark brown'], ['#111827', 'Black'], ['#b66a36', 'Auburn'], ['#e4bd65', 'Blond'], ['#a7abb6', 'Silver'], ['#7043ad', 'Purple']]],
  ['body', 'Body build', ['Slim', 'Medium', 'Bulky']],
  ['occupation', 'Occupation', ['Healthcare', 'Technology', 'Engineer', 'Business', 'Educator', 'Astronaut']],
];
