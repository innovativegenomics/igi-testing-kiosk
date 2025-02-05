const axios = require('axios');
// const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const moment = require('moment');

const getNewAccessToken = async (refreshtoken, logger) => {
  const request = await axios.post(require('./config/keys').lims.token, null, {
    params: {
      grant_type: 'refresh_token',
      client_id: require('./config/keys').lims.clientid,
      client_secret: require('./config/keys').lims.clientsecret,
      refresh_token: refreshtoken
    }
  });
  logger.info('NEW ACCESS TOKEN');
  return request.data.access_token;
}

const postNewPatient = async (accesstoken, payload, logger) => {
  try {
    const request = await axios.post(require('./config/keys').lims.add,
      payload,
      { headers: { Authorization: 'Bearer ' + accesstoken, 'Content-Type': 'application/json' } });
    const resp = JSON.parse(request.data);
    if (resp.patient_id) {
      return { patient_id: resp.patient_id };
    } else {
      throw { response: { data: resp } };
    }
  } catch (err) {
    logger.warn(err);
    throw { error: err.response.data[0].errorCode };
  }
}

module.exports.newPatient = async (profile, accesstoken, refreshtoken, logger) => {
  logger.info(`Date of Birth: ${moment.utc(profile.dob).format('YYYY-MM-DD HH:mm:ss')}`);
  const payload = {
    payload: JSON.stringify({
      First_Name__c: profile.firstname,
      Middle_Name__c: profile.middlename || '',
      Last_Name__c: profile.lastname,
      Sex__c: profile.sex,
      DOB__c: moment.utc(profile.dob).format('YYYY-MM-DD HH:mm:ss'),
      Street__c: profile.street,
      City__c: profile.city,
      State_Province__c: profile.state,
      Zip_Postal_Code__c: profile.zip,
      County__c: profile.county,
      Email__c: profile.email,
      Phone__c: profile.phone || '',
      Primary_Location__c: profile.pbuilding
    }),
    settings: JSON.stringify({
      action: 'create',
      study: 'IGI Health Campus Initiative'
    })
  };
  try {
    const response = await postNewPatient(accesstoken, payload, logger);
    return response;
  } catch (err) {
    logger.warn('CATCHING ERROR FROM PATIENT ATTEMPT');
    logger.warn(err);
    if (err.error === 'INVALID_SESSION_ID') {
      logger.warn('TRYING TO GET NEW ACCESS TOKEN');
      const newtoken = await getNewAccessToken(refreshtoken, logger);
      const response = await postNewPatient(newtoken, payload, logger);
      return { ...response, accesstoken: newtoken };
    } else {
      throw new Error('Can not post new patient');
    }
  }
}
