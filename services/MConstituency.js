const REGIONS = require('./../data/config/regions.json');

class MConstituency {
  constructor(data) {
    this.data = data;

    this.area = this.data.area;
    this.region = REGIONS[this.data.region].name;
    this.name = this.data.name;
    
    this.initialise();
  }

  initialise() {
    this.projection_multipliers = {};
    this.true_multipliers = {};

    Object.keys(this.data.constituency).forEach(party => {
      const constituency = this.data.constituency[party];
      const national = this.data.national[party];

      let multiplier = 0;
      let true_multilpier = 0;
      const passes = [];

      Object.keys(constituency).sort().splice(0, Object.keys(constituency).length - 1).forEach(year => {
        if (!national || !national[year]) {
          return;
        }

        const heading = national[year];
        let result = constituency[year];

        if (result === undefined) {
          result = heading;
        }

        passes.push((result / heading));
      });

      const trend_multiplier = (1 / (passes.length * 10));
      for (let i = 0; i < passes.length; i++) {
        // multiplier += Math.log(i) * passes[i];
        multiplier += (passes[i] * (trend_multiplier * (i + 1)));
        true_multilpier += passes[i];
      }

      this.true_multipliers[party] = (true_multilpier / passes.length);
      this.projection_multipliers[party] = (multiplier / passes.length);
    });
  }

  predict() {
    this.calculation = {};
    
    let constituency_total = 0;
    Object.keys(this.true_multipliers).forEach(party => {
      let multiplier_result = this.data.forecast[party] * (this.true_multipliers[party] * (1 / Math.log10((this.data.forecast[party] * 100))));
      if (isNaN(multiplier_result)) {
        multiplier_result = 0;
      }

      constituency_total += multiplier_result;

      this.calculation[party] = multiplier_result;
    });

    Object.keys(this.calculation).forEach(party => {
      this.calculation[party] = this.calculation[party] / constituency_total;
    });

    return this.calculation;
  }
}

module.exports = MConstituency;
