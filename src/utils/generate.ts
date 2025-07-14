import crypto from 'crypto';

const wordList = [
  'planet',
  'whisper',
  'jungle',
  'clock',
  'tunnel',
  'pepper',
  'orbit',
  'velvet',
  'canyon',
  'ladder',
  'storm',
  'genius',
  'razor',
  'picnic',
  'silver',
  'breeze',
  'camera',
  'rocket',
  'maple',
  'sunset',
  'ticket',
  'mango',
  'ember',
  'shadow',
  'eagle',
  'olive',
  'anchor',
  'spiral',
  'puzzle',
  'ocean',
  'fossil',
  'ninja',
  'thunder',
  'banana',
  'globe',
  'iceberg',
  'salmon',
  'basket',
  'comet',
  'lantern',
  'jelly',
  'cactus',
  'falcon',
  'magnet',
  'wizard',
  'kettle',
  'marble',
  'coin',
  'tulip',
  'squirrel',
  'helmet',
  'lava',
  'acorn',
  'drift',
  'scooter',
  'frost',
  'grape',
  'blanket',
  'foggy',
  'hammer',
  'castle',
  'puppy',
  'neon',
  'oxygen',
  'daisy',
  'quill',
  'zipper',
  'cargo',
  'walnut',
  'ketchup',
  'syrup',
  'pixel',
  'radar',
  'biscuit',
  'melon',
  'hazel',
  'sloth',
  'domino',
  'tumble',
  'cricket',
  'donut',
  'snorkel',
  'pepper',
  'lantern',
  'shadow',
  'zipper',
  'helmet',
  'velvet',
  'eagle',
  'ticket',
  'velvet',
  'jungle',
  'canyon',
  'anchor',
  'rocket',
  'mango',
  'acorn',
  'comet',
  'puzzle',
  'storm',
];

//Generate Passphrase
export const generatePassphrase = (): string[] => {
  const shuffled = wordList.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 12);
};

//Generate transaction hash
export const generateTransactionHash = (): string => {
  const randomData = crypto.randomBytes(256);
  const hash = crypto.createHash('sha256').update(randomData).digest('hex');
  return hash;
};

function getLuhnCheckDigit(number: string): string {
  let sum = 0;
  let shouldDouble = true;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  const mod = sum % 10;
  return (mod === 0 ? 0 : 10 - mod).toString();
}

//Generate Master Card Number
export function generateMastercardNumber(): string {
  const prefixes = [
    ...Array.from({ length: 5 }, (_, i) => (51 + i).toString()), // 51 to 55
    ...Array.from({ length: 500 }, (_, i) => (2221 + i).toString()), // 2221 to 2720
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  // Generate remaining digits (16 - prefix.length - 1) to leave room for the check digit
  const length = 16;
  const numberWithoutCheck =
    prefix +
    Array.from({ length: length - prefix.length - 1 }, () =>
      Math.floor(Math.random() * 10).toString()
    ).join('');

  const checkDigit = getLuhnCheckDigit(numberWithoutCheck);
  return numberWithoutCheck + checkDigit;
}

//Get CVV
export function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

//Get Date
export function getDate(): string {
  const now = new Date();
  const futureDate = new Date(now);

  // Add three years to the date
  futureDate.setFullYear(futureDate.getFullYear() + 3);

  // Get the month (0-indexed, so add 1)
  const month = (futureDate.getMonth() + 1).toString().padStart(2, '0');

  // Get the last two digits of the year
  const year = futureDate.getFullYear().toString().slice(-2);

  return `${month}/${year}`;
}
