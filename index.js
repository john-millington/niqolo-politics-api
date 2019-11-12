const express = require('express');
const compression = require('compression');
const parser = require('body-parser');

const config = require('./data/config/config-all.json');
const MFactory = require('./services/MFactory');

const App = new express();
App.use(compression());
App.use(parser.urlencoded({ extended: false }));
App.use(parser.json());

App.post('/api/elections', (request, responder) => {
  const factory = new MFactory({
    ...config,
    forecast: {
      ...config.forecast,
      ...request.body
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

App.listen(2000);
