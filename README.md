1.狼人猜词是在2020年假宅家无聊时写的一个简单的聊天游戏小程序。旨在学习eggjs以及wepy2.0的新语法，代码粗糙，没有过多的参考价值。
2.后台部分主要是学习了下eggjs的使用方法，是在egg-socket的demo基础上开发的，数据库采用的mongodb，因对mongoose不熟练所以服务端代码写得较为糟糕。
3.换工作后有半年没有写过小程序了，重看wepy文档时发现已经更新到了2.0，所以利用这个简单的小程序去学习了下它的新特性,UI库沿用了比较喜欢的Color-ui，小程序目前在申请中,不知道能不能过审。
4.服务器用的阿里云最便宜的轻量服务器，ssl证书啥的都是免费的。其中的nginx配置是参考的egg-socket的文档。
5.因为是一个流程相关的猜词游戏。为了实现定时更新，我实现的步骤是：通过往 redis中添加定时任务，
包含任务类型、时间戳。通过egg的定时任务，每10S从redis中获取任务队列，发现到时间执行的时候取出来执行。(不知道这种方案是不是游戏服务器的常用方案,或仅仅是我异想天开的做法)
6.下一个目标，把吸血鬼盛宴加入其中！如果你碰巧看到这篇文章且对游戏类后台有过研究,不妨给我点提示，感激不尽。
