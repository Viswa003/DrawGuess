const words = [
  'apple', 'banana', 'cat', 'dog', 'elephant', 'frog', 'guitar', 'house', 
  'ice cream', 'jacket', 'kite', 'lemon', 'mountain', 'notebook', 'ocean',
  'piano', 'queen', 'rainbow', 'sun', 'tree', 'umbrella', 'volcano', 'waterfall',
  'xylophone', 'yacht', 'zebra'
];

function generateWord() {
  return words[Math.floor(Math.random() * words.length)];
}

module.exports = { generateWord };