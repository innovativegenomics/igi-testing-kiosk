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
        return client.query('rollback').then((err, res) => {
            if(err) {
                console.error('Error in transaction', err.stack);

            }
            client.release();
        });
    }
}

const USER_TABLE_CREATE = `create table users(firstname text default '',
                                           lastname text default '',
                                           calnetid text primary key,
                                           email text unique not null,
                                           phone text unique null,
                                           datejoined timestamptz not null default now(),
                                           lastsignin timestamptz not null default now(),
                                           admin bool not null default 'f',
                                           alertemail bool not null default 't',
                                           alertphone bool not null default 'f',
                                           nextappointment date not null,
                                           appointmentslot timestamptz null,
                                           location text null,
                                           appointmentuid text null,
                                           reschedulecount integer not null default 0);`;
const USER_TABLE_EXISTS = `select exists (select from information_schema.tables where table_name='users');`;
module.exports.verifyUserTable = () => {
    return pool.connect().then(client => {
        const abort = getAbort(client);
        return client.query('begin').then(res => {
            return client.query(USER_TABLE_EXISTS);
        }).then(res => {
            if(!res.rows[0].exists) {
                console.log('User table doesn\'t exit, creating one!');
                return client.query(USER_TABLE_CREATE);
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

const GET_USER_BY_ID_QUERY = 'select * from users where calnetid=$1';
module.exports.getUserByID = id => {
    return pool.query(GET_USER_BY_ID_QUERY, [id]).then(res => {
        return res.rows[0];
    }).catch(err => {
        console.error('failed getting user from calnetid!', err.stack);
        return err;
    });
}

const GET_USERS_BY_ID_QUERY = 'select * from users where calnetid in (';
module.exports.getUsersByID = ids => {
    var getUsersQuery = GET_USERS_BY_ID_QUERY;
    for(var i of ids) {
        getUsersQuery = getUsersQuery + '\'' + i + '\','
    }
    return pool.query(getUsersQuery.slice(0, getUsersQuery.length-1) + ')').then(res => res.rows).catch(err => { console.log(err.stack); return [] });
}

const CONTAINS_USER_QUERY = 'select count(distinct calnetid)::integer from users where calnetid=$1';
module.exports.containsUser = id => {
    return pool.query(CONTAINS_USER_QUERY, [id]).then(res => {
        return res.rows[0].count > 0;
    }).catch(err => {
        return err;
    });
}

const UPDATE_LAST_USER_SIGNIN = 'update users set lastsignin=localtimestamp where calnetid=$1';
module.exports.updateLastUserSignin = id => {
    return pool.query(UPDATE_LAST_USER_SIGNIN, [id]).then(res => {
        return true;
    }).catch(err => {
        return err;
    });
}

const CHECK_ALL_USER_INFO = 'select firstname, lastname from users where calnetid=$1';
module.exports.checkAllUserInfoPresent = id => {
    return pool.query(CHECK_ALL_USER_INFO, [id]).then(res => {
        return res.rows[0].firstname !== '' &&
               res.rows[0].lastname !== '';
    }).catch(err => {
        return err;
    });
}

// update users
const UPDATE_USER_FIRSTNAME = 'update users set firstname=$1 where calnetid=$2';
module.exports.updateFirstName = (id, firstname) => {
    return pool.query(UPDATE_USER_FIRSTNAME, [firstname, id]).then(res => {
        return res.rowCount > 0;
    });
}
const UPDATE_USER_LASTNAME = 'update users set lastname=$1 where calnetid=$2';
module.exports.updateLastName = (id, lastname) => {
    return pool.query(UPDATE_USER_LASTNAME, [lastname, id]).then(res => {
        return res.rowCount > 0;
    });
}
const UPDATE_USER_EMAIL = 'update users set email=$1 where calnetid=$2';
module.exports.updateEmail = (id, email) => {
    return pool.query(UPDATE_USER_EMAIL, [email, id]).then(res => {
        return res.rowCount > 0;
    });
}
const UPDATE_USER_PHONE = 'update users set phone=$1 where calnetid=$2';
module.exports.updatePhone = (id, phone) => {
    return pool.query(UPDATE_USER_PHONE, [phone, id]).then(res => {
        return res.rowCount > 0;
    });
}
const UPDATE_USER_ALERTEMAIL = 'update users set alertemail=$1 where calnetid=$2';
module.exports.updateAlertEmail = (id, alertemail) => {
    return pool.query(UPDATE_USER_ALERTEMAIL, [alertemail, id]).then(res => {
        return res.rowCount > 0;
    });
}
const UPDATE_USER_ALERTPHONE = 'update users set alertphone=$1 where calnetid=$2';
module.exports.updateAlertPhone = (id, alertphone) => {
    return pool.query(UPDATE_USER_ALERTPHONE, [alertphone, id]).then(res => {
        return res.rowCount > 0;
    });
}


// schedule
const LATEST_DATE_QUERY = `select max(nextappointment) from users`;
const DATE_COUNT_QUERY = `select count(*)::integer from users where nextappointment=$1`;
const INSERT_USER_QUERY = `insert into users (calnetid, email, nextappointment) values ($1, $2, $3)`;
module.exports.insertUser = id => {
    //////////////////////////////////////
    // search users for most recent day
    // find number of users with that day
    // if < max
    //   set user to most current day
    // else
    //   set user to next day
    return pool.connect().then(client => {
        const abort = getAbort(client);
        return client.query('begin').then(res => {
            return client.query(LATEST_DATE_QUERY);
        }).then(res => {
            var latestDate = moment(res.rows[0].max);
            if(!res.rows[0].max) {
                latestDate = moment();
            }
            return client.query(DATE_COUNT_QUERY, [latestDate.toDate()]).then(res => {
                if(res.rows[0].count < Settings().dayquota) {
                    return latestDate;
                } else {
                    var nextDate = latestDate.add(1, 'day');
                    while(!Settings().days.includes(nextDate.day())) {
                        nextDate = nextDate.add(1, 'day');
                    }
                    return nextDate;
                }
            });
        }).then(res => {
            return client.query(INSERT_USER_QUERY, [id, `${id}@berkeley.edu`, res.toDate()]);
        }).then(res => {
            return client.query('end transaction');
        }).then(res => {
            client.release();
        }).catch(err => {
            return abort(err);
        });
    }).catch(err => {
        console.error('Error connecting to insert user');
        console.error(err.stack);
    });
}
