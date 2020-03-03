const ALLIANCE = require('./../data/config/remain-alliance.json');

class V2Candidates {
  constructor(data) {
    this.data = data;

    this.name = this.data.name;
    this.region = this.data.region;
    this.previous_year = this.data.years.map(item => item).sort().pop();
    this.latest = this.results();
    this.incumbent = this.latest[0];
  }

  candidates() {
    let runners = this.latest.map(result => result.party);
    if (this.incumbent.party === 'CON') {
      runners = runners.filter(party => party !== 'BXP');
    }

    const remain = ALLIANCE.constituencies[this.name];
    if (remain) {
      runners = runners.filter(party => {
        return remain.parties.indexOf(party) === -1;
      });
    }

    return runners;
  }

  results() {
    const results = [];
    Object.keys(this.data.constituency).forEach(party => {
      const share = this.data.constituency[party][this.previous_year];
      if (!share) {
        return;
      }

      results.push({
        party,
        share
      });
    });

    return results.sort((primary, secondary) => {
      if (primary.share > secondary.share) {
        return -1;
      }

      return 1;
    });
  }
}

module.exports = V2Candidates;
