const { Pool } = require('pg');
const pool = new Pool();

const USER_TABLE_CREATE = `create table users(firstName varchar(255) not null,
                                           lastName varchar(255) not null,
                                           calnetID varchar(255) primary key,
                                           email varchar(255) unique not null,
                                           phone varchar(255) unique null,
                                           dateJoined date not null default current_date,
                                           queueNumber serial unique not null,
                                           lastSignIn date not null default current_date,
                                           admin bool not null default 'f',
                                           alertEmail bool not null default 't',
                                           alertPhome bool not null default 'f');`;
const USER_TABLE_EXISTS = `select exists (select from information_schema.tables where table_name='users');`;

const getAbort = (client, done) => {
    return err => {
        console.error('Error in transaction', err.stack);
        return client.query('rollback').then((err, res) => {
            if(err) {
                console.error('Error in transaction', err.stack);

            }
            done();
        });
    }
}

module.exports.verifyTables = () => {
    const userTablePromise = new Promise((resolve, reject) => {
        pool.connect((err, client, done) => {
            console.log('connected');
            const abort = getAbort(client, done);
            client.query('begin').then(res => {
                console.log('begun');
                return client.query(USER_TABLE_EXISTS);
            }).then(res => {
                console.log('exists res: ');
                console.log(res);
                if(!res.rows[0].exists) {
                    console.log('users doesnt exist');
                    return client.query(USER_TABLE_CREATE);
                }
                console.log('users DOES exist');
                return;
            }).then(res => {
                console.log('ending transaction');
                console.log(res);
                return client.query('end transaction');
            }).then(res => {
                done(); // release client!!!
                resolve();
            }).catch(err => {
                abort(err).then(err, res => {
                    reject(err);
                });
            });
        });
    });
    return new Promise.all([userTablePromise]);
}
