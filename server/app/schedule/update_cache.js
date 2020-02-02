// module.exports = {
//     schedule: {
//         interval: '1m', // 1 分钟间隔
//         type: 'all', // 指定所有的 worker 都需要执行
//         immediate: true, //项目启动就执行一次定时任务
//     },
//     async task(ctx) {
//         let t = new Date().getTime() - 1200000;
//         let MINS_20 = new Date(t);

//         let res = await ctx.model.Room.find({
//             startTime:{ "$lte": MINS_20 }
//         })
//     },
// };

const Subscription = require('egg').Subscription;

class UpdateCache extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            interval: '10s', // 1 分钟间隔
            type: 'all', // 指定所有的 worker 都需要执行
            immediate: true, //项目启动就执行一次定时任务
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    // async subscribe() {
    //     console.log('1mins ------------', new Date())
    //     let { ctx, app } = this;
    //     const nsp = app.io.of('/');
    //     let t20 = new Date().getTime() - 20000;
    //     let MINS_20 = new Date(t20);

    //     // 游戏时间到，进入投票阶段
    //     let roomsPlaying = await ctx.model.Room.find({
    //         startTime: { "$lte": MINS_20 },
    //         status: {
    //             $in: ['PLAYING']
    //         }
    //     })
    //     await ctx.model.Room.updateMany({
    //         startTime: { "$lte": MINS_20 },
    //         status: 'PLAYING'
    //     }, {
    //         $set: {
    //             status: 'VOTEING'
    //         }
    //     })

    //     for (let room of roomsPlaying) {
    //         let count = await ctx.model.Content.count({ roomId: room.roomId })
    //         await ctx.model.Content.create({
    //             roomId: room.roomId,
    //             contentId: count,
    //             content: `当前时间:${getTime(new Date())},请在5分钟内完成投票`,
    //             type: 'DATE',
    //         })
    //         let result = await ctx.model.Content.find({
    //             contentId: {
    //                 $gte: count
    //             },
    //             roomId: room.roomId
    //         }).populate('userId')
    //         nsp.to(room.roomId).emit('chat', result);
    //         nsp.to(room.roomId).emit('update', '更新房间信息');
    //     }

    //     // 投票阶段的进入游戏游戏结束阶段

    //     let t25 = new Date().getTime() - 120000;
    //     let MINS_25 = new Date(t25);

    //     let roomsVoteing = await ctx.model.Room.find({
    //         startTime: { "$lte": MINS_25 },
    //         status: {
    //             $in: ['VOTEING']
    //         }
    //     })
    //     await ctx.model.Room.updateMany({
    //         startTime: { "$lte": MINS_25 },
    //         status: 'VOTEING'
    //     }, {
    //         $set: {
    //             status: 'FINISH'
    //         }
    //     })
    //     for (let room of roomsVoteing) {
    //         let count = await ctx.model.Content.count({ roomId: room.roomId })
    //         await ctx.model.Content.create({
    //             roomId: room.roomId,
    //             contentId: count,
    //             content: `当前时间:${getTime(new Date())},游戏结束`,
    //             type: 'DATE',
    //         })
    //         let result = await ctx.model.Content.find({
    //             contentId: {
    //                 $gte: count
    //             },
    //             roomId: room.roomId
    //         }).populate('userId')
    //         nsp.to(room.roomId).emit('chat', result);
    //         nsp.to(room.roomId).emit('update', '更新房间信息');
    //     }
    // }

    async subscribe() {
        console.log(new Date().getTime())
        let { ctx, app } = this;
        const nsp = app.io.of('/');
        let nowDate = new Date().getTime();
        let wolfEvents = await app.redis.get('wolfEvents')
        console.log(wolfEvents);
        wolfEvents = JSON.parse(wolfEvents || '[]')
        let currentEvents = wolfEvents.filter(e => e.timestamp < nowDate)
        let newEvents = wolfEvents.filter(e => e.timestamp > nowDate)
        // 存入还未到时间的事件

        for (const currentEvent of currentEvents) {
            let statusObj = {
                playTimeOver: 'VOTEING',
                voteTimeOver: 'FINISH'
            }
            // 更新房间状态
            await ctx.model.Room.update({
                roomId: currentEvent.roomId
            }, {
                $set: {
                    status: statusObj[currentEvent.event] || 'ERROR'
                }
            })
            if (currentEvent.event === 'playTimeOver') {
                newEvents.push({
                    roomId: currentEvent.roomId,
                    timestamp: new Date().getTime() + 5 * 60 * 1000,
                    event: 'voteTimeOver'
                })
                // 插入进入投票的提示
                let count = await ctx.model.Content.count({ roomId: currentEvent.roomId })
                await ctx.model.Content.create({
                    roomId: currentEvent.roomId,
                    contentId: count,
                    content: `当前时间:${getTime(new Date())},进入投票阶段！`,
                    type: 'DATE',
                })
                let result = await ctx.model.Content.find({
                    contentId: {
                        $gte: count
                    },
                    roomId: currentEvent.roomId
                }).populate('userId')
                nsp.to(currentEvent.roomId).emit('chat', result);
                nsp.to(currentEvent.roomId).emit('update', '更新房间信息');
            } else if (currentEvent.event === 'voteTimeOver') {
                let room = await ctx.model.Room.findOne({ roomId: currentEvent.roomId })
                room.status = 'FINISH';
                await room.save();
                // 插入进入游戏结束的提示
                let count = await ctx.model.Content.count({ roomId: currentEvent.roomId })
                for (let index in room.votes) {
                    await ctx.model.Content.create({
                        roomId: room.roomId,
                        contentId: count + Number(index),
                        to: room.votes[index].to,
                        content: '投票',
                        type: 'VOTE',
                        userId: room.votes[index].from,
                    })
                }
                let MaxVoters = getMaxVoter(room.votes, 'to');
                let winerText = '';
                // 回答正确的情况下投票完成
                if (room.getAnswer) {
                    winerText = MaxVoters.includes(room.prophet.toString()) ? '狼人获胜' : '好人获胜'
                }
                // 没有回答正确情况下投票完成
                if (!room.getAnswer) {
                    winerText = room.wolf.findIndex(w => MaxVoters.includes(w.toString())) == -1 ? '狼人获胜' : '好人获胜'
                }
                await ctx.model.Content.create({
                    roomId: currentEvent.roomId,
                    contentId: count + room.votes.length,
                    content: `当前时间:${getTime(new Date())},游戏结束,${winerText}！`,
                    type: 'DATE',
                })
                let result = await ctx.model.Content.find({
                    contentId: {
                        $gte: count
                    },
                    roomId: currentEvent.roomId
                }).populate(['userId', 'to'])
                nsp.to(currentEvent.roomId).emit('chat', result);
                nsp.to(currentEvent.roomId).emit('update', '更新房间信息');
            }
            await app.redis.set('wolfEvents', JSON.stringify(newEvents))

        }
    }
}


const getTime = (date) => {
    let hour = `0${date.getHours()}`.substr(-2);
    let mins = `0${date.getMinutes()}`.substr(-2);
    let sec = date.getSeconds();
    let milli = date.getMilliseconds();
    return `${hour}:${mins}`;
}
function getMaxVoter(arr, k) {
    let obj = {};
    arr.map(a => {
        obj[a[k]] ? obj[a[k]]++ : obj[a[k]] = 1;
    })
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

    return maxArr
}
module.exports = UpdateCache;