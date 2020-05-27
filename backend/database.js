const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool();

const USER_TABLE_CREATE = `create table users(firstName text default '',
                                           lastName text default '',
                                           calnetID text primary key,
                                           email text unique not null,
                                           phone text unique null,
                                           dateJoined timestamptz not null default now(),
                                           queueNumber serial unique not null,
                                           lastSignIn timestamptz not null default now(),
                                           admin bool not null default 'f',
                                           alertEmail bool not null default 't',
                                           alertPhone bool not null default 'f');`;
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

const GET_USER_BY_ID_QUERY = 'select * from users where calnetID=$1';
module.exports.getUserByID = id => {
    return pool.query(GET_USER_BY_ID_QUERY, [id]).then(res => {
        return res.rows[0];
    }).catch(err => {
        console.error('failed getting user from calnetID!', err.stack);
        return err;
    });
}

const INSERT_USER_QUERY = 'insert into users (calnetID, email) values ($1, $2)';
module.exports.insertUser = id => {
    return pool.query(INSERT_USER_QUERY, [id, `${id}@berkeley.edu`]).then(res => {
        return true;
    }).catch(err => {
        return err;
    });
}

const CONTAINS_USER_QUERY = 'select count(distinct calnetID) from users where calnetID=$1';
module.exports.containsUser = id => {
    return pool.query(CONTAINS_USER_QUERY, [id]).then(res => {
        return res.rows[0].count > 0;
    }).catch(err => {
        return err;
    });
}

const UPDATE_LAST_USER_SIGNIN = 'update users set lastSignIn=localtimestamp where calnetID=$1';
module.exports.updateLastUserSignin = id => {
    return pool.query(UPDATE_LAST_USER_SIGNIN, [id]).then(res => {
        return true;
    }).catch(err => {
        return err;
    });
}

const CHECK_ALL_USER_INFO = 'select firstName, lastName from users where calnetID=$1';
module.exports.checkAllUserInfoPresent = id => {
    return pool.query(CHECK_ALL_USER_INFO, [id]).then(res => {
        return res.rows[0].firstname !== '' &&
               res.rows[0].lastname !== '';
    }).catch(err => {
        return err;
    });
}
