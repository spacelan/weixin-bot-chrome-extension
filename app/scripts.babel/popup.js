'use strict';
import Vue from 'vue';
window.Vue = Vue;
Vue.config.debug = true;
window.$vm = new Vue({
  el: '#app',
  data: {
    page: '',
    members: []
  },
  methods: {
    login() {
        this.page = 'scan';
        this.bot.getUUID()
          .then(uuid => {
            $(this.$els.qr)
              .empty()
              .qrcode({
                text: `https://login.weixin.qq.com/l/${uuid}`,
                width: 200,
                height: 200,
              })
              .find('canvas:first')
              .addClass('am-center');

            return this.bot.start();
          })
          .catch(err => {
            console.log(err);
            this.page = 'restart';
            setTimeout(() => {
              this.login();
            }, 2000);
          });
      },
      logout() {
        this.bot.logout()
          .then(() => {
            return this.bgp.deleteBot()
          })
          .then(() => {
            this.login()
          })
          .catch(err => {
            console.log(err)
            this.bgp.deleteBot()
          })
      },
      showMemberList() {
        this.members = this.bot.replyUsersList;
        console.log(this.members);
        this.page = 'list';
      },
      switchReply(uid) {
        if (this.bot.replyUsers.has(uid)) {
          this.bot.replyUsers.delete(uid)
          console.log('删除自动回复用户', uid)
        } else {
          this.bot.replyUsers.add(uid)
          console.log('增加自动回复用户', uid)
        }
      },
      switchSupervise(uid) {
        if (this.bot.superviseUsers.has(uid)) {
          this.bot.superviseUsers.delete(uid)
          console.log('删除监督用户', uid)
        } else {
          this.bot.superviseUsers.add(uid)
          console.log('增加监督用户', uid)
        }
      }
  },
  init() {
    this.bgp = chrome.extension.getBackgroundPage();
    this.wxState = this.bgp.getWxState();
    this.bot = this.bgp.getBot();
    this.bot.on('scan', () => {
      this.page = 'confirm';
    });
    this.bot.on('confirm', () => {
      this.page = 'login';
    });
    this.bot.on('login', () => {
      this.showMemberList();
    });
    this.bot.on('logout', () => {
      this.logout();
      this.login();
    });
    this.bot.on('error', err => {
      console.log(err)
    });
  },
  created() {
    if (this.bot.state == this.wxState.login) {
      this.showMemberList();
    } else {
      this.login();
    }
  },
  watch: {
    page(val) {
      console.log(val);
    }
  }
});
