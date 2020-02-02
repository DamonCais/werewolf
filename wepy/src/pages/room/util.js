
import _ from '@/utils/lodash';

export function setRoleName(roomInfo = {}) {
    let wolfs = _.get(roomInfo, 'wolf') || []
    let prophet = _.get(roomInfo, 'prophet');
    let header = _.get(roomInfo, 'header');
    if (roomInfo.openIds) {
        roomInfo.openIds.forEach(user => {
            let str = [];
            header == user._id ? str.push('村长') : '';
            wolfs.includes(user._id) ? str.push('狼人') : '';
            prophet == user._id ? str.push('先知') : '';
            str = str.length ? str : ['村民'];
            user.roleName = str.join(',')
        });
    }
    return roomInfo

}