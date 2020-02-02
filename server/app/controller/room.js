'use strict';

const Controller = require('egg').Controller;

class RoomController extends Controller {
    // 更新用户信息
    async updateUserInfo() {
        const { ctx } = this;
        let userInfo = ctx.query
        let result = await ctx.service.room.updateUserInfo(userInfo);
        ctx.body = result;
    }
    // 创建房间
    async createRoom() {
        const { ctx } = this;
        let { openId } = ctx.query

        let result = await ctx.service.room.createRoom(openId);
        ctx.body = result;
    }
    // 获取房间
    async getRooms() {
        const { ctx } = this;
        let result = await ctx.service.room.getRooms(ctx.request.body);
        ctx.body = result;
    }
    // 加入房间
    async joinRoom() {
        const { ctx } = this;
        let { roomId, openId } = ctx.request.body
        if (!openId || !roomId) {
            return {
                msg: '请重新进入小程序'
            }
        }
        let result = await ctx.service.room.joinRoom(roomId, openId);
        ctx.body = result;
    }
    // 开始游戏
    async startGame() {
        const { ctx } = this;
        let { roomId, openId, playTime, voteTime } = ctx.query
        let result = await ctx.service.room.startGame({ roomId, playTime, voteTime });
        ctx.body = result;
    }
    // 选词
    async pickWord() {
        const { ctx } = this;
        let { roomId, word } = ctx.query
        let result = await ctx.service.room.pickWord(roomId, word);
        ctx.body = result;
    }
    // 获取发言
    async getContents() {
        const { ctx } = this;
        let { roomId, openId } = ctx.query
        let result = await ctx.service.room.getContents(roomId);
        ctx.body = result;
    }

    // 投票
    async pushVote() {
        const { ctx } = this;
        let { roomId, from, to } = ctx.query
        let result = await ctx.service.room.pushVote({ roomId, from, to });
        ctx.body = result;
    }
    // 回答
    async answerQuest() {
        const { ctx } = this;
        let result = await ctx.service.room.answerQuest(ctx.query);
        ctx.body = result;

    }

}

module.exports = RoomController;
