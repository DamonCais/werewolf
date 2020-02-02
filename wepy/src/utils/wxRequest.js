import wepy from '@wepy/core'
import tip from './tip'
import _ from './lodash';

const wxRequest = async (url, method, params = {}, header) => {
    let data = params || {}
    try {
        let res = await wepy.wx.request({
            url: url,
            method: method || 'GET',
            data: data,
            header: header || { 'Content-Type': 'application/json' }
        })
        console.log(res);
        if (res.statusCode == 400) {
            tip.tips(_.get(res.data, 'msg') || '发生错误了')
            throw 'error'
        }
        return res
    } catch (error) {

        return error
    }
}

module.exports = {
    wxRequest
}
