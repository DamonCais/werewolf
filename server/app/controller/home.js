'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    await this.ctx.render('home');
  }
  async room1() {
    await this.ctx.render('room1');
  }
  async room2() {
    await this.ctx.render('room2');
  }
  async code2session() {
    const { ctx } = this;

    let userInfo = ctx.request.body
    let data = {
      appid: 'wx7f66aa436358e198',
      secret: 'bc01500bf39136b885baa9ec2147875c',
      js_code: userInfo.js_code,
      grant_type: 'authorization_code'
    }
    const result = await ctx.curl('https://api.weixin.qq.com/sns/jscode2session', {
      method: 'get',
      data: data,
      dataType: 'json',
      contentType: 'json',
    })
    console.log(result.data)
    let { openid } = result.data
    userInfo.openId = openid
    let user = await ctx.service.room.updateUserInfo(userInfo)
    ctx.body = user;
  }

}

module.exports = HomeController;
