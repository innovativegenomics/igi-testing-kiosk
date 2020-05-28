const assert = require('assert');
const path = require('path');
require('dotenv').config({path: path.resolve(process.cwd(), '.env.dev')});
const { Pool } = require('pg');
const pool = new Pool();
const moment = require('moment');

const { Settings } = require('../database/settingsActions');
const { verifyTables } = require('../database/database');
const { insertUser, updateUserSchedules } = require('../database/userActions');

describe('database', () => { describe('#verifyTables()', () => {
    before((done) => {
        pool.connect().then(client => {
            return client.query('drop table users');
        }).then(r => done()).catch(e => done(e));
    });
    it('should not throw error', done => {
        verifyTables().then(r => done()).catch(e => done(e));
    });
});
});

describe('Settings', () => {
    it('should be all settings values from database', done => {
        console.log(Settings());
        done();
    });
    it('should cause update to settings object', done => {
        pool.connect().then(client => {
            return client.query('select dayquota from settings where onerowid=true').then(res => {
                const oldValue = res.rows[0].dayquota;
                return client.query('update settings set dayquota=$1 where onerowid=true', [oldValue+1]).then(res => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {console.log(Settings()); resolve()}, 50);
                    });
                }).then(res => {
                    return client.query('update settings set dayquota=$1 where onerowid=true', [oldValue]);
                });
            }).then(res => {
                client.release();
                done();
            });
        }).catch(e => done(e));
    });
});

describe('userActions', () => {
    describe('#insertUser', function(done) {
        this.timeout(15000);
        it('should not throw error', done => {
            var promiseChain = Promise.resolve(0);
            for(var i = 0;i < 18;i++) {
                promiseChain = promiseChain.then(res => {
                    const now = Date.now();
                    return insertUser(`user${res}`).then(r => {
                        console.log(res + ' : ' + (Date.now()-now) + 'ms');
                        return res+1;
                    });
                });
            }
            promiseChain.then(r => done()).catch(e => {done(e)});
        });
    });
    describe('#updateUserSchedules', function(done) {
        it('should not throw error', done => {
            const date = moment().add(1, 'day');
            updateUserSchedules(date.toDate()).then(r => done()).catch(e => done(e));
        });
    });
});
