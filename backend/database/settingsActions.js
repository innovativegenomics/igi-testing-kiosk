const { Pool } = require('pg');
const pool = new Pool({
    user: require('../config/keys').pg.pguser,
    host: require('../config/keys').pg.pghost,
    database: require('../config/keys').pg.pgdatabase,
    password: require('../config/keys').pg.pgpassword,
    port: require('../config/keys').pg.pgport,
});

var settings = {
    onerowid: true,
    dayquota: 100, // people per day
    locations: [], // location names
    locationlinks: [], // google maps links of locations
    days: [1, 2, 3, 4, 5], // days of the week that testing happens on, monday is 1
    starttime: 8, // start time hour
    endtime: 13, // end time hour
    increment: 10, // time slot increment in minutes
    buffer: 3, // number of people per time slot
    maxreschedules: 10, // number of times a person can reschedule an appointment
    maxscreenings: 3, // number of screening submissions a person can do per day
};
module.exports.Settings = () => {
    return settings;
};

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

const SETTINGS_TRIGGER = `create trigger settingsupdate
                            after update
                            on settings
                            for each row
                            execute procedure notify_settings()`;
const SETTINGS_TRIGGER_EXISTS = `select trigger_name from information_schema.triggers where event_object_table=\'settings\'`;
const SETTINGS_NOTIFY = `create or replace function notify_settings() returns trigger as
                            $body$
                            begin
                                raise notice 'update';
                                perform pg_notify('settings_update', row_to_json(new)::text);
                                return new;
                            end;
                            $body$
                            language 'plpgsql' volatile cost 100;`;
const SETTINGS_LISTEN = `listen settings_update`;
const SETTINGS_TABLE_CREATE = `create table settings (onerowid bool primary key default true,
                                                      dayquota integer not null,
                                                      locations text[] not null,
                                                      locationlinks text[] not null,
                                                      days integer[] not null,
                                                      starttime integer not null,
                                                      endtime integer not null,
                                                      increment integer not null,
                                                      buffer integer not null,
                                                      maxreschedules integer not null,
                                                      maxscreenings integer not null,
                                                      constraint onerow_uni check (onerowid))`;
const SETTINGS_ROW_CREATE = `insert into settings values (true, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
const SETTINGS_UPDATE_CURRENT = `select * from settings where onerowid=true`;
const SETTINGS_TABLE_EXISTS = `select exists (select from information_schema.tables where table_name='settings')`;
const rowUpdate = data => {
    data = JSON.parse(data);
    settings = {...data};
}
pool.connect().then(client => {
    client.on('notification', data => { rowUpdate(data.payload) });
    client.query(SETTINGS_LISTEN);
});
module.exports.verifySettingsTable = () => {
    return pool.connect().then(client => {
        const abort = getAbort(client);
        return client.query('begin').then(res => {
            return client.query(SETTINGS_TABLE_EXISTS);
        }).then(res => {
            if(!res.rows[0].exists) {
                console.log('Settings table doesn\'t exist, creating one!');
                return client.query(SETTINGS_TABLE_CREATE).then(res => {
                    return client.query(SETTINGS_ROW_CREATE, [settings.dayquota,
                                                              settings.locations,
                                                              settings.locationlinks,
                                                              settings.days,
                                                              settings.starttime,
                                                              settings.endtime,
                                                              settings.increment,
                                                              settings.buffer,
                                                              settings.maxreschedules,
                                                              settings.maxscreenings,]);
                });
            } else {
                return client.query(SETTINGS_UPDATE_CURRENT).then(res => {
                    settings = {...res.rows[0]};
                });
            }
        }).then(res => {
            return client.query(SETTINGS_TRIGGER_EXISTS).then(res => {
                return res.rowCount > 0;
            });
        }).then(res => {
            if(!res) {
                return client.query(SETTINGS_NOTIFY).then(res => { return client.query(SETTINGS_TRIGGER) });
            }
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
