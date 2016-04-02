'use strict';
import 'babel-polyfill';
import Vue from 'vue';
window.Vue = Vue;

Vue.directive('selected', {
  twoWay: true,
  bind() {
    $(this.el).selected({
      btnWidth: '100px',
      //btnStyle: 'primary',
      //maxHeight: '100px',
      btnSize: 'sm'
    }).change(event => {
      let val = $(event.target).val();
      this.set(val);
    });
  }
});

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
      }
  },
  created() {
    this.bgp = chrome.extension.getBackgroundPage();
    /*this.members = {
      a: {
        username: 'a',
        nickname: 'aa',
        options: ['reply']
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
      },
      filterName(val) {
        console.log(val);
      }
  }
});
