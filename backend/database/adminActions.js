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

const GET_SLOT = 'select * from schedule where appointmentuid=$1';
const GET_USER_NAMES = 'select firstname,lastname from users where calnetid=$1';
const GET_SCREENING = `select * from screening where calnetid=$1 and completed>$2::timestamptz-interval '4 hour' order by completed desc`;
module.exports.getSlotInfo = uid => {
    // get appointment slot by uid
    //   if no slot
    //     return {errors: ['INVALID_UID']}
    //   else
    //     loadUserInfo
    //     loadScreening
    //     if appointmentslot not right
    //       errors += ['WRONG_TIME']
    //     if not active
    //       errors += ['INACTIVE']
    //     if completed
    //       errors += ['COMPLETED']
    //     if not screened
    //       errors += ['NOT_SCREENED']
    //     if screening is positive
    //       errors += ['SCREENING_FAILED']

    return pool.connect().then(client => {
        const abort = getAbort(client);
        return client.query('begin').then(r => {
            console.log(uid);
            return client.query(GET_SLOT, [uid]);
        }).then(slot => {
            if(slot.rows.length < 1) return {errors: ['INVALID_UID']};
            return client.query(GET_USER_NAMES, [slot.rows[0].calnetid]).then(names => {
                return client.query(GET_SCREENING, [slot.rows[0].calnetid, slot.rows[0].appointmentslot]).then(screening => {
                    const errors = [];
                    if(!moment().isBetween(moment(slot.rows[0].appointmentslot), moment(slot.rows[0].appointmentslot).add(Settings().increment, 'minute'))) {
                        errors.push('WRONG_TIME');
                    }
                    if(!slot.rows[0].active) {
                        errors.push('INACTIVE');
                    }
                    if(slot.rows[0].completed) {
                        errors.push('COMPLETED');
                    }
                    if(screening.rows.length < 1) {
                        errors.push('NOT_SCREENED');
                    } else if(screening.rows[0].question0 ||
                              screening.rows[0].question1 ||
                              screening.rows[0].question2 ||
                              screening.rows[0].question3 ||
                              screening.rows[0].question4 ||
                              screening.rows[0].question5 ||
                              screening.rows[0].question6) {
                        errors.push('SCREENING_FAILED');
                    }
                    return {
                        errors: errors,
                        appointmentslot: moment(slot.rows[0].appointmentslot),
                        location: slot.rows[0].location,
                        firstname: names.rows[0].firstname,
                        lastname: names.rows[0].lastname,
                    };
                });
            });
        }).then(res => {
            return client.query('end transaction').then(r => client.release()).then(r => res);
        }).catch(err => abort(err));
    }).catch(err => {
        console.error('cannot test verify user');
        console.error(err);
        return err;
    });
}
