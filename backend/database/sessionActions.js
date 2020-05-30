const fs = require('fs');
const CREATE_SESSION_TABLE = fs.readFileSync('node_modules/connect-pg-simple/table.sql').toString();
const { Pool } = require('pg');
const pool = new Pool({
    user: require('../config/keys').pg.pguser,
    host: require('../config/keys').pg.pghost,
    database: require('../config/keys').pg.pgdatabase,
    password: require('../config/keys').pg.pgpassword,
    port: require('../config/keys').pg.pgport,
});

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
module.exports.verifySessionTable = () => {
    return pool.connect().then(client => {
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
}
