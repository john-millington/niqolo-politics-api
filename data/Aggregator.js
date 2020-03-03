const fs = require('fs');

const ELECTION_RESULTS = [
  '1955', '1959', '1964', '1966',
  '1970', '1974', '1979', '1983',
  '1987', '1992', '1997', '2001',
  '2005', '2010', '2015', '2017'
];

const read = (output) => {
  const multipliers = {};
  const results = {};

  ELECTION_RESULTS.forEach(year => {
    const data = fs.readFileSync(`./json/${year}.json`);
    const json = JSON.parse(data.toString());

    const headline = {
      contested: {},
      electorate: 0,
      turnout: 0,
      parties: { },
      percentages: { }
    };

    json.constituencies.forEach(constituency => {
      headline.electorate += constituency.breakdown.electorate;
      headline.turnout += constituency.breakdown.turnout;

      Object.keys(constituency.breakdown.votes).forEach(party => {
        if (!headline.contested[party]) {
          headline.contested[party] = {
            seats: 0,
            votes: 0,
            turnout: 0
          };

          headline.parties[party] = 0;
        }

        if (constituency.breakdown.votes[party] > 0) {
          headline.contested[party].seats += 1;
          headline.contested[party].votes += constituency.breakdown.votes[party];
          headline.contested[party].turnout += constituency.breakdown.turnout;
        }

        headline.parties[party] += constituency.breakdown.votes[party];
      });
    });

    Object.keys(headline.parties).forEach(party => {
      headline.percentages[party] = headline.parties[party] / headline.turnout;
      
      if (headline.contested[party].votes > 0) {
        headline.contested[party].average = (
          headline.contested[party].votes / headline.contested[party].turnout
        );
      } else {
        headline.contested[party].average = 0;
      }
    });

    results[year] = {};
    Object.keys(headline.contested).forEach(party => {
      results[year][party] = headline.contested[party].average;
    });

    Object.keys(headline.percentages).forEach(party => {
      if (!headline.percentages[party]) {
        return;
      }

      if (!multipliers[party]) {
        multipliers[party] = {
          passes: 0,
          share: 0
        };
      }

      multipliers[party].passes += 1;
      multipliers[party].share += headline.percentages[party];
    })
  });

  const resolver = {};
  Object.keys(multipliers).forEach(party => {
    resolver[party] = multipliers[party].share / multipliers[party].passes;
  });

  if (output) {
    fs.writeFileSync(`${output}.json`, JSON.stringify({
      results,
      resolver
    }));
  }
};

read(process.argv[2]);
