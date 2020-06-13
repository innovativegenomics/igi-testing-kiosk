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

/**
 * Admin levels:
 * 0 - basic level: can scan QR codes and see user appointments
 * 1 - station 2 level: can scan QR codes, and can mark users as completed
 * 2 - supervisor: can view statistics and export data
 * 3 - superuser: can add new admin users
 */
const ADMIN_TABLE_CREATE = `create table admin(name text not null,
    calnetid text unique null,
    email text not null,
    phone text null,
    datejoined timestamptz not null default now(),
    lastsignin timestamptz not null default now(),
    level integer not null,
    uid text not null)`;
const ADMIN_TABLE_EXISTS = `select exists (select from information_schema.tables where table_name='admin')`;
module.exports.verifyAdminTable = () => {
    return pool.connect().then(client => {
        const abort = getAbort(client);
        return client.query('begin').then(res => {
            return client.query(ADMIN_TABLE_EXISTS);
        }).then(res => {
            if(!res.rows[0].exists) {
                console.log('Admin table doesn\'t exit, creating one!');
                return client.query(ADMIN_TABLE_CREATE);
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

/**
 * Adds a new admin user, and returns a UID for that admin
 * @param {string} name - the full name of the new admin
 * @param {string} email - the email of the new admin
 * @param {string} phone - the phone of the new admin
 * @param {Number} level - the level of the new admin
 */
module.exports.addAdminUser = (name, email, phone, level) => {

}

/**
 * When a request comes in to create new account with uid,
 * check if the UID is linked to an admin account, and if 
 * the account is already created.
 * @param {string} uid - the UID from the new user request
 */
module.exports.checkAdminExists = uid => {

}

/**
 * Sets the calnetid for an admin account
 * @param {string} uid - the UID linked to the admin account
 * @param {string} calnetid - the calnetid to attach to it
 */
module.exports.setAdminCalnetid = (uid, calnetid) => {

}

/**
 * Returns the admin level of the specified user.
 * If the user doesn't exist, returns -1.
 * @param {string} calnetid - the calnetid to check
 */
module.exports.getAdminLevel = calnetid => {

}






// module.exports.getUserAdmin = id => {
//     return pool.query('select admin from users where calnetid=$1', [id]).then(res => {
//         return res.rows[0].admin;
//     }).catch(err => {
//         console.error('Error getting user admin ' + id);
//         console.error(err);
//         throw err;
//     });
// }

// module.exports.getSlotDetails = uid => {
//     return pool.query('select * from schedule where uid=$1', [uid]).then(res => {
//         if(res.rowCount < 1)
//             throw new Error('Invalid UID');
//         else {
//             return res.rows[0];
//         }
//     });
// }

// module.exports.completeUserSlot = uid => {
//     return pool.query('update schedule set completed=now() where uid=$1', [uid]).then(res => {
//         return res.rowCount > 0;
//     }).catch(err => {
//         console.error('error completing slot with uid ' + uid);
//         console.error(err);
//         return false;
//     });
// }

// /**
//  * 
//  * @param {Array<string>} terms - search terms which are separated by spaces
//  */
// const SEARCH_BY_TERM = `select 
//                             u.calnetid,
//                             u.firstname,
//                             u.lastname,
//                             s.slot,
//                             s.location,
//                             s.completed
//                         from 
//                             users u,schedule s 
//                         inner join 
//                             (select calnetid,
//                                 max(slot) as MaxDateTime 
//                             from schedule 
//                             group by calnetid) groupeds 
//                         on 
//                             s.calnetid=groupeds.calnetid 
//                         and 
//                             s.slot=groupeds.MaxDateTime 
//                         where 
//                             u.calnetid=s.calnetid
//                         and 
//                             (lower(u.lastname) like concat(lower($1),'%') or lower(u.firstname) like concat(lower($1),'%'))
//                         order by
//                             s.location,
//                             s.slot`;
// module.exports.getAppointmentsByName = term => {
//     return pool.query(SEARCH_BY_TERM, [term]).then(res => {
//         return res.rows;
//     }).catch(err => {
//         console.error('error searching user appoitnments by name');
//         console.error(err);
//         return [];
//     });
// }
