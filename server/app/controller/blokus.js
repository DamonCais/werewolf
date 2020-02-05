'use strict';

const Controller = require('egg').Controller;

class BlokusController extends Controller {

    // 创建房间
    async createBlokus() {
        const { ctx } = this;
        let { openId } = ctx.request.body
        let result = await ctx.service.blokus.createBlokus(openId);
        ctx.body = result;
    }
    // 获取房间
    async getBlokus() {
        const { ctx } = this;
        let result = await ctx.service.blokus.getBlokus(ctx.request.body);
        ctx.body = result;
    }
    // 加入房间
    async joinBlokus() {
        const { ctx } = this;
        let { blokusId, openId } = ctx.request.body
        if (!openId || !blokusId) {
            return {
                msg: '请重新进入小程序'
            }
        }
        let result = await ctx.service.blokus.joinBlokus(blokusId, openId);
        ctx.body = result;
    }
    // 开始游戏
    async startBlokus() {
        const { ctx } = this;
        let { blokusId } = ctx.request.body
        let result = await ctx.service.blokus.startBlokus(blokusId);
        ctx.body = result;
    }
    // 提交游戏
    async updateBlokus() {
        const { ctx } = this;
        let { blokusId, userId, area, baseIds, score, canPlay } = ctx.request.body
        let result = await ctx.service.blokus.updateBlokus({ blokusId, userId, area, baseIds, score, canPlay });
        ctx.body = result;
    }
    // kickBlokus
    async kickBlokus() {
        const { ctx } = this;
        let { blokusId, userId, } = ctx.request.body
        let result = await ctx.service.blokus.kickBlokus({ blokusId, userId });
        ctx.body = result;
    }

}

module.exports = BlokusController;
