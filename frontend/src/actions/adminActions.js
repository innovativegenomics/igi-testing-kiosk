import axios from 'axios';

export const getSlotInfo = uid => {
    return axios.post('/api/admin/get_slot_info', {uid: uid}).then(res => {
        if(res.status === 200) {
            return res.data;
        } else {
            console.error('could not load slot details');
            return undefined;
        }
    }).catch(err => {
        console.error('could not load slot details');
        console.error(err);
        return err;
    });
}
