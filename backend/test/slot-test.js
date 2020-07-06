const request = require('supertest');
const moment = require('moment');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);
const { GenericContainer } = require("testcontainers");
const Umzug = require('umzug');
let pgContainer;
let app;
let server;

before(function(done) {
  this.timeout(10000);
  (async () => {
    pgContainer = await new GenericContainer("postgres")
      .withEnv("POSTGRES_USER", "postgres")
      .withEnv("POSTGRES_PASSWORD", "admin")
      .withEnv("POSTGRES_DB", "kioskdb")
      .withExposedPorts(5432)
      .start();
    process.env.POSTGRES_PORT = pgContainer.getMappedPort(5432);
    const { Sequelize, sequelize, Day } = require('../models');
    const migrator = new Umzug({
      migrations: {
        path: process.cwd() + '/migrations',
        params: [
          sequelize.getQueryInterface(),
          Sequelize
        ]
      },
      storage: 'none' // only for testing, we don't need to store migrations
    });
    const seeder = new Umzug({
      migrations: {
        path: process.cwd() + '/seeders',
        params: [
          sequelize.getQueryInterface(),
          Sequelize
        ]
      },
      storage: 'none'
    });
    await migrator.up();
    console.log('all migrations ran successfully');
    await seeder.up();
    console.log('all seeders ran successfully');
    // await Day.create({
    //   starthour: 12,
    //   startminute: 0,
    //   endhour: 16,
    //   endminute: 30,
    //   date: moment().startOf('week').set('day', 1).toDate(),
    //   window: 10,
    //   buffer: 3
    // });
    app = await require('../app')();
    const port = 5000;
    server = app.listen(port, () => {
      console.log(`Server up and running on port ${port} !`);
      done();
    });
  })();
});

describe('GET /api/slots/available', () => {
  let agent;
  it('should log user in', async () => {
    const agent = request.agent(app);
    const login = await agent
      .get('/api/users/login')
      .query({devuser: 'user0'})
      .expect(302);
    expect(login).to.have.cookie('sessionId');
  });
  // it('should successfully create user profile', async () => {
  //   const resp = await agent
  //     .post('/api/users/profile')
  //     .send({
  //       firstname: "User0",
  //       lastname: "Resu0",
  //       dob: "2002-11-03T08:00:00.000Z",
  //       street: "164 Vicente Rd",
  //       city: "Berkeley",
  //       state: "CA",
  //       county: "Alameda",
  //       zip: "94705",
  //       sex: "Male",
  //       pbuilding: "IGIB",
  //       email: `user0@test.com`,
  //       phone: "+15106121014",
  //       questions: [true, true, true, true]
  //     })
  //     .expect(200);
  // });
  // it('should get available slots', async () => {
  //   const available = await agent
  //     .get('/api/slots/available')
  //     .expect(200)
  //     .expect({
  //       success: true,
  //       available: {
  //         Koshland: {
  //           [moment().startOf('week').set('day', 1).set('hour', 12).toString()]: 3
  //         }
  //       }
  //     });
  // });
});

after(done => {
  server.close();
  pgContainer.stop();
  done();
});
