'use strict';
import Vue from 'vue';
import qr from 'qr-image';
Vue.config.debug = true;
window.$vm = new Vue({
  el: '#app',
  data: {
    msg: 'Hello WeChat Bot!',
    qr64: '',
    status: '',
    members: []
  },
  methods: {
    newBot() {
      this.status = 'scan';
      this.bgp.newInstance()
        .then(uuid => {
          this.qr64 = 'data:image/png;base64,' + qr.imageSync(`https://login.weixin.qq.com/l/${uuid}`, {
            type: 'png'
          }).toString('base64');
          return this.bgp.checkScan();
        })
        .then(code => {
          if (code != 201)
            throw new Error(code);
          this.status = 'login';
          return this.bgp.checkLogin();
        })
        .then(code => {
          if (code != 200)
            throw new Error(code);
          this.status = 'list';
          return this.bgp.getMembers();
        })
        .then(members => {
          console.log(members);
          this.members = members;
          return null;
        })
        .catch(err => {
          console.log(err);
          this.status = 'timeout';
          setTimeout(this.newBot, 1000);
        });
    },
    getMembers() {
      this.status = 'list';
      this.members = this.bgp.getMembers();
    },
    addMember(username, event) {
      let r = this.bgp.addMember(username);
      console.log(event);
    },
    logout() {
      this.bgp.logout();
      setTimeout(this.newBot, 1000);
    }
  },
  init() {
    this.bgp = chrome.extension.getBackgroundPage();
  },
  created() {
    if (!this.bgp.isLogin)
      this.newBot();
    else
      this.getMembers();
  },
  watch: {
    status(val) {
      console.log(val);
    }
  }
});
