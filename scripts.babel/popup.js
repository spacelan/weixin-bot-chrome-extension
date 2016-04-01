'use strict';
import 'babel-polyfill';
import Vue from 'vue';
window.Vue = Vue;
window.$vm = new Vue({
  el: '#app',
  data: {
    page: '',
    members: [],
    filterName: ''
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
        console.log('logout');
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
        this.members = bot.getUsersList();
      },
      switchUser(uid, val) {
        let bot = this.bgp.getBot();
        if (!bot.members[uid]) {
          console.log('用户不存在');
          return;
        }
        let reply = false;
        let supervise = false;
        val.forEach(v => {
          if (v == 'reply')
            reply = true;
          else if (v == 'supervise')
            supervise = true;
        });
        bot.members[uid].reply = reply;
        bot.members[uid].supervise = supervise;
        console.log(`uid: ${uid}, reply: ${reply}, supervise: ${supervise}`);
      },
      initList() {
        $(this.$els.list).find('select').selected({
          btnWidth: '100px',
          //btnStyle: 'primary',
          //maxHeight: '100px',
          btnSize: 'sm'
        });
        $(this.$els.list).find('select').on('change', event => {
          let val = $(event.target).val();
          let uid = $(event.target).attr('uid');
          this.switchUser(uid, val);
        });
      }
  },
  created() {
    this.bgp = chrome.extension.getBackgroundPage();
    /*this.members = {
      a: {
        username: 'a',
        nickname: 'aa',
        reply: true,
        supervise: false
      }
    };
    this.page = 'list';
    return;*/
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
          }, 0);
        }
      },
      filterName(val) {
        console.log(val);
        this.initList();
      }
  }
});
