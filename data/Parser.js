const REGION_MAPS = {
  "default": {
    "CON": "CON",
    "LAB": "LAB",
    "LIB": "LIB",
    "UKIP": "BXP",
    "GRN": "GRN",
    "Green": "GRN",
    "NAT": "NAT",
    "MIN": "MIN",
    "OTH": "OTH"
  },
  "1": {
    "CON": "UUP",
    "LAB": "SDLP",
    "LIB": "DUP",
    "UKIP": "ALL",
    "NAT": "SF",
    "1992": {
      "MIN": "ALL"
    },
    "2001": {
      "MIN": "ALL"
    },
    "2005": {
      "MIN": "ALL"
    }
  },
  "2": {
    "NAT": 'SNP'
  },
  "6": {
    "NAT": "PLC"
  }
}

class Parser {
  constructor(data, year) {
    this.data = data;
    this.year = year;
  }

  read() {
    const lines = this.data.split('\n');
    const header = lines.shift().split(';');

    this.constituencies = [];
    lines.forEach(line => {
      const info = line.split(';');
      if (info.length === 1) {
        return;
      }

      const electorate = parseInt(info[4]);
      const region = parseInt(info[2], 10);

      let mapping = REGION_MAPS.default;
      if (REGION_MAPS[region]) {
        mapping = {
          ...mapping,
          ...REGION_MAPS[region]
        };

        if (REGION_MAPS[region][this.year]) {
          mapping = {
            ...mapping,
            ...REGION_MAPS[region][this.year]
          }
        }
      }

      let i;
      let j;
      let turnout = 0;
      for (i = 5, j = info.length; i < j; i++) {
        turnout += parseInt(info[i]);
      }

      const results = {};
      for (i = 5, j = header.length; i < j; i++) {
        const party = mapping[header[i].trim()];
        if (party === undefined) {
          console.log(header[i]);
        }
        const result = parseInt(info[i]);

        results[party] = result / turnout;
      }

      this.constituencies.push({
        name: info[0],
        mp: info[1],
        region,
        country: info[3],
        results
      });
    });

    return this.constituencies;
  }
}

module.exports = Parser;
