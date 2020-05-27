const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool();

const USER_TABLE_CREATE = `create table users(firstname text default '',
                                           lastname text default '',
                                           calnetid text primary key,
                                           email text unique not null,
                                           phone text unique null,
                                           datejoined timestamptz not null default now(),
                                           queuenumber serial unique not null,
                                           lastsignin timestamptz not null default now(),
                                           admin bool not null default 'f',
                                           alertemail bool not null default 't',
                                           alertphone bool not null default 'f');`;
const USER_TABLE_EXISTS = `select exists (select from information_schema.tables where table_name='users');`;

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

const SESSION_TABLE_EXISTS = 'select exists (select from information_schema.tables where table_name=\'session\')';
const CREATE_SESSION_TABLE = fs.readFileSync('node_modules/connect-pg-simple/table.sql').toString();
module.exports.verifyTables = () => {
    const userTablePromise = pool.connect().then(client => {
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
    const sessionTablePromise = pool.connect().then(client => {
        const abort = getAbort(client);
        return client.query('begin').then(res => {
            return client.query(SESSION_TABLE_EXISTS);
        }).then(res => {
            if(!res.rows[0].exists) {
                console.log('session table doesn\'t exist, creating one!');
                return true;
            }
            return false;
        }).then(res => {
            if(res) {
                return client.query(CREATE_SESSION_TABLE);
            }
        }).then(res => {
            return client.query('end transaction');
        }).then(res => {
            client.release();
        }).catch(err => {
            return abort(err);
        });
    });
    return Promise.all([userTablePromise, sessionTablePromise]);
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

const INSERT_USER_QUERY = 'insert into users (calnetid, email) values ($1, $2)';
module.exports.insertUser = id => {
    return pool.query(INSERT_USER_QUERY, [id, `${id}@berkeley.edu`]).then(res => {
        return true;
    }).catch(err => {
        return err;
    });
}

const CONTAINS_USER_QUERY = 'select count(distinct calnetid) from users where calnetid=$1';
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
