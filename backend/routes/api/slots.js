const express = require('express');
const router = express.Router();
const pino = require('pino')({level: process.env.LOG_LEVEL || 'info'});

const cas = require('../../cas');

/**
 * gets available slots
 * response:
 * {
 *   success: true,
 *   available: {
 *     locationname: {
 *       Moment: number,
 *       Moment: number,
 *     }
 *   }
 * }
 */
router.get('/available', cas.block, (request, response) => {

});

/**
 * gets current user's slot
 * response:
 * {
 *   success: true,
 *   slot: {
 *     location: string,
 *     time: Moment,
 *     uid: string
 *   }
 * }
 */
router.get('/slot', cas.block, (request, response) => {

});

/**
 * requests a slot for current user
 * request:
 * {
 *   location: string,
 *   time: Moment
 * }
 * response:
 * {success: true|false}
 */
router.post('/slot', cas.block, (request, response) => {

});

/**
 * requests current slot to be cancelled
 * response:
 * {success: true|false}
 */
router.delete('/slot', cas.block, (request, response) => {

});

module.exports = router;
