const fs = require('fs');
const Parser = require('./Parser');

const YEAR = process.argv[2];
const CORPUS_FILE = `txt/${YEAR}.txt`;
const OUTPUT_FILE = `json/${YEAR}.json`;

fs.readFile(CORPUS_FILE, (err, data) => {
  const lines = data.toString();
  
  const reader = new Parser(lines, YEAR);
  const result = reader.read();

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ constituencies: result }));
});
