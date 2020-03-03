class MRPAnalyse {
  constructor(data, scope) {
    this.data = data;
    this.scope = scope;
  }

  read() {
    const lines = this.data.split('\n');
    const header = lines.shift().split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g);

    const results = {};

    lines.forEach(line => {
      const fields = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g);
      const winner_text = fields[1].split(' ')[0].toLowerCase();

      let winner = 0;
      let winner_index = 0;

      for (let j = 2; j < fields.length; j++) {
        if (header[j].toLowerCase().trim() === winner_text.trim()) {
          const result = parseInt(fields[j], 10);
          winner = result;
          winner_index = j;
        }
      }
      
      let closest = 100;
      let closest_index = 100;

      for (let i = 2; i < fields.length; i++) {
        if (i === winner_index) {
          continue;
        }

        const other = parseInt(fields[i], 10);
        if (Math.abs(winner - other) < closest) {
          closest = Math.abs(winner - other);
          closest_index = i;
        }
      }

      if (closest < 100 && winner_index > 0) {
        const final_other = parseInt(fields[closest_index], 10);

        const prime_text = winner_text.toUpperCase();
        const other_text = header[closest_index].trim().toUpperCase();

        if (winner - final_other <= this.scope) {
          console.log(`${header[winner_index]} risk to ${header[closest_index]} (${fields[1]}): ${fields[0]}`);
          if (!results[prime_text]) {
            results[prime_text] = {
              risks: {
                total: 0
              },
              potentials: {
                total: 0
              }
            };
          }

          if (!results[other_text]) {
            results[other_text] = {
              risks: {
                total: 0
              },
              potentials: {
                total: 0
              }
            };
          }

          if (!results[prime_text].risks[other_text]) {
            results[prime_text].risks[other_text] = 0;
          }

          if (!results[other_text].potentials[prime_text]) {
            results[other_text].potentials[prime_text] = 0;
          }

          results[prime_text].risks[other_text] += 1;
          results[other_text].potentials[prime_text] += 1;

          results[prime_text].risks.total += 1;
          results[other_text].potentials.total += 1;
        }
      }
    });

    console.log(results);
  }
}

module.exports = MRPAnalyse;
