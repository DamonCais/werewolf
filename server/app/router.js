'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app;
  router.get('/', controller.home.index);
  router.get('/room1', controller.home.room1);
  router.get('/room2', controller.home.room2);
  router.post('/code2session', controller.home.code2session);
  router.get('/createRoom', controller.room.createRoom);
  router.post('/getRooms', controller.room.getRooms);
  router.post('/joinRoom', controller.room.joinRoom);
  router.get('/updateUserInfo', controller.room.updateUserInfo);
  router.get('/getContents', controller.room.getContents);
  router.get('/startGame', controller.room.startGame);
  router.get('/pickWord', controller.room.pickWord);
  router.get('/answerQuest', controller.room.answerQuest);
  router.get('/pushVote', controller.room.pushVote);

  // 角斗士
  router.post('/createBlokus', controller.blokus.createBlokus);
  router.post('/getBlokus', controller.blokus.getBlokus);
  router.post('/joinBlokus', controller.blokus.joinBlokus);
  router.post('/startBlokus', controller.blokus.startBlokus);
  router.post('/updateBlokus', controller.blokus.updateBlokus);
  router.post('/kickBlokus', controller.blokus.kickBlokus);
  // socket.io
  io.of('/').route('exchange', io.controller.nsp.exchange);
  io.of('/').route('chat', io.controller.nsp.chat);
  io.of('/').route('kick', io.controller.nsp.kick);
};
