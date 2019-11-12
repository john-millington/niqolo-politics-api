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

    Object.keys(this.data.constituency).forEach(party => {
      const constituency = this.data.constituency[party];
      const national = this.data.national[party];

      let multiplier = 0;
      const passes = [];

      Object.keys(constituency).sort().forEach(year => {
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

      const trend_multiplier = (1 / passes.length);
      for (let i = 0; i < passes.length; i++) {
        multiplier += (passes[i] * (trend_multiplier * (i + 1)));
      }

      this.projection_multipliers[party] = (multiplier / passes.length);
    });
  }

  predict() {
    this.calculation = {};
    
    let constituency_total = 0;
    Object.keys(this.projection_multipliers).forEach(party => {
      let multiplier_result = this.data.forecast[party] * this.projection_multipliers[party];
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
