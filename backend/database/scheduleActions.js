const { Pool } = require('pg');
const pool = new Pool({
    user: require('../config/keys').pg.pguser,
    host: require('../config/keys').pg.pghost,
    database: require('../config/keys').pg.pgdatabase,
    password: require('../config/keys').pg.pgpassword,
    port: require('../config/keys').pg.pgport,
});
const moment = require('moment');
const short = require('short-uuid');

const { Settings } = require('./settingsActions');

const getAbort = (client) => {
    return err => {
        console.error('Error in transaction', err.stack);
        return client.query('rollback').then(res => {
            client.release();
            throw err;
        });
    }
}

const SCHEDULE_TABLE_CREATE = `create table schedule(calnetid text not null,
                                                     slot timestamptz not null,
                                                     location text null,
                                                     uid text not null,
                                                     scheduled timestamptz null,
                                                     completed timestamptz null,
                                                     rejected timestamptz null)`;
const SCHEDULE_TABLE_EXISTS = `select exists (select from information_schema.tables where table_name='schedule')`;
module.exports.verifyScheduleTable = () => {
    return pool.connect().then(client => {
        const abort = getAbort(client);
        return client.query('begin').then(res => {
            return client.query(SCHEDULE_TABLE_EXISTS);
        }).then(res => {
            if(!res.rows[0].exists) {
                console.log('Schedule table doesn\'t exit, creating one!');
                return client.query(SCHEDULE_TABLE_CREATE);
            }
            return;
        }).then(res => {
            return client.query('end transaction');
        }).then(res => {
            client.release(); // release client!!!
        }).catch(err => {
            return abort(err).then((err, res) => {
                return err;
            });
        });
    });
}

const GET_USER_SLOT = `select slot,location,uid from schedule where calnetid=$1 order by slot desc limit 1`;
/**
 * Returns the latest slot for the given user.
 * If the user doesnt exist or the query fails, throws error.
 */
module.exports.getUserSlot = id => {
    return pool.query(GET_USER_SLOT, [id]).then(res => {
        if(res.rows.length < 1) {
            throw new Error(`User ${id} doesn't have a slot record`);
        } else {
            return res.rows[0];
        }
    }).catch(err => {
        console.error(`Error getting user slot ${id}`);
        console.error(err);
        return err;
    });
}

const GET_USER_WEEK = `select slot from schedule where calnetid=$1 order by slot desc limit 1`;
const GET_SLOTS_TAKEN = `select slot,location from schedule where (slot between $1::timestamptz and $1::timestamptz + interval '1 week') and location is not null`;
/**
 * Returns the available slots for the given user
 */
module.exports.getAvailableSlots = id => {
    return pool.connect().then(client => {
        const abort = getAbort(client);
        var startDate = moment();
        return client.query('begin').then(r => {
            return client.query(GET_USER_WEEK, [id]);
        }).then(slot => {
            if(slot.rows.length < 1) throw new Error(`No slot for user ${id}`);
            startDate = moment(slot.rows[0].slot).startOf('week');
            return client.query(GET_SLOTS_TAKEN, [startDate.toDate()]);
        }).then(taken => {
            const open = {};
            for(var location of Settings().locations) {
                open[location] = {};
                for(var day of Settings().days) {
                    if(moment().isAfter(startDate.clone().set('day', day))) {
                        continue;
                    } else {
                        for(var i = startDate.clone().set('day', day).set('hour', Settings().starttime);i.get('hour') < Settings().endtime;i = i.add(Settings().increment, 'minute')) {
                            open[location][i.clone()] = Settings().buffer;
                        }
                    }
                }
            }
            for(var row of taken.rows) {
                if(open[row.location][moment(row.slot)] !== undefined) {
                    open[row.location][moment(row.slot)]--;
                }
            }
            return open;
        }).then(res => {
            return client.query('end transaction').then(r => client.release()).then(r => res);
        }).catch(err => {
            console.error(`Error getting available slots for user ${id}`);
            console.error(err);
            return abort(err);
        });
    });
}

const GET_PREVIOUS_SLOT = `select slot,location from schedule where calnetid=$1 order by slot desc limit 1`;
const EXISTING_SLOT_COUNT = `select count(*)::integer from schedule where slot=$1 and location=$2`;
const UPDATE_USER_SLOT = `update schedule set slot=$2,location=$3,scheduled=now() where calnetid=$1 and slot in (select slot from schedule where calnetid=$1 order by slot desc limit 1)`;
/**
 * Sets the user's slot
 * @param {string} id - calnetid of user
 * @param {moment.Moment} slot - slot user wants to allocate
 * @param {string} location - name of location
 */
module.exports.setUserSlot = (id, slot, location) => {
    return pool.connect().then(client => {
        const abort = getAbort(client);
        return client.query('begin').then(r => {
            return client.query(GET_PREVIOUS_SLOT, [id]);
        }).then(prev => {
            if(!moment(prev.rows[0].slot).startOf('week').isSame(slot.clone().startOf('week'))) {
                throw new Error('slot not valid');
            } else if(!Settings().locations.includes(location)) {
                throw new Error('location not valid');
            } else if(moment.duration(slot.diff(slot.clone().set('hour', Settings().starttime).set('minute', 0))).asMinutes() % Settings().increment > 0) {
                throw new Error('slot not valid');
            } else if(!slot.isBetween(slot.clone().set('hour', Settings().starttime), slot.clone().set('hour', Settings().endtime), null, '[)')) {
                throw new Error('slot not valid');
            } else if(!Settings().days.includes(slot.day())) {
                throw new Error('slot not valid');
            } else {
                return client.query(EXISTING_SLOT_COUNT, [slot.toDate(), location]).then(count => {
                    if(count.rows[0].count >= Settings().buffer) {
                        throw new Error('Slot is already full');
                    } else {
                        return client.query(UPDATE_USER_SLOT, [id, slot.toDate(), location]).then(r => true);
                    }
                });
            }
        }).then(res => {
            return client.query('end transaction').then(r => client.release()).then(r => res);
        }).catch(err => {
            console.error(`error setting user ${id} slot`);
            return abort(err);
        });
    });
}

const CURRENT_SLOT = `select slot from schedule where calnetid=$1 order by slot desc limit 1`;
const CANCEL_SLOT = `update schedule set location=null,slot=$2,scheduled=null where calnetid=$1 and slot in (select slot from schedule where calnetid=$1 and completed is null and rejected is null order by slot desc limit 1)`;
module.exports.cancelSlot = id => {

    return pool.connect().then(client => {
        const abort = getAbort(client);
        return client.query('begin').then(r => {
            return client.query(CURRENT_SLOT, [id]);
        }).then(curr => {
            return client.query(CANCEL_SLOT, [id, moment(curr.rows[0].slot).startOf('week')]);
        }).then(res => {
            return client.query('end transaction').then(r => client.release()).then(r => true);
        }).catch(err => {
            return abort(err).catch(e => false);
        });
    }).catch(err => {
        console.error('Error connecting with client');
        console.error(err);
        return false;
    });
}

const NEW_USER_SLOT = `insert into schedule (calnetid, slot, uid) values ($1, $2, $3)`;
module.exports.newUserSlot = id => {
    return pool.query(NEW_USER_SLOT, [id, moment().startOf('week').add(1, 'week').toDate(), short().new()]).then(res => {
        return true;
    }).catch(err => {
        console.error('Error creating new user slot');
        console.error(err);
        return err;
    });
}
