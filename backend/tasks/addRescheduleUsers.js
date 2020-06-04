module.exports = (payload, helpers) => {
    const { Pool } = require('pg');
    const moment = require('moment');
    const { makeWorkerUtils } = require('graphile-worker');

    const pool = new Pool({
        user: require('../config/keys').pg.pguser,
        host: require('../config/keys').pg.pghost,
        database: require('../config/keys').pg.pgdatabase,
        password: require('../config/keys').pg.pgpassword,
        port: require('../config/keys').pg.pgport,
    });
    return Promise.resolve(0).then(res => {
        return makeWorkerUtils({pgPool: pool});
    }).then(res => {
        return res.addJob('rescheduleUsers', {}, {runAt: moment().startOf('day').add(1, 'day').add(1, 'minute').toDate(), jobKey:'rescheduleJob', queueName: 'rescheduleQueue'}).then(r => res.release()).then(r => pool.end());
    });
}
