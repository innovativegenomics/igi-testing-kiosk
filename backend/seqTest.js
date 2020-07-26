const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:admin@127.0.0.1:5432/testdb');

const Sloteq = sequelize.define('Sloteq', {
  numb: {
    type: DataTypes.INTEGER
  },
  location: {
    type: DataTypes.STRING
  }
}, {});

(async () => {
  await Sloteq.sync({ force: true });
  console.log('synced');
  await Sloteq.create({
    numb: 1,
    location: 'loc1'
  });
  await Sloteq.create({
    numb: 2,
    location: 'loc1'
  });
  await Sloteq.create({
    numb: 2,
    location: 'loc1'
  });
  await Sloteq.create({
    numb: 2,
    location: 'loc1'
  });
  await Sloteq.create({
    numb: 3,
    location: 'loc1'
  });
  await Sloteq.create({
    numb: 4,
    location: 'loc1'
  });
  await Sloteq.create({
    numb: 4,
    location: 'loc1'
  });

  await Sloteq.create({
    numb: 1,
    location: 'loc2'
  });
  await Sloteq.create({
    numb: 2,
    location: 'loc2'
  });
  await Sloteq.create({
    numb: 2,
    location: 'loc2'
  });
  await Sloteq.create({
    numb: 4,
    location: 'loc2'
  });




  const counts = (await Sloteq.findAll({
    attributes: [
      'numb',
      'location',
      [sequelize.cast(sequelize.fn('count', sequelize.col('*')), 'integer'), 'count']
    ],
    group: ['numb', 'location'],
    order: ['numb', 'location']
  })).map(v => v.dataValues);
  console.log(counts);
})();


