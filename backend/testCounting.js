const { Sequelize, sequelize, User, Slot, ReservedSlot, OpenTime, Location } = require('./models');
const Op = Sequelize.Op;
const moment = require('moment');
(async () => {
  // const res = await OpenTime.findAll({
  //   where: {
  //     id: 99
  //   },
  //   attributes: {
  //     include: [[Sequelize.cast(Sequelize.fn('COUNT', Sequelize.col('ReservedSlots.id')), 'INTEGER'), 'reservedCount']]
  //   },
  //   include: [{
  //     model: ReservedSlot, attributes: [], where: {
  //       calnetid: {
  //         [Op.ne]: 'user36'
  //       }
  //     },
  //     required: false
  //   }],
  //   group: ['OpenTime.id']
  // });

  // const res = await OpenTime.findOne({
  //   where: {
  //     id: 99
  //   },
  //   include: ReservedSlot
  // });

  // const reqtime = moment('2020-08-04 17:00:00.000 +00:00');
  // const reqlocation = { id: 1 };
  // const calnetid = 'user36';
  // const res = (await OpenTime.findOne({
  //   where: {
  //     starttime: {
  //       [Op.gte]: reqtime.toDate()
  //     },
  //     available: {
  //       [Op.gt]: 0
  //     }
  //     // id: 99
  //   },
  //   attributes: {
  //     include: [[Sequelize.cast(Sequelize.fn('COUNT', Sequelize.col('ReservedSlots.id')), 'INTEGER'), 'reservedCount']]
  //   },
  //   include: [
  //     {
  //       model: Location,
  //     }, 
  //     {
  //       model: ReservedSlot,
  //       attributes: [],
  //       where: {
  //         calnetid: {
  //           [Op.ne]: calnetid
  //         }
  //       },
  //       required: false,
  //       duplicating: false
  //     }
  //   ],
  //   group: ['OpenTime.id', 'Location.id']
  // }));

  // const res = await User.findAndCountAll({
  //   attributes: {
  //     include: [
  //       [
  //         sequelize.literal(`(
  //           SELECT time
  //           FROM "Slots" AS slot
  //           WHERE
  //             slot.calnetid = "User".calnetid
  //           AND
  //             slot.current = true
  //           )`),
  //         'slotTime'
  //       ]
  //     ]
  //   },
  //   order: [
  //     [sequelize.literal('"slotTime"'), 'asc']
  //   ],
  //   include: [
  //     {
  //       model: Slot,
  //       where: {
  //         current: true
  //       },
  //       required: true
  //     }
  //   ]
  // });
  // const res = await User.count({
  //   include: {
  //     model: Slot,
  //     where: {
  //       current: true
  //     },
  //     required: true
  //   }
  // });

  // const res = await OpenTime.findAll({
  //   attributes: [
  //     [sequelize.cast(sequelize.fn('sum', sequelize.col('buffer')), 'INTEGER'), 'sum'],
  //     [sequelize.cast(sequelize.fn('date_trunc', 'week', sequelize.col('date')), 'DATE'), 'week']
  //   ],
  //   include: [
  //     {
  //       model: Slot,
  //       attributes: [
  //         [sequelize.cast(sequelize.fn('count', sequelize.col('*')), 'INTEGER'), 'count']
  //       ]
  //     }
  //   ],
  //   group: ['week'],
  //   order: [
  //     [sequelize.literal(`"week"`), 'asc']
  //   ],
  // });

  const res = await Slot.findOne({
    include: [
      {
        model: User
      }
    ]
  });

  console.log(JSON.stringify(res, null, 2));
})();
