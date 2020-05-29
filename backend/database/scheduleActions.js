const { Pool } = require('pg');
const pool = new Pool();
const moment = require('moment');

const { Settings } = require('./settingsActions');

const getAbort = (client) => {
    return err => {
        console.error('Error in transaction', err.stack);
        return client.query('rollback').then((err, res) => {
            if(err) {
                console.error('Error in transaction', err.stack);

            }
            client.release();
        });
    }
}

const USERS_COUNT = `select count(*) from users`;
const DATE_COUNT_QUERY = `select count(*) from users where nextappointment=$1`;
const LATEST_DATE_QUERY = `select max(nextappointment) from users`;
const FIND_EXPIRED_USERS = `select calnetid from users where nextappointment<$1 order by datejoined asc`;
const SET_MUTIPLE_USER_DATES = `update users set nextappointment=$1, appointmentuid=null, location=null, appointmentslot=null where calnetid in (`;
/**
 * @param {Date} date - current date
 */
module.exports.updateUserSchedules = date => {
    // find all users whos appointments are expired
    // assign them in order of join date
    if(!date instanceof Date) {
        return Promise.reject('date is not of type Date');
    }
    return pool.connect().then(client => {
        const abort = getAbort(client);
        return client.query('begin').then(res => {
            return client.query(LATEST_DATE_QUERY);
        }).then(res => {
            const latestDate = moment(res.rows[0].max);
            return client.query(DATE_COUNT_QUERY, [latestDate.toDate()]).then(res => {
                return Settings().dayquota-res.rows[0].count;
            }).then(res => {
                const remainingLatestDate = res;
                var expiredCopy = [];
                return client.query(FIND_EXPIRED_USERS, [date]).then(expired => {
                    expiredCopy = [...expired.rows];
                    if(Math.min(expired.rows.length, remainingLatestDate) > 0) {
                        var latestUsers = SET_MUTIPLE_USER_DATES;
                        const loopTimes = Math.min(expired.rowCount, remainingLatestDate);
                        for(var i = 0;i < loopTimes;i++) {
                            latestUsers = latestUsers + '\'' + expired.rows.shift().calnetid + '\',';
                        }
                        return client.query(latestUsers.slice(0, latestUsers.length-1)+')', [latestDate.toDate()]).then(res => { return expired });
                    }
                    return expired;
                }).then(expired => {
                    var nextDate = latestDate.add(1, 'day');
                    var updatePromises = [];
                    for(var i = 0;i<=Math.floor(expired.rows.length/Settings().dayquota);i++) {
                        while(!Settings().days.includes(nextDate.day())) {
                            nextDate = nextDate.add(1, 'day');
                        }
                        var latestUsers = SET_MUTIPLE_USER_DATES;
                        if(expired.rows.length > 0) {
                            const loopTimes = Math.min(expired.rows.length, Settings().dayquota);
                            for(var x = 0;x < loopTimes;x++) {
                                latestUsers = latestUsers + '\'' + expired.rows.shift().calnetid + '\',';
                            }
                            updatePromises.push(client.query(latestUsers.slice(0, latestUsers.length-1)+')', [latestDate.toDate()]));
                        }
                        nextDate.add(1, 'day');
                    }
                    return Promise.all(updatePromises).then(r => expiredCopy);
                });
            });
        }).then(res => {
            return client.query('end transaction').then(r => res);
        }).then(res => {
            client.release();
            return res;
        }).catch(err => {
            return abort(err);
        });
    }).catch(err => {
        console.error('Error connecting to update user schedules');
        console.error(err.stack);
        return err;
    });
}

const GET_USERS_BY_DATE = `select appointmentslot,location from users where nextappointment=$1 and appointmentslot is not null and location is not null`;
/**
 * @param {Number} year - year to check
 * @param {Number} month - month to check
 * @param {Number} day - day to check
 */
module.exports.getOpenSlots = (year, month, day) => {
    return pool.query(GET_USERS_BY_DATE, [moment({year: year, month: month, day: day}).toDate()]).then(res => {
        const taken = res.rows.map(e => {return {location: e.location, appointmentslot: moment(e.appointmentslot)}});
        const available = {};
        const increment = Settings().increment;
        const momentIncrement = moment({year: year, month: month, day: day, hour: Settings().starttime});
        for(var location of Settings().locations) {
            available[location] = [];
            for(var i = 0; i < Math.floor((Settings().endtime-Settings().starttime)*60/Settings().increment);i++) {
                available[location].push({time: momentIncrement.clone(), open: Settings().buffer});
                momentIncrement.add(Settings().increment, 'minute');
            }
        }
        console.log(taken);
        for(var t of taken) {
            const index = available[t.location].findIndex(e => e.time.isSame(t.appointmentslot));
            if(index > -1) {
                available[t.location][index].open--;
            }
        }
        console.log(available);
    }).catch(err => {
        console.error('error querying for open slots');
        console.error(err.stack);
        return err;
    });
}

const GET_SLOT_COUNT = `select count(*) from users where nextappointment=$1 and location=$2 and appointmentslot=$3`;
const GET_USER_BY_ID = `select * from users where calnetid=$1`;
const SET_USER_SLOT = `update users set location=$1, appointmentslot=$2, appointmentuid=$3 where calnetid=$4`;
/**
 * @param {string} user - calnetid of user requesting schedule
 * @param {string} location - name of location user is requesting
 * @param {Number} year - year
 * @param {Number} month - month
 * @param {Number} day - day
 * @param {Number} hour - hour
 * @param {Number} minute - minute
 * @param {string} uid - unique id for schedule
 */
module.exports.assignSlot = (user, location, year, month, day, hour, minute, uid) => {
    return pool.connect().then(client => {
        const abort = getAbort(client);
        const querySlot = moment({year: year, month: month, day: day, hour: hour, minute: minute});
        return client.query('begin').then(r => {
            return client.query(GET_USER_BY_ID, [user]);
        }).then(res => {
            const nextAppointmentStart = moment(res.rows[0].nextappointment).hour(Settings().starttime);
            const nextAppointmentEnd = moment(res.rows[0].nextappointment).hour(Settings().endtime);
            return querySlot.isBetween(nextAppointmentStart, nextAppointmentEnd, undefined, '[)') &&
                querySlot.diff(nextAppointmentStart, 'minutes') % Settings().increment === 0 &&
                Settings().locations.includes(location);
        }).then(res => {
            if(res) {
                return client.query(GET_SLOT_COUNT, [querySlot.toDate(), location, querySlot.toDate()]);
            } else {
                return {rows: [{count: Number.MAX_SAFE_INTEGER}]};
            }
        }).then(res => {
            const count = res.rows[0].count;
            if(count < Settings().buffer) {
                return client.query(SET_USER_SLOT, [location, querySlot.toDate(), uid, user]).then(r => r.rowCount > 0);
            } else {
                return false;
            }
        }).then(res => {
            return client.query('end transaction').then(r => {client.release(); return res});
        }).catch(err => {
            return abort(err);
        });
    }).catch(err => {
        console.error('Error assigning slot');
        console.error(err.stack);
        return err;
    });
}
