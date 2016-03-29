'use strict';
import "babel-polyfill";
import Vue from 'vue';
window.Vue = Vue;
window.$vm = new Vue({
  el: '#app',
  data: {
    page: '',
    members: [],
    filerName: ''
  },
  methods: {
    login() {
        this.page = 'scan';
        let bot = this.bgp.newBot();
        bot.on('scan', () => {
          this.page = 'confirm';
        });
        bot.on('confirm', () => {
          this.page = 'login';
        });
        bot.on('login', () => {
          this.showMemberList();
        });
        bot.on('logout', () => {
          this.logout();
        });
        bot.on('error', err => {
          console.log(err);
        });
        bot.getUUID()
          .then(uuid => {
            $(this.$els.qr)
              .empty()
              .qrcode({
                text: `https://login.weixin.qq.com/l/${uuid}`,
                width: 200,
                height: 200
              })
              .find('canvas:first')
              .addClass('am-center');

            return bot.start();
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
        let bot = this.bgp.getBot();
        bot.logout()
          .then(() => {
            this.login();
          })
          .catch(err => {
            this.page.error = 'error';
            console.log(err);
            setTimeout(() => {
              this.login();
            }, 2000);
          });
      },
      showMemberList() {
        this.page = 'list';
        let bot = this.bgp.getBot();
        this.members = bot.superviseUsersList;
      },
      switchReply(uid) {
        let bot = this.bgp.getBot();
        if (bot.replyUsers.has(uid)) {
          bot.replyUsers.delete(uid);
          console.log('删除自动回复用户', uid);
        } else {
          bot.replyUsers.add(uid);
          console.log('增加自动回复用户', uid);
        }
      },
      switchSupervise(uid) {
        let bot = this.bgp.getBot();
        if (bot.superviseUsers.has(uid)) {
          bot.superviseUsers.delete(uid);
          console.log('删除监督用户', uid);
        } else {
          bot.superviseUsers.add(uid);
          console.log('增加监督用户', uid);
        }
      },
      initList() {
        $(this.$els.list).find('input').bootstrapSwitch();
        $(this.$els.list).find('input').on('switchChange.bootstrapSwitch', event => {
          let uid = $(event.target).attr('uid');
          this.switchSupervise(uid);
        });
      }
  },
  created() {
    this.bgp = chrome.extension.getBackgroundPage();
    let bot = this.bgp.getBot();
    if (bot.state == this.bgp.getWxState().login) {
      this.showMemberList();
    } else {
      this.login();
    }
  },
  watch: {
    page(val) {
        console.log(val);
        if (val == 'list') {
          setTimeout(() => {
            this.initList();
          }, 0)
        }
      },
      filerName(val) {
        console.log(val);
        this.initList();
      }
  }
});
