const { Pool } = require('pg');
const pool = new Pool();

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

const CREATE_SCREENING_TABLE = `create table screening(calnetid text not null,
                                                       completed timestamptz not null default now(),
                                                       question0 bool not null default false,
                                                       question1 bool not null default false,
                                                       question2 bool not null default false,
                                                       question3 bool not null default false,
                                                       question4 bool not null default false,
                                                       question5 bool not null default false,
                                                       question6 bool not null default false)`;
const SCREENING_TABLE_EXISTS = 'select exists (select from information_schema.tables where table_name=\'screening\')';
module.exports.verifyScreeningTable = () => {
    return pool.connect().then(client => {
        const abort = getAbort(client);
        return client.query('begin').then(res => {
            return client.query(SCREENING_TABLE_EXISTS);
        }).then(res => {
            if(!res.rows[0].exists) {
                console.log('screening table doesn\'t exist, creating one!');
                return true;
            }
            return false;
        }).then(res => {
            if(res) {
                return client.query(CREATE_SCREENING_TABLE);
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

const INSERT_SCREENING = `insert into screening(calnetid, question0, 
                                                          question1, 
                                                          question2, 
                                                          question3, 
                                                          question4, 
                                                          question5, 
                                                          question6) values ($1, $2, $3, $4, $5, $6, $7, $8)`;
module.exports.insertScreening = (id, questions) => {
    return pool.query(INSERT_SCREENING, [id, questions.question0,
                                             questions.question1,
                                             questions.question2,
                                             questions.question3,
                                             questions.question4,
                                             questions.question5,
                                             questions.question6,]).then(r => true);
}
