process.env.LOG_LEVEL = 'warn';
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const request = require('supertest');
const expect = chai.expect;
let app;
chai.use(chaiHttp);

before(done => {
  require('../app')().then(a => {
    app = a;
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server up and running on port ${port} !`);
      done();
    });
    // done();
  })
});

describe('GET /api/users/login', () => {
  it('should redirect to /newuser', async () => {
    const agent = request.agent(app);
    const login = await agent
      .get('/api/users/login')
      .query({devuser: 'user0'})
      .expect(302);
    expect(login).to.have.cookie('sessionId');

    await agent
      .get('/api/users/profile')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect({success: false, user: {}});
  });
});

describe('Create users', () => {
  it('should generate a bunch of users', async () => {
    for(let i = 0;i<100;i++) {
      const agent = request.agent(app);
      const login = await agent
        .get('/api/users/login')
        .query({devuser: 'user'+i})
        .expect(302);
      expect(login).to.have.cookie('sessionId');

      await agent
        .post('/api/users/profile')
        .send({
          firstname: "User"+i,
          lastname: "Resu"+i,
          dob: "2002-11-03T08:00:00.000Z",
          street: "164 Vicente Rd",
          city: "Berkeley",
          state: "CA",
          county: "Alameda",
          zip: "94705",
          sex: "Male",
          pbuilding: "IGIB",
          email: `user${i}@test.com`,
          phone: "+15106121014",
          questions: [true, true, true, true]
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect({success: true});
      
      const available = await agent
        .get('/api/slots/available')
        .expect(200)
        .expect('Content-Type', /json/);
      
      const kosh = available.body.available['Koshland'];
      let a = 0;
      let time = null;
      while(a<1) {
        const key = Object.keys(kosh)[Math.floor(Math.random()*Object.keys(kosh).length)];
        a = kosh[key];
        time = key;
      }
      await agent
        .post('/api/slots/slot')
        .send({time: time, location: 'Koshland', questions: [0, 0, null, false, false]})
        .expect(200);
    }
  });
});

// describe('GET /api/users/profile', () => {
//   it('should return unsuccessful for user profile', done => {
//     chai.request(app)
//       .get('/api/users/profile')
//       .end((err, res) => {
//         expect(err).to.be.null;
//         expect(res).to.have.status(200);
//         done();
//       });
//   });
// });