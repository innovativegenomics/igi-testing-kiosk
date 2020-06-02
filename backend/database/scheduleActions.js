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

const SCHEDULE_TABLE_CREATE = `create table schedule(calnetid text not null,
                                                     appointmentslot timestamptz not null,
                                                     location text not null,
                                                     appointmentuid text not null,
                                                     created timestamptz not null default now(),
                                                     completed timestamptz null,
                                                     active bool not null default true)`;
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

const DATE_COUNT_QUERY = `select count(*)::integer from users where nextappointment=$1 and testverified is not null`;
const LATEST_DATE_QUERY = `select max(nextappointment) from users where testverified is not null`;
const FIND_EXPIRED_USERS = `select calnetid from users where nextappointment<$1 and testverified is not null order by testverified asc`;
const INACTIVATE_MULTIPLE_SLOTS = `update schedule set active=false where calnetid in (`;
const SET_MUTIPLE_USER_DATES = `update users set nextappointment=$1, reschedulecount=0 where calnetid in (`;
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
            return client.query(LATEST_DATE_QUERY); // find the farthest ahead scheduled date
        }).then(res => {
            var latestDate = moment(res.rows[0].max);
            if(latestDate.isBefore(moment(date).startOf('day')) || !latestDate.isValid()) {
                latestDate = moment(date).startOf('day');
            }
            return client.query(DATE_COUNT_QUERY, [latestDate.toDate()]).then(res => {
                return Settings().dayquota-res.rows[0].count;
            }).then(res => {
                const remainingLatestDate = res;
                var expiredCopy = [];
                return client.query(FIND_EXPIRED_USERS, [date]).then(expired => {
                    expiredCopy = [...expired.rows];
                    if(Math.min(expired.rows.length, remainingLatestDate) > 0) {
                        var inactivateSlots = INACTIVATE_MULTIPLE_SLOTS;
                        var latestUsers = SET_MUTIPLE_USER_DATES;
                        const loopTimes = Math.min(expired.rowCount, remainingLatestDate);
                        for(var i = 0;i < loopTimes;i++) {
                            const next = expired.rows.shift().calnetid;
                            inactivateSlots = inactivateSlots + '\'' + next + '\',';
                            latestUsers = latestUsers + '\'' + next + '\',';
                        }
                        return client.query(inactivateSlots.slice(0, inactivateSlots.length-1)+')').then(r => {
                            return client.query(latestUsers.slice(0, latestUsers.length-1)+')', [latestDate.toDate()]).then(r => { return expired });
                        });
                    }
                    return expired;
                }).then(expired => {
                    var nextDate = latestDate.clone().add(1, 'day');
                    var updatePromises = [];
                    for(var i = 0;i<=Math.floor(expired.rows.length/Settings().dayquota);i++) {
                        while(!Settings().days.includes(nextDate.day())) {
                            nextDate = nextDate.add(1, 'day');
                        }
                        var inactivateSlots = INACTIVATE_MULTIPLE_SLOTS;
                        var latestUsers = SET_MUTIPLE_USER_DATES;
                        if(expired.rows.length > 0) {
                            const loopTimes = Math.min(expired.rows.length, Settings().dayquota);
                            for(var x = 0;x < loopTimes;x++) {
                                const next = expired.rows.shift().calnetid;
                                inactivateSlots = inactivateSlots + '\'' + next + '\',';
                                latestUsers = latestUsers + '\'' + next + '\',';
                            }

                            const tempDate = nextDate.clone();
                            updatePromises.push(
                                client.query(inactivateSlots.slice(0, inactivateSlots.length-1)+')').then(r => {
                                    return client.query(latestUsers.slice(0, latestUsers.length-1)+')', [tempDate.toDate()]);
                                }));
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

const GET_USERS_BY_DATE = `select appointmentslot,location from schedule where appointmentslot >= $1::date and appointmentslot < $1::date + interval '1 day' and active=true`;
/**
 * @param {Number} year - year to check
 * @param {Number} month - month to check
 * @param {Number} day - day to check
 */
module.exports.getOpenSlots = (year, month, day) => {
    return pool.query(GET_USERS_BY_DATE, [moment({year: year, month: month, day: day}).toDate()]).then(res => {
        const taken = res.rows.map(e => {return {location: e.location, appointmentslot: moment(e.appointmentslot)}});
        const available = {};
        for(var location of Settings().locations) {
            const momentIncrement = moment({year: year, month: month, day: day, hour: Settings().starttime});
            available[location] = [];
            for(var i = 0; i < Math.floor((Settings().endtime-Settings().starttime)*60/Settings().increment);i++) {
                available[location].push({time: momentIncrement.clone(), open: Settings().buffer});
                momentIncrement.add(Settings().increment, 'minute');
            }
        }
        for(var t of taken) {
            const index = available[t.location].findIndex(e => e.time.isSame(t.appointmentslot));
            if(index > -1) {
                available[t.location][index].open--;
            }
        }
        return available;
    }).catch(err => {
        console.error('error querying for open slots');
        console.error(err.stack);
        return err;
    });
}

const GET_SLOT_COUNT = `select count(*)::integer from schedule where location=$1 and appointmentslot=$2 and active=true`;
const GET_USER_BY_ID = `select * from users where calnetid=$1`;
const UPDATE_RESCHEDULE_COUNT = `update users set reschedulecount=reschedulecount+1 where calnetid=$1`;
const SET_PREVIOUS_SLOTS_INACTIVE = `update schedule set active=false where calnetid=$1`;
const SET_USER_SLOT = `insert into schedule(calnetid,
                                            appointmentslot,
                                            location,
                                            appointmentuid) values ($1, $2, $3, $4)`;
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
            if(!res.rows[0].testverified) {
                return false;
            }
            const nextAppointmentStart = moment(res.rows[0].nextappointment).hour(Settings().starttime);
            const nextAppointmentEnd = moment(res.rows[0].nextappointment).hour(Settings().endtime);
            return querySlot.isBetween(nextAppointmentStart, nextAppointmentEnd, undefined, '[)') &&
                querySlot.diff(nextAppointmentStart, 'minutes') % Settings().increment === 0 &&
                Settings().locations.includes(location) &&
                res.rows[0].reschedulecount < Settings().maxreschedules;
        }).then(res => {
            if(res) {
                return client.query(GET_SLOT_COUNT, [location, querySlot.toDate()]);
            } else {
                return {rows: [{count: Number.MAX_SAFE_INTEGER}]};
            }
        }).then(res => {
            const count = res.rows[0].count;
            if(count < Settings().buffer) {
                return client.query(UPDATE_RESCHEDULE_COUNT, [user]).then(r => {
                    return client.query(SET_PREVIOUS_SLOTS_INACTIVE, [user]);
                }).then(r => {
                    return client.query(SET_USER_SLOT, [user, querySlot.toDate(), location, uid]).then(r => r.rowCount > 0);
                });
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

const USER_ASSIGNED_DAY = `select count(*)::integer from users where calnetid=$1 and nextappointment=$2 and testverified is not null`;
module.exports.userAssignedDay = (user, year, month, day) => {
    return pool.query(USER_ASSIGNED_DAY, [user, moment({year: year, month: month, day: day}).toDate()]).then(res => res.rows[0].count > 0);
}

const USER_CANCEL_SLOT = `update schedule set active=false where calnetid=$1`;
module.exports.cancelSlot = id => {
    return pool.query(USER_CANCEL_SLOT, [id]).then(res => res.rowCount > 0).catch(err => {
        console.error(err.stack);
        return err;
    });
}

const USER_SLOT_QUERY = `select * from schedule where calnetid=$1 and active=true`;
module.exports.getUserSlot = id => {
    return pool.query(USER_SLOT_QUERY, [id]).then(res => {
        if(res.rowCount > 0) {
            return res.rows[0];
        } else {
            return null;
        }
    }).catch(err => {
        console.error('error getting current user slot');
        console.error(err);
        return err;
    });
}

const USER_IS_VERIFIED = 'select testverified from users where calnetid=$1 and testverified is not null';
const VERIFY_USER_QUERY = 'update users set testverified=now(), nextappointment=$2 where calnetid=$1';
module.exports.testVerifyUser = id => {
    return pool.connect().then(client => {
        const abort = getAbort();
        return client.query('begin').then(res => {
            return client.query(USER_IS_VERIFIED, [id]);
        }).then(res => {
            if(res.rows.length > 0) return false; // user is already verified
            return client.query(LATEST_DATE_QUERY).then(r => {
                var latestDate = moment(r.rows[0].max);
                if(!r.rows[0].max || latestDate.isBefore(moment().startOf('day').add(1, 'day'))) {
                    latestDate = moment().startOf('day').add(1, 'day');
                }
                return client.query(DATE_COUNT_QUERY, [latestDate.toDate()]).then(r => {
                    if(r.rows[0].count < Settings().dayquota) {
                        return latestDate;
                    } else {
                        var nextDate = latestDate.add(1, 'day');
                        while(!Settings().days.includes(nextDate.day())) {
                            nextDate = nextDate.add(1, 'day');
                        }
                        return nextDate;
                    }
                });
            }).then(date => {
                return client.query(VERIFY_USER_QUERY, [id, date.toDate()]).then(r => date);
            }).then(date => {
                return client.query('end transaction').then(r => client.release()).then(r => date);
            });
        }).catch(err => abort(err));
    }).catch(err => {
        console.error('cannot test verify user');
        console.error(err);
        return err;
    });
}
