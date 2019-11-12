const Factory = require('./MFactory');

const generator = new Factory({
  results: {
    '2010': {
      'CON': 0.361,
      'LAB': 0.29,
      'LIB': 0.23,
      'BXP': 0.031,
      'GRN': 0.009,
      'NAT': 0.017
    },
    '2015': {
      'CON': 0.369,
      'LAB': 0.304,
      'LIB': 0.079,
      'BXP': 0.126,
      'GRN': 0.038,
      'NAT': 0.047
    },
    '2017': {
      'CON': 0.424,
      'LAB': 0.4,
      'LIB': 0.074,
      'BXP': 0.018,
      'GRN': 0.016,
      'NAT': 0.03
    }
  },
  'forecast': {
    'CON': 0.39,
    'LAB': 0.26,
    'LIB': 0.17,
    'BXP': 0.10,
    'GRN': 0.04,
    'NAT': 0.04
  }
});

generator.generate().then(() => {
  generator.run();
});
