const express = require('express');
const router = express.Router();
// const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const moment = require('moment');

const { sequelize, Sequelize, User, Tube, DropoffDay } = require('../../models');
const Op = Sequelize.Op;
const cas = require('../../cas');

router.get('/tube', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  try {
    const tube = await Tube.findOne({
      where: {
        calnetid: calnetid,
        current: true
      },
      include: {
        model: DropoffDay,
        required: false
      },
      logging: (msg) => request.log.info(msg)
    });
    response.json({ success: true, tube: tube});
  } catch(err) {
    request.log.error('error getting tube');
    request.log.error(err.stack);
    response.json({ success: false });
  }
});

module.exports = router;
