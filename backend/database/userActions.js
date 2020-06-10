const { Pool } = require('pg');
const pool = new Pool({
    user: require('../config/keys').pg.pguser,
    host: require('../config/keys').pg.pghost,
    database: require('../config/keys').pg.pgdatabase,
    password: require('../config/keys').pg.pgpassword,
    port: require('../config/keys').pg.pgport,
});
const moment = require('moment');

const { newPatient } = require('../lims');

const getAbort = (client) => {
    return err => {
        console.error('Error in transaction', err.stack);
        return client.query('rollback').then(res => {
            client.release();
            return err;
        });
    }
}

const LIMS_TABLE_CREATE = `create table lims(onerowid bool default true not null, accesstoken text null, refreshtoken text null, constraint onerow_uni check (onerowid))`;
const USER_TABLE_CREATE = `create table users(firstname text not null,
                                           middlename text null,
                                           lastname text not null,
                                           calnetid text primary key,
                                           dob date not null,
                                           street text not null,
                                           city text not null,
                                           state text not null,
                                           county text not null,
                                           zip text not null,
                                           sex text not null,
                                           race text not null,
                                           pbuilding text not null,
                                           email text unique not null,
                                           phone text unique null,
                                           patientid text unique null,
                                           datejoined timestamptz not null default now(),
                                           lastsignin timestamptz not null default now(),
                                           admin integer not null default 0);`;
const LIMS_TABLE_EXISTS = `select exists (select from information_schema.tables where table_name='lims')`;
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
            return client.query(LIMS_TABLE_EXISTS);
        }).then(res => {
            if(!res.rows[0].exists) {
                console.log('Lims table doesn\'t exit, creating one!');
                return client.query(LIMS_TABLE_CREATE);
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

module.exports.getUserExists = id => {
    return pool.query('select count(*)::integer from users where calnetid=$1', [id]).then(res => {
        return res.rows[0].count > 0;
    }).catch(err => {
        return false;
    });
}

module.exports.getUserProfile = id => {
    return pool.query('select * from users where calnetid=$1', [id]).then(res => {
        if(res.rowCount > 0) {
            return res.rows[0];
        } else {
            throw new Error('No user with that ID');
        }
    });
}

const SET_USER_PROFILE = `insert into users(firstname,
                                            middlename,
                                            lastname,
                                            calnetid,
                                            dob,
                                            street,
                                            city,
                                            state,
                                            county,
                                            zip,
                                            sex,
                                            race,
                                            pbuilding,
                                            email,
                                            phone) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                                                   $11, $12, $13, $14, $15)`;
module.exports.setUserProfile = (id, profile) => {
    return pool.query(SET_USER_PROFILE, [profile.firstname,
                                        profile.middlename,
                                        profile.lastname,
                                        id,
                                        moment.utc(profile.dob).toDate(),
                                        profile.street,
                                        profile.city,
                                        profile.state,
                                        profile.county,
                                        profile.zip,
                                        profile.sex,
                                        profile.race,
                                        profile.pbuilding,
                                        profile.email,
                                        profile.phone]).then(res => {
        return {success: res.rowCount>0};
    }).catch(err => {
        console.error(err);
        return {success: false};
    });
}

module.exports.setUserPatientID = (id, patientid) => {
    return pool.query('update users set patientid=$2 where calnetid=$1', [id, patientid]).then(res => {
        return res.rowCount > 0;
    }).catch(err => {
        console.error('Error updating user patientid');
        console.error(err);
        return false;
    });
}

module.exports.updateUserLastSignin = id => {
    return pool.query('update users set lastsignin=now() where calnetid=$1', [id]).then(res => {
        return res.rowCount > 0;
    }).catch(err => {
        return false;
    });
}

module.exports.addLIMSPatient = profile => {
    return pool.query('select accesstoken,refreshtoken from lims').then(res => {
        return newPatient(profile, res.rows[0].accesstoken, res.rows[0].refreshtoken).then(res => {
            if(res.accesstoken) {
                pool.query('update lims set accesstoken=$1 where onerowid=true', [res.accesstoken]);
            }
            return res.patient_id;
        }).catch(err => {
            console.error('Error posting new patient');
            console.error(err);
        });
    }).catch(err => {
        console.error(`Can't get access_token from database`);
        console.error(err);
    });
}
