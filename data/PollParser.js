class PollParser {
  constructor(data) {
    this.data = data;
  }

  read() {
    const lines = this.data.split('\n');
    const header = lines.shift().split(',');

    this.polls = {
      "results": []
    };

    lines.forEach(line => {
      const fields = line.split(',');
      
      const poll = {
        pollster: fields[0],
        date: fields[1],
        area: fields[2],
        sample: fields[3],
        parties: {}
      };

      for (let i = 4; i < fields.length; i++) {
        poll.parties[header[i].replace(/[^a-z]/ig, '')] = parseInt(fields[i], 10) / 100;
      }

      this.polls.results.push(poll);
    });

    return this.polls;
  }
}

module.exports = PollParser;
