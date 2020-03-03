const fs = require('fs');

const MConstituency = require('./MConstituency');
const V2Constituency = require('./V2Constituency');

const PATH = './data/json';

class MFactory {
  constructor(config) {
    this.config = config;
    this.latest_year = Object.keys(this.config.results).sort().pop();
  }

  generate() {
    this.generated = {};
    
    const national = {};
    Object.keys(this.config.results).forEach(year => {
      Object.keys(this.config.results[year]).forEach(party => {
        if (!national[party]) {
          national[party] = {};
        }

        national[party][year] = this.config.results[year][party];
      });
    });

    return Promise.all(Object.keys(
      this.config.results
    ).map(year => new Promise((resolve) => {    
      fs.readFile(`${PATH}/${year}.json`, (err, data) => {
        JSON.parse(data.toString()).constituencies.forEach(constituency => {
          if (parseInt(constituency.region) === 1) {
            return;
          }

          const name = constituency.name;
          if (!this.generated[name]) {
            this.generated[name] = {
              name,
              constituency: {},
              region: constituency.region,
              national,
              years: [],
              forecast: this.config.forecast
            }
          }
          
          if (year === this.latest_year) {
            this.generated[name].mp = constituency.mp;
          }

          this.generated[name].years.push(year);

          Object.keys(constituency.results).forEach(party => {
            if (!this.generated[name].constituency[party]) {
              this.generated[name].constituency[party] = {};
            }

            this.generated[name].constituency[party][year] = constituency.results[party];
          });
        });

        resolve();
      });
    })));
  }

  run() {
    const results = {
      change: {},
      constituencies: {},
      headline: {},
      previous: {},
      regions: {}
    };
 
    Object.keys(this.generated).forEach(constituency => {
      if (this.generated[constituency].years.indexOf(this.latest_year) === -1) {
        return false;
      }

      const previous_results = this.generated[constituency];
      const predictor = new V2Constituency(this.generated[constituency]);
      const result = predictor.predict();

      let winner = { party: '', share: 0 };
      Object.keys(result).forEach(party => {
        if (result[party] > winner.share) {
          winner = { party, share: result[party] };
        }
      });

      let previous_winner = { party: '', share: 0 };
      Object.keys(previous_results.constituency).forEach(party => {
        const constituency_result = previous_results.constituency[party][this.latest_year];
        if (constituency_result > previous_winner.share) {
          previous_winner = { party, share: constituency_result };
        }
      })

      if (!results.headline[winner.party]) {
        results.headline[winner.party] = 0;
      }

      if (!results.previous[previous_winner.party]) {
        results.previous[previous_winner.party] = 0;
      }

      if (!results.regions[predictor.region]) {
        results.regions[predictor.region] = {};
      }

      if (!results.regions[predictor.region][winner.party]) {
        results.regions[predictor.region][winner.party] = 0;
      }

      results.headline[winner.party] += 1;
      results.previous[previous_winner.party] += 1;
      results.regions[predictor.region][winner.party] += 1;

      results.constituencies[predictor.name] = {
        result,
        region: predictor.region,
        mp: this.generated[constituency].mp,
        previous: previous_winner.party,
        winner: winner.party,
        details: {
          ...previous_results,
          national: undefined,
          forecast: undefined,
          models: predictor.swing_models,
          deltas: predictor.projection_multipliers,
          true_deltas: predictor.swing
        }
      };
    });

    [...Object.keys(results.previous), ...Object.keys(results.headline)].forEach(party => {
      const latest = results.headline[party] ? results.headline[party] : 0;
      const last = results.previous[party] ? results.previous[party] : 0;

      results.change[party] = latest - last;
    });

    return results;
  }
}

module.exports = MFactory;