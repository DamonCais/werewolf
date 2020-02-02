
// let str = `
// 牛角面包，演员的诞生，自言自语，绿箭口香糖，苏打绿，疯狂动物城，巧克力布朗尼，手舞足蹈，昂首挺胸，张牙舞爪，苏轼，体重秤，花样滑冰，生鱼片，敦刻尔克，红枣馒头，中国好歌声，夜空中最亮的星，屠呦呦，佛系青年，王牌特工，电动窗帘，蹑手蹑脚，外卖小哥葡式蛋挞，中国有嘻哈，三下五除二，无印良品，五月天，战狼，红烧牛肉面，嬉皮笑脸，丢三落四，坐井观天，李商隐，空气炸锅，中国足球，，鱼香肉丝，私人订制，过桥米线，蒙面歌王，一剪梅，蜘蛛侠，辣眼睛，复仇者联盟，蓝牙音箱，倾国倾城，摄影师，
// 日本料理，无限挑战，大眼瞪小眼，宜家家居，费玉清，冰雪奇缘，开心果，喜出望外，头悬梁锥刺股，斗转星移，李清照，移动电源，立定跳远，王者荣耀，鸳鸯锅，我的前半生，辣条，非你莫属，金拱门，盗梦空间，喜剧之王，共享单车，白驹过隙，铲屎官
// `
// let arr = str.split('，')
// console.log(arr, arr.length);

const _ = require('lodash');
let arr = [{ id: 1, name: 'me' }, { id: 1, name: 'you' }, { id: 2, name: 'her' }, { id: 2, name: 'her' }];
let obj = {};
arr.map(a => {
    obj[a.id] ? obj[a.id]++ : obj[a.id] = 1;
})
console.log(obj);
let max = 0;
let maxArr = [];
Object.keys(obj).forEach(key => {
    if (obj[key] > max) {
        max = obj[key];
        maxArr = [key];
    } else if (obj[key] == max) {
        maxArr.push(key)
    }

})
console.log(maxArr);
