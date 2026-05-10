const adjectives = [
  'alpha', 'brave', 'calm', 'delta', 'eager',
  'frost', 'golden', 'happy', 'iron', 'jade',
  'keen', 'lunar', 'mango', 'noble', 'ocean',
  'pearl', 'quick', 'river', 'solar', 'tiger'
];

const nouns = [
  'arrow', 'bloom', 'cloud', 'drift', 'ember',
  'flame', 'grove', 'haven', 'isle', 'jewel',
  'knot', 'leaf', 'mesa', 'nest', 'oak',
  'pine', 'quill', 'rock', 'star', 'tide'
];

export function generateReceiverId(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}-${noun}-${num}`;
}
