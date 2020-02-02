'use strict';

const Controller = require('egg').Controller;

class NspController extends Controller {
  async exchange() {
    const { ctx, app } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    const socket = ctx.socket;
    const client = socket.id;

    try {
      const { target, payload, room } = message;
      console.log(socket.handshake.query.room)

      if (!target) return;
      // const msg = ctx.helper.parseMsg('exchange', payload, { client, target });
      nsp.to(room).emit('online', 'test');

      // nsp.adapter.remoteDisconnect(target, true, err => {
      //   console.log('error')
      // });
    } catch (error) {
      app.logger.error(error);
    }
  }
  async chat() {
    const { ctx, app } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    const socket = ctx.socket;
    const client = socket.id;

    try {
      let room = socket.handshake.query.room
      let contents = await ctx.service.room.pushContent(message)
      nsp.to(room).emit('chat', contents);
    } catch (error) {
      app.logger.error(error);
    }
  }
  async kick() {
    const { ctx, app } = this;
    const nsp = app.io.of('/');
    const userId = ctx.args[0] || {};
    const socket = ctx.socket;
    const client = socket.id;
    try {
      let roomId = socket.handshake.query.room
      // let clients = await getClients(nsp, roomId)
      // console.log(roomId, userId, clients)
      await ctx.service.room.kickRoom(roomId, userId)
      nsp.to(roomId).emit('update', '更新房间信息啦');
    } catch (error) {
      app.logger.error(error);
    }
  }

}

function getClients(nsp, room) {
  return new Promise((resolve, reject) => {
    nsp.adapter.clients([room], (err, clients) => {
      if (err) {
        reject(err)
      }
      resolve(clients)
    })
  })
}

module.exports = NspController;
