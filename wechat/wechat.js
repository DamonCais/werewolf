const Wechat = require('wechat4u')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
let bot
/**
 * 尝试获取本地登录数据，免扫码
 * 这里演示从本地文件中获取数据
 */
try {
    bot = new Wechat(require('./sync-data.json'))
} catch (e) {
    bot = new Wechat()
}

/**
 * 启动机器人
 */
if (bot.PROP.uin) {
    // 存在登录数据时，可以随时调用restart进行重启
    bot.restart()
} else {
    bot.start()
}

/**
* uuid事件，参数为uuid，根据uuid生成二维码
*/
bot.on('uuid', uuid => {
    qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
        small: true
    })
    console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
})

/**
 * 登录成功事件
 */
bot.on('login', () => {
    console.log('登录成功')
    // 保存数据，将数据序列化之后保存到任意位置
    fs.writeFileSync('./sync-data.json', JSON.stringify(bot.botData))
})


/**
* 联系人更新事件，参数为被更新的联系人列表
*/
bot.on('contacts-updated', contacts => {
    console.log(contacts)
    console.log('联系人数量：', Object.keys(bot.contacts).length)
})

/**
* 错误事件，参数一般为Error对象
*/
bot.on('error', err => {
    console.error('错误：', err)
})
/**
 * 
* 如何发送消息
*/

bot.on('login', () => {
    /**
     * 演示发送消息到文件传输助手
     * 通常回复消息时可以用 msg.FromUserName
     */
    let ToUserName = 'filehelper'

    /**
     * 发送文本消息，可以包含emoji(😒)和QQ表情([坏笑])
     */
    bot.sendMsg('发送文本消息，可以包含emoji(😒)和QQ表情([坏笑])', ToUserName)
        .catch(err => {
            bot.emit('error', err)
        })


})

/**
 * 如何处理会话消息
 */
bot.on('message', msg => {
    /**
     * 获取消息时间
     */
    console.log(`----------${msg.getDisplayTime()}----------`)
    /**
     * 获取消息发送者的显示名
     */
    console.log(bot.contacts[msg.FromUserName].getDisplayName())
    /**
     * 判断消息类型
     */
    console.log(msg.Content)
})