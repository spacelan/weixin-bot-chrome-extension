'use strict';
import Vue from 'vue';
Vue.config.debug = true;
window.$vm = new Vue({
  el: '#app',
  data: {
    msg: 'Hello Weixin Bot!',
    status: '',
    members: []
  },
  methods: {
    login() {
      this.status = 'init';
      this.bot.$isLogin = false;
      this.bot.getUUID()
        .then(uuid => {
          setTimeout(() => {
            $(this.$els.qr)
              .empty()
              .qrcode({
                text: `https://login.weixin.qq.com/l/${uuid}`,
                width: 200,
                height: 200,
              })
              .find('canvas:first')
              .addClass('am-center');
          }, 0);
          this.status = 'scan';
          return this.bot.checkScan();
        })
        .then(code => {
          if (code != 201)
            throw new Error(code);
          this.status = 'login';
          return this.bot.checkLogin();
        })
        .then(() => this.bot.login())
        .then(() => this.bot.init())
        .then(() => this.bot.notifyMobile())
        .then(() => this.bot.getContact())
        .then(() => {
          this.bot.syncPolling();
          this.bot.$isLogin = true;
          this.getMembers();
        })
        .catch(err => {
          console.log(err);
          this.status = 'timeout';
          setTimeout(() => {
            this.login();
          }, 2000);
        });
    },
    getMembers() {
      this.status = 'list';
      return this.members = this.bot.$getMembers();
    },
    addMember(index, event) {
      this.bot.$members[index].isAdded = true;
      let r = this.bot.switchUser(this.bot.$members[index].username);
      console.log(event);
    },
    logout() {
      this.bot.$logout()
        .then(() => {
          this.bot.$isLogin = false;
          setTimeout(() => {
            this.login();
          }, 1000);
        });
    }
  },
  init() {
    this.bgp = chrome.extension.getBackgroundPage();
    this.bot = this.bgp.getBot();
  },
  created() {
    if (this.bot.$isLogin)
      this.getMembers();
    else
      this.login();
  },
  watch: {
    status(val) {
      console.log(val);
    }
  }
});
