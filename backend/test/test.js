process.env.TZ = 'America/Los_Angeles';
const moment = require('moment');
const axios = require('axios');

const { sequelize, Sequelize, User, Slot, Admin, Settings } = require('../models');

describe('database', () => {
  describe('#authenticate()', () => {
    it('should not throw error', async done => {
      await sequelize.authenticate();
      await sequelize.sync();
      
      done();
    });
  });
});

describe('')
