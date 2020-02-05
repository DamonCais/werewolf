'use strict';

const Service = require('egg').Service;
const _ = require('lodash');
const { makeAreaSquares, baseIds } = require('../utils/blokus.js')
class BlokusService extends Service {
    // 创建房间
    async createBlokus(openId) {
        let { ctx } = this;
        let user = await ctx.model.User.findOne({ openId })
        if (!user) {
            return {
                msg: '请重新进入小程序'
            }
        }
        let countSelf = await ctx.model.Blokus.count({
            openIds: { $elemMatch: { $eq: user } },
            status: { $eq: 'NEW' }
        })
        console.log('已创建房间', countSelf)
        if (countSelf >= 2) {
            return {
                msg: '最多只能创建2个房间'
            }
        }
        let count = await ctx.model.Blokus.count()
        let obj = {
            blokusId: `Blokus${count + 1}`,
        }
        let blokus = await ctx.model.Blokus.create(obj);
        blokus.openIds.push(user);
        await blokus.save();
        return blokus
    }
    // 获取房间
    async getBlokus(query = {}) {
        const { ctx } = this;
        if (!query.status) {
            query.status = {
                $ne: "EMPTY"
            }
        }
        let result = await ctx.model.Blokus
            .find(query).populate('openIds');
        return result;
    }
    // 加入房间
    async joinBlokus(blokusId, openId) {
        const { ctx, app } = this;
        const nsp = app.io.of('/');
        let blokus = await ctx.model.Blokus.findOne({ blokusId });
        let user = await ctx.model.User.findOne({ openId: openId })

        if (!blokus) {
            ctx.status = 400;
            return { msg: '请刷新小程序' }
        }
        // NEW时才可以加入房间
        if (blokus && blokus.status == 'NEW' && blokus.openIds && !blokus.openIds.includes(user._id)) {
            blokus.openIds.push(user._id)
        }
        await ctx.model.Blokus.update({ blokusId }, { openIds: blokus.openIds })

        nsp.to(blokusId).emit('update', '更新房间信息啦');
        return {
            msg: 'success'
        };
    }
    // 开始游戏
    async startBlokus(blokusId) {
        const { ctx, app } = this;
        const nsp = app.io.of('/');

        let blokus = await ctx.model.Blokus.findOne({ blokusId });
        // 创建area 创建pieces
        let { openIds } = blokus;
        if (openIds.length < 4) {
            ctx.status = 400
            return {
                msg: '最少4个人'
            }
        }
        let area = makeAreaSquares();
        let score = [];
        blokus.openIds.slice(0, 4).forEach(user => {
            score.push({
                userId: user,
                baseIds: baseIds,
                score: 0,
                canPlay: true
            })

        })
        blokus.currentStep = 1;
        blokus.score = score;
        blokus.currentPlayer = blokus.openIds[0];
        blokus.startTime = new Date();
        blokus.area = area;
        blokus.status = 'PLAYING';
        await blokus.save();

        nsp.to(blokusId).emit('update', '更新房间信息啦');
        return {
            msg: 'success'
        }

    }
    async updateBlokus({ blokusId, userId, area, baseIds, score = 0, canPlay = true }) {
        const { ctx, app } = this;
        const nsp = app.io.of('/');
        const mongoose = app.mongoose
        let blokus = await ctx.model.Blokus.findOne({ blokusId });
        if (blokus.currentPlayer.toString() != userId) {
            return {
                msg: 'fail'
            }
        }
        let index = blokus.score.findIndex(s => s.userId.toString() == userId)
        if (index != -1) {
            baseIds ? blokus.score[index].baseIds = baseIds : '';
            blokus.score[index].score = blokus.score[index].score + score
            blokus.score[index].canPlay = canPlay
        }

        for (let i = 1; i < 5; i++) {
            if (_.get(blokus.score, `${(index + i) % 4}.canPlay`)) {
                blokus.currentPlayer = blokus.score[(index + i) % 4].userId;
                break;
            } else if (i == 4) {
                return {
                    msg: 'gameOver'
                }
            }
        }


        blokus.currentStep++;
        area ? blokus.area = area : '';
        await blokus.save();
        nsp.to(blokusId).emit('update', '更新房间信息啦');
        return {
            msg: 'success'
        }
    }
    async kickBlokus({ blokusId, userId }) {
        const { ctx, app } = this;
        const nsp = app.io.of('/');
        let blokus = await ctx.model.Blokus.findOne({ blokusId });
        if (blokus.status != 'NEW') {
            return {
                msg: 'fail'
            }
        }
        blokus.openIds = blokus.openIds.filter(o => o != userId)

        if (!blokus.openIds.length) {
            blokus.status = 'EMPTY'
        }
        await blokus.save();
        nsp.to(blokusId).emit('update', '更新房间信息啦');

        return {
            msg: 'success'
        };
    }
}


module.exports = BlokusService;
