const V2Candidates = require('./V2Candidates');
const REGIONS = require('./../data/config/regions.json');

class V2Constituency {
  constructor(data) {
    this.data = data;

    this.area = this.data.area;
    this.region = REGIONS[this.data.region].name;
    this.name = this.data.name;
    this.runners = new V2Candidates(data);
    
    this.initialise();
  }

  initialise() {
    this.swing_models = {};
    this.swing = {};

    Object.keys(this.data.constituency).forEach(party => {
      const constituency = this.data.constituency[party];
      const national = this.data.national[party];
      const years = Object.keys(constituency).sort();

      let multiplier = 0;
      for (let i = 1; i < years.length; i++) {
        const year = years[i];
        const previous = years[i - 1];

        if (!national || !national[year] || !national[previous]) {
          continue;
        }

        const n_swing = national[year] - national[previous];
        const c_swing = constituency[year] - constituency[previous];

        multiplier = (multiplier + (c_swing / n_swing)) / 2;
        if (multiplier < -1) {
          multiplier = -1;
        }

        if (!this.swing_models[year]) {
          this.swing_models[year] = {};
        }

        if (!this.swing_models[year][party]) {
          this.swing_models[year][party] = multiplier;
        }
      }

      this.swing[party] = multiplier;
    });
  }

  predict() {
    this.calculation = {};
    
    let constituency_total = 0;
    this.runners.candidates().forEach(party => {
      if (!this.data.national || !this.data.national[party]) {
        return;
      }

      const previous_year = Object.keys(this.data.national[party]).sort().pop();
      
      const n_swing = this.data.forecast[party] - this.data.national[party][previous_year];
      
      let c_swing = n_swing * this.swing[party];
      if (n_swing < 0 && this.swing[party] < 0) {
        c_swing = c_swing * -1;
      }

      let result = this.data.constituency[party][previous_year] + c_swing;
      if (isNaN(result) || result < 0) {
        result = 0;
      }

      constituency_total += result;
      this.calculation[party] = result;
    });

    Object.keys(this.calculation).forEach(party => {
      this.calculation[party] = this.calculation[party] / constituency_total;
    });

    return this.calculation;
  }
}

module.exports = V2Constituency;
