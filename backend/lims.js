const axios = require('axios');
const moment = require('moment');

const getNewAccessToken = refreshtoken => {
    axios.post(require('./config/keys').lims.token, null, {
                                                            params: {
                                                                grant_type: 'refresh_token',
                                                                client_id: require('./config/keys').lims.clientid,
                                                                client_secret: require('./config/keys').lims.clientsecret,
                                                                refresh_token: refreshtoken}
                                                        })
    .then(res => {
        return res.data.access_token;
    });
}

const postNewPatient = (accesstoken, payload) => {
    return axios.post(require('./config/keys').lims.add,
                        payload,
                        {headers: {Authorization: 'Bearer ' + accesstoken, 'Content-Type': 'application/json'}})
    .then(res => {
        if(res.data.patient_id) {
            return {patient_id: res.data.patient_id};
        } else {
            throw {response: res};
        }
    }).catch(err => {
        console.error('error posting new patient ' + payload);
        console.error(err);
        throw {error: err.response.data.errorCode};
    });
}

module.exports.newPatient = (profile, accesstoken, refreshtoken) => {
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
            County__c: profile.county || '',
            Email__c: profile.email,
            Phone__c: profile.phone,
            Primary_Location__c: profile.pbuilding
        }),
        settings: JSON.stringify({
            action: 'create',
            study: 'IGI Health Campus Initiative'
        })
    };
    return postNewPatient(accesstoken, payload).catch(err => {
        if(err.error === 'INVALID_SESSION_ID') {
            return getNewAccessToken(refreshtoken).then(res => {
                return postNewPatient(res, payload).then(id => ({...id, accesstoken: res}));
            });
        } else {
            throw new Error('Can not post new patient '+err);
        }
    });
}
