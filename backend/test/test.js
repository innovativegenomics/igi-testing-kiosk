process.env.TZ = 'America/Los_Angeles';
process.env.PGUSER = require('../config/keys').pg.pguser;
process.env.PGHOST = require('../config/keys').pg.pghost;
process.env.PGPASSWORD = require('../config/keys').pg.pgpassword;
process.env.PGDATABASE = require('../config/keys').pg.pgdatabase;
process.env.PGPORT = require('../config/keys').pg.pgport;
const { Pool } = require('pg');
const pool = new Pool();
const moment = require('moment');

const { Settings } = require('../database/settingsActions');
const { verifyTables } = require('../database/database');
const { insertUser, getUsersByID } = require('../database/userActions');
const { updateUserSchedules, getOpenSlots, assignSlot, testVerifyUser } = require('../database/scheduleActions');

describe('database', () => { describe('#verifyTables()', () => {
    before((done) => {
        pool.connect().then(client => {
            return client.query('drop table users').then(r => client.query('drop table schedule'));
        }).then(r => done()).catch(e => done(e));
        // console.log('here');
        // done();
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
    describe('#insertUser', function() {
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
    describe('#getUsersByID', function() {
        it('should return users 1-5', done => {
            const users = ['user1', 'user2', 'user3', 'user4', 'user5'];
            getUsersByID(users).then(res => {console.log(res.map(x => x.calnetid));done()}).catch(err => done(err));
        });
    });
});

describe('userActions', () => {
    describe('#updateUserSchedules', function() {
        it('should not throw error', done => {
            const date = moment().add(1, 'day');
            updateUserSchedules(date.toDate()).then(r => {console.log(r);done()}).catch(e => done(e));
        });
    });
    describe('#getOpenSlots', function() {
        it('should return open slots', done => {
            getOpenSlots(2020, 5, 3).then(r => done()).catch(e => done(e));
        });
    });
    describe('#assignSlot', function() {
        it('should not assign correct slot', done => {
            const promises = [];
            promises.push(assignSlot('user15', 'Cafe Strada', 2020, 5, 2, 12, 50, 'UNIQUEID').then(r => console.log(r)).catch(e => done(e)));
            promises.push(assignSlot('user16', 'Cafe Strada', 2020, 5, 2, 12, 50, 'UNIQUEID').then(r => console.log(r)).catch(e => done(e)));
            promises.push(assignSlot('user17', 'Cafe Strada', 2020, 5, 2, 12, 50, 'UNIQUEID').then(r => console.log(r)).catch(e => done(e)));
            promises.push(assignSlot('user0', 'Cafe Strada', 2020, 5, 2, 12, 50, 'UNIQUEID').then(r => console.log(r)).catch(e => done(e)));
            promises.push(assignSlot('user1', 'Cafe Strada', 2020, 5, 2, 12, 50, 'UNIQUEID').then(r => console.log(r)).catch(e => done(e)));
            Promise.all(promises).then(r => {
                return promises.push(assignSlot('user0', 'Cafe Strada', 2020, 5, 2, 12, 30, 'UNIQUEID').then(r => console.log(r)).catch(e => done(e)));
            }).then(res => done());
        });
    });
    describe('#testVerifyUser', function() {
        it('should verify some users', done => {
            var promiseChain = Promise.resolve(0);
            for(var i = 0;i < 7;i++) {
                promiseChain = promiseChain.then(res => {
                    return testVerifyUser(`user${res}`).then(r => {
                        console.log(`user${res} : ${r}`);
                        return res+1;
                    });
                });
            }
            promiseChain.then(r => done()).catch(e => {done(e)});
        });
    });
    describe('#updateUserSchedules', function() {
        it('should not throw error', done => {
            const date = moment().add(2, 'day');
            updateUserSchedules(date.toDate()).then(r => {console.log(r);done()}).catch(e => done(e));
        });
    });
    describe('#testVerifyUser', function() {
        it('should verify some users', done => {
            var promiseChain = Promise.resolve(10);
            for(var i = 0;i < 7;i++) {
                promiseChain = promiseChain.then(res => {
                    return testVerifyUser(`user${res}`).then(r => {
                        console.log(`user${res} : ${r}`);
                        return res+1;
                    });
                });
            }
            promiseChain.then(r => done()).catch(e => {done(e)});
        });
    });
    // describe('#getOpenSlots', function() {
    //     it('should return open slots', done => {
    //         getOpenSlots(2020, 5, 2).then(r => {console.log(r); return done()}).catch(e => done(e));
    //     });
    // });
});
