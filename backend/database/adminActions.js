const { Pool } = require('pg');
const pool = new Pool({
    user: require('../config/keys').pg.pguser,
    host: require('../config/keys').pg.pghost,
    database: require('../config/keys').pg.pgdatabase,
    password: require('../config/keys').pg.pgpassword,
    port: require('../config/keys').pg.pgport,
});
const moment = require('moment');

const { Settings } = require('./settingsActions');

const getAbort = (client) => {
    return err => {
        console.error('Error in transaction', err.stack);
        return client.query('rollback').then(res => {
            client.release();
            return err;
        });
    }
}

module.exports.getUserAdmin = id => {
    return pool.query('select admin from users where calnetid=$1', [id]).then(res => {
        return res.rows[0].admin;
    }).catch(err => {
        console.error('Error getting user admin ' + id);
        console.error(err);
        throw err;
    });
}

module.exports.getSlotDetails = uid => {
    return pool.query('select * from schedule where uid=$1', [uid]).then(res => {
        if(res.rowCount < 1)
            throw new Error('Invalid UID');
        else {
            return res.rows[0];
        }
    });
}

module.exports.completeUserSlot = uid => {
    return pool.query('update schedule set completed=now() where uid=$1', [uid]).then(res => {
        return res.rowCount > 0;
    }).catch(err => {
        console.error('error completing slot with uid ' + uid);
        console.error(err);
        return false;
    });
}

/**
 * 
 * @param {Array<string>} terms - search terms which are separated by spaces
 */
const SEARCH_BY_TERM = `select 
                            u.calnetid,
                            u.firstname,
                            u.lastname,
                            s.slot,
                            s.location 
                        from 
                            users u,schedule s 
                        inner join 
                            (select calnetid,
                                max(slot) as MaxDateTime 
                            from schedule 
                            group by calnetid) groupeds 
                        on 
                            s.calnetid=groupeds.calnetid 
                        and 
                            s.slot=groupeds.MaxDateTime 
                        where 
                            u.calnetid=s.calnetid
                        and 
                            lower(concat(u.firstname,' ',u.lastname)) like concat(lower($1),'%')
                        order by
                            s.location,
                            s.slot`;
module.exports.getAppointmentsByName = term => {
    return pool.query(SEARCH_BY_TERM, [term]).then(res => {
        return res.rows;
    }).catch(err => {
        console.error('error searching user appoitnments by name');
        console.error(err);
        return [];
    });
}
