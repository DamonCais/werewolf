'use strict';

const Service = require('egg').Service;
const _ = require('lodash');
const constantStr = require('../utils/constant.js')
class RoomService extends Service {
    // 更新用户信息
    async updateUserInfo(userInfo) {
        let { ctx } = this;
        if (userInfo.avatarUrl) {
            await ctx.model.User.update({
                openId: userInfo.openId
            }, userInfo, { upsert: true })
        } else {
            let userBefore = await ctx.model.User.findOne({ openId: userInfo.openId })
            userBefore = userBefore ? userBefore.toObject() : {}
            await ctx.model.User.update({
                openId: userInfo.openId
            }, Object.assign({
                openId: userInfo.openId,
                avatarUrl: '',
                nickName: '游客'
            }, userBefore), { upsert: true })
        }

        let user = await ctx.model.User.findOne({ openId: userInfo.openId })
        return user
    }
    // 创建房间
    async createRoom(openId) {
        let { ctx } = this;
        let user = await ctx.model.User.findOne({ openId })
        if (!user) {
            return {
                msg: '请重新进入小程序'
            }
        }
        let countSelf = await ctx.model.Room.count({
            openIds: { $elemMatch: { $eq: user } },
            status: { $eq: 'NEW' }
        })
        console.log('已创建房间', countSelf)
        if (countSelf >= 2) {
            return {
                msg: '最多只能创建2个房间'
            }
        }
        let count = await ctx.model.Room.count()
        let obj = {
            roomId: count + 1,
        }
        let room = await ctx.model.Room.create(obj);
        room.openIds.push(user);
        await room.save();
        return room

    }
    // 获取房间列表
    async getRooms(query = {}) {
        console.log(query)
        const { ctx } = this;
        if (!query.status) {
            query.status = {
                $ne: "EMPTY"
            }
        }

        let result = await ctx.model.Room
            .find(query).populate('openIds')

        return result;
    }
    // 加入房间
    async joinRoom(roomId, openId) {
        const { ctx, app } = this;
        const nsp = app.io.of('/');
        let room = await ctx.model.Room.findOne({ roomId });
        let user = await ctx.model.User.findOne({ openId: openId })

        if (!room) {
            ctx.status = 400;
            return { msg: '请刷新小程序' }
        }
        // NEW时才可以加入房间
        if (room && room.status == 'NEW' && room.openIds && !room.openIds.includes(user._id)) {
            room.openIds.push(user._id)
        }
        await ctx.model.Room.update({ roomId }, { openIds: room.openIds })

        nsp.to(roomId).emit('update', '更新房间信息啦');
        return {
            msg: 'success'
        };
    }
    // 踢出房间
    async kickRoom(roomId, userId) {
        const { ctx } = this;
        let room = await ctx.model.Room.findOne({ roomId });
        if (room.status != 'NEW') {
            return {
                msg: 'fail'
            }
        }
        room.openIds = room.openIds.filter(o => o != userId)
        let obj = {
            openIds: room.openIds
        }
        if (!room.openIds.length) {
            obj.status = 'EMPTY'
        }
        await ctx.model.Room.update({ roomId }, obj)
        return {
            msg: 'success'
        };
    }
    // 开始游戏
    async startGame({ roomId, playTime, voteTime }) {
        // 分配角色，确定选词
        const { ctx, app } = this;
        const nsp = app.io.of('/');
        let room = await ctx.model.Room.findOne({ roomId });
        let { openIds } = room;
        if (openIds.length < 4) {
            ctx.status = 400
            return {
                msg: '最少4个人'
            }
        }
        // 随机获取一个村长
        let header = getRandomArrayElements(openIds, 1);
        // 随机获取一个先知n个狼人
        let ids = openIds.length >= 7 ? 3 : 2
        let idsArr = getRandomArrayElements(openIds, ids);
        room.playTime = playTime || 20;
        room.voteTime = voteTime || 5;
        room.header = header;
        room.prophet = idsArr.shift();
        room.wolf = idsArr;
        room.words = getRandomArrayElements(constantStr, 2);
        room.status = 'PICKING'
        // 更新redis事件
        await this.updateEvent(roomId, 'playTimeOver', 20)
        await room.save();
        let count = await ctx.model.Content.count({ roomId: roomId })
        await ctx.model.Content.create({
            roomId: roomId,
            contentId: count,
            content: `当前时间:${getTime(new Date())},游戏开始！`,
            type: 'DATE',
        })
        let result = await ctx.model.Content.find({
            contentId: {
                $gte: count
            },
            roomId: roomId
        }).populate(['userId', 'to'])
        nsp.to(roomId).emit('chat', result);
        nsp.to(roomId).emit('update', '更新房间信息啦');
        return {
            msg: 'success'
        }
    }
    // 选词
    async pickWord(roomId, word) {
        const { ctx, app } = this;
        const nsp = app.io.of('/');
        let room = await ctx.model.Room.findOne({ roomId });
        room.startTime = new Date();
        room.keyWord = word;
        room.status = 'PLAYING'
        await room.save();
        nsp.to(roomId).emit('update', '更新房间信息啦');
        return {
            msg: 'success'
        }
    }
    // 获取发言
    async getContents(roomId) {
        const { ctx } = this;
        let result = await ctx.model.Content.find({
            roomId,
        }).populate(['userId', 'to'])

        return result;
    }

    // 发言/提问
    async pushContent(message = {}) {
        const { ctx, app } = this;
        const mongoose = app.mongoose
        let userId = mongoose.Types.ObjectId(message.userId);
        let count = await ctx.model.Content.count({ roomId: message.roomId })
        await ctx.model.Content.create({
            roomId: message.roomId,
            contentId: count,
            content: message.content,
            type: message.type,
            userId,
        })
        if (count % 10 === 0) {
            await ctx.model.Content.create({
                roomId: message.roomId,
                contentId: count + 1,
                content: getTime(new Date()),
                type: 'DATE',
            })
        }
        let result = await ctx.model.Content.find({
            contentId: {
                $gte: count
            },
            roomId: message.roomId
        }).populate(['userId', 'to'])
        return result;
    }
    // 回答
    async answerQuest(query) {
        const { ctx, app } = this;
        const nsp = app.io.of('/');
        if (answer === null) {
            return {
                msg: 'fail'
            }
        }
        let { contentId, roomId, answer } = query
        let content = await ctx.model.Content.findOne({ roomId, contentId })
        console.log(contentId, roomId, answer)
        content.answer = (['YES', 'NO', 'MAYBE', 'CLOSED', 'UNCLOSED', 'RIGHT'])[answer]
        await content.save();
        nsp.to(roomId).emit('updateAnswer', content);
        //是否问题用完进入狼刀阶段
        if (['0', '1'].includes(answer)) {
            let countYesNo = await ctx.model.Content.count({
                roomId,
                answer: {
                    $in: ['YES', 'NO']
                }
            })
            console.log(countYesNo)
            // 是否问题达到36个
            if (countYesNo > 35) {
                await this.updateRoomStatus(roomId, false);
                await this.updateEvent(roomId, 'voteTimeOver', 5);

            }

        }
        // 答对了直接进入投票阶段

        if (answer == 5) {
            console.log('答对了')
            await this.updateRoomStatus(roomId, true);
            // 从redis中取出事件队列中的事件
            await this.updateEvent(roomId, 'voteTimeOver', 5);
        }
        return {
            msg: 'success'
        }
    }
    async updateEvent(roomId, event, mins = 5) {
        const { ctx, app } = this;
        let wolfEvents = await app.redis.get('wolfEvents')
        wolfEvents = JSON.parse(wolfEvents || '[]')
        let index = wolfEvents.findIndex(e => e.roomId == roomId)
        wolfEvents.splice(index, 1, {
            roomId,
            timestamp: new Date().getTime() + mins * 60 * 1000,
            event: event
        })
        await app.redis.set('wolfEvents', JSON.stringify(wolfEvents));
    }
    async updateRoomStatus(roomId, getAnswer) {
        const { ctx, app } = this;
        const nsp = app.io.of('/');
        // 更新房间状态
        await ctx.model.Room.update({ roomId }, {
            $set: {
                status: 'VOTEING',
                getAnswer: getAnswer
            }
        })
        // 更新
        let count = await ctx.model.Content.count({ roomId: roomId })
        await ctx.model.Content.create({
            roomId: roomId,
            contentId: count,
            content: `当前时间:${getTime(new Date())},进入${getAnswer ? '狼刀' : '投票'}时间！`,
            type: 'DATE',
        })
        let result = await ctx.model.Content.find({
            contentId: {
                $gte: count
            },
            roomId: roomId
        }).populate(['userId', 'to'])
        nsp.to(roomId).emit('chat', result);
        nsp.to(roomId).emit('update', '更新房间信息');
    }
    // 投票
    async pushVote({ roomId, from, to }) {
        const { ctx, app } = this;
        const nsp = app.io.of('/');
        const mongoose = app.mongoose
        from = mongoose.Types.ObjectId(from);
        to = mongoose.Types.ObjectId(to);
        let room = await ctx.model.Room.findOne({ roomId: roomId })
        room.votes.push({
            from, to
        })
        await room.save();
        let count = await ctx.model.Content.count({ roomId: roomId })
        let flag = false;
        let winerText = '';
        // 回答正确的情况下投票完成
        if (room.getAnswer && room.votes.length >= room.wolf.length) {
            let MaxVoters = getMaxVoter(room.votes, 'to');
            winerText = MaxVoters.includes(room.prophet.toString()) ? '狼人获胜' : '好人获胜'
            flag = true;
        }
        // 超过时间的情况下投票完成
        if (!room.getAnswer && room.votes.length >= room.openIds.length) {
            let MaxVoters = getMaxVoter(room.votes);
            winerText = room.wolf.findIndex(w => MaxVoters.includes(w.toString())) == -1 ? '狼人获胜' : '好人获胜'
            flag = true;
        }
        if (flag) {

            // 更新房间状态
            await ctx.model.Room.update({
                roomId: roomId
            }, {
                $set: {
                    status: 'FINISH'
                }
            })
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

            await ctx.model.Content.create({
                roomId: roomId,
                contentId: count + room.votes.length,
                content: `当前时间:${getTime(new Date())},游戏结束,${winerText}！`,
                type: 'DATE',
            })
            let result = await ctx.model.Content.find({
                contentId: {
                    $gte: count
                },
                roomId: roomId
            }).populate(['userId', 'to'])
            nsp.to(roomId).emit('chat', result);
            nsp.to(roomId).emit('update', result);
            // 把事件清空
            let wolfEvents = await app.redis.get('wolfEvents')
            wolfEvents = JSON.parse(wolfEvents || '[]')
            let index = wolfEvents.findIndex(e => e.roomId == roomId)
            wolfEvents.splice(index, 1)
            await app.redis.set('wolfEvents', JSON.stringify(wolfEvents));
        }

        return room;
    }
}

const getTime = (date) => {
    let hour = `0${date.getHours()}`.substr(-2);
    let mins = `0${date.getMinutes()}`.substr(-2);
    let sec = date.getSeconds();
    let milli = date.getMilliseconds();
    return `${hour}:${mins}`;
}
function getRandomArrayElements(arr, count) {
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
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
module.exports = RoomService;
