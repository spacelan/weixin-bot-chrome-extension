'use strict';
import 'babel-polyfill';
import Wechat from 'wechat4u';

class WxBot extends Wechat {

  constructor() {
    super();
    this.on('login', () => {
      setTimeout(() => {
        this.openTimes = 0;
        this.on('text-message', msg => {
          setTimeout(() => {
            this._botReply(msg);
          }, 1000);
        });
        this.on('mobile-open', () => this._botSupervise());
      }, 1000);
    });
    setInterval(() => {
      this.replyFlag = false;
    }, 2000);
  }

  getUsersList() {
    if (!this.members)
      this._getUsersList();
    return this.members;
  }

  _getUsersList() {
    let members = {};
    this.groupList.forEach(member => {
      members[member['UserName']] = {
        username: member['UserName'],
        nickname: '群聊: ' + member['NickName'],
        options: []
      };
    });

    this.contactList.forEach(member => {
      members[member['UserName']] = {
        username: member['UserName'],
        nickname: member['RemarkName'] ? member['RemarkName'] : member['NickName'],
        options: []
      };
    });
    this.members = members;
  }

  _tuning(word) {
    let params = {
      'key': '2ba083ae9f0016664dfb7ed80ba4ffa0',
      'info': word
    };
    return this.request({
      method: 'GET',
      url: 'http://www.tuling123.com/openapi/api',
      params: params
    }).then(res => {
      const data = res.data;
      if (data.code == 100000) {
        return data.text; // + '[微信机器人]';
      }
      throw new Error('tuning返回值code错误', data);
    }).catch(err => {
      console.log(err);
      return '现在思路很乱，最好联系下我哥 T_T...';
    });
  }

  _botReply(msg) {
    if (this.replyFlag)
      return;
    this.replyFlag = true;
    if (this.members[msg.FromUserName].options.indexOf('reply') > -1) {
      this._tuning(msg.Content).then((reply) => {
        this.sendMsg(reply, msg.FromUserName);
        console.log(reply);
      });
    }
  }

  _botSupervise() {
    const message = '我的主人玩微信' + ++this.openTimes + '次啦！';
    for (let username in this.members) {
      if (this.members[username].options.indexOf('supervise') > -1) {
        this.sendMsg(message, username);
        console.log(message);
      }
    }
  }
}

let bot = null;
window.getBot = () => {
  if (!bot)
    bot = new WxBot();
  return bot;
};
window.newBot = () => {
  bot = null;
  return window.getBot();
};
window.getWxState = () => {
  return Wechat.STATE;
};
