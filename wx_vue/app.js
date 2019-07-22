App({
  //app启动事件 
  // jie
  onLaunch: function () {


    let that = this;
    wx.checkSession({
      success() {

        wx.getStorage({
          key: 'users_token',
          success(res) {
            if (res.data == '' || res.data == null) {
              that.dologin();
            } else {
              // 登陆状态可用
              



            }
          },
          fail() {
            that.dologin();
          }
        })
      },
      fail() {
        that.dologin();
      }
    })


    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            })
          })
        }
      })
    }


  },


  // 用wxid登陆账号
  dologin: function () {
    let that = this;
    wx.login({
      success: function (res) {
        wx.request({
          url: 'https://520i.net/api.php?type=login',
          method: "post",
          data: { code: res.code },
          success(res) {
            if (res.data.code == 1) {
              //登陆成功，把users_token写入storage和全局变量
              wx.setStorage({
                key: 'users_token',
                data: res.data.users_token
              });
              that.globalData.users_token = res.data.users_token;
            } else {
              //登陆异常处理
              wx.showToast({
                title: "登陆失败!请重启小程序再试",
                icon: "none",
                duration: 5000
              });
            }
          }
        })
      },
      fail: function (res) {
        //访问接口异常
        wx.showToast({
          title: "自动登陆失败！",
          icon: "none",
          duration: 5000
        });
      }
    })

  },

  // 404 跳转去首页
  onPageNotFound(res){
    wx.switchTab({
      url: 'pages/index/index'
    })
  },

  // 全局变量
  globalData: {
    users_token: ''
  }
})