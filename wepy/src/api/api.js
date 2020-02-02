import {
    wxRequest
} from '@/utils/wxRequest'

const baseUrl = 'https://www.jycais.cn/'
// http://jvs.juvending.cn/api/sys/Get_VersionList?ver=0.00&token=00001iloveyouruo

const get = (url, params) => {

    return wxRequest(baseUrl + url, 'GET', params)
}

const post = (url, params) => {
    return wxRequest(baseUrl + url, 'POST', params)
}
export default {
    get,
    post,
}

function getFullUrl(url, params) {
    let query = ''
    for (let p in params) {
        if (typeof params[p] === 'object') {
            query += `&${p}=${JSON.stringify(params[p])}`
        } else {
            query += `&${p}=${params[p]}`
        }
    }
    url += '?' + query.substring(1)
    return encodeURI(url)
}
