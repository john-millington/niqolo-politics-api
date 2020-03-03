const fs = require('fs');
const MRPAnalyse = require('./MRPAnalyse');
const Parser = require('./Parser');
const PollParser = require('./PollParser');

const YEAR = process.argv[2];

const POLL_FILE = `polls/${YEAR}.csv`;
const CORPUS_FILE = `txt/${YEAR}.txt`;
const OUTPUT_FILE = `json/${YEAR}.json`;

if (process.argv[3] === 'poll') {
  fs.readFile(POLL_FILE, (err, data) => {
    const lines = data.toString();
    
    const reader = new PollParser(lines);
    const result = reader.read();
  
    fs.writeFileSync(`polls/polling.json`, JSON.stringify(result));
  });
} else if (process.argv[3] === 'mrp') {
  fs.readFile(POLL_FILE, (err, data) => {
    const lines = data.toString();
    
    const reader = new MRPAnalyse(lines, parseFloat(process.argv[4], 10));
    reader.read();
  });
} else {
  fs.readFile(CORPUS_FILE, (err, data) => {
    const lines = data.toString();
    
    const reader = new Parser(lines, YEAR);
    const result = reader.read();
  
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ constituencies: result }));
  });
}
