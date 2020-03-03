const express = require('express');
const compression = require('compression');
const parser = require('body-parser');

const config = require('./data/out.json');
const polling = require('./data/polls/polling.json');
const MFactory = require('./services/MFactory');

const App = new express();
App.use(compression());
App.use(parser.urlencoded({ extended: false }));
App.use(parser.json());

App.get('/api/elections', (request, responder) => {
  const factory = new MFactory(config);

  factory.generate().then(() => {
    const results = factory.run();
    
    responder.json({
      results
    });

    responder.status(200).end();
  });
});

App.post('/api/elections', (request, responder) => {
  const factory = new MFactory({
    ...config,
    forecast: {
      ...config.forecast,
      ...request.body,
      SNP: request.body.SNP * 10,
      PLC: request.body.PLC ? request.body.PLC * 10 : 0.12
    }
  });

  factory.generate().then(() => {
    const results = factory.run();
    
    responder.json({
      results
    });

    responder.status(200).end();
  });
});

App.get('/api/polls', (request, responder) => {
  responder.json(polling);
  responder.status(200).end();
});

App.listen(2000);
