var app = getApp();
 
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    userdata:{
      name:'加载中',
      signtext:"还在加载中哦~",
      jf:0,
      have_love:0,
      love:0
    },
    


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (){
    let that = this;
    wx.getStorage({
      key: 'users_token',
      success(rt) {
        wx.request({
          url: 'https://520i.net/api.php?type=mine',
          data: {
            session_id: rt.data
          },
          method: "post",
          success(res) {
            if (res.data.code == 1) {
              that.setData({
                userdata: res.data
              })
            }
          },
          fail() {
            wx.showToast({
              title: '无网络，请重启小程序',
              icon: "none",
              mask: true,
              duration: 3000
            })
          }
        })
      }
    })


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (){
    let that = this;
    wx.getStorage({
      key: 'users_token',
      success(rt) {
        wx.request({
          url: 'https://520i.net/api.php?type=mine',
          data: {
            session_id: rt.data
          },
          method: "post",
          success(res) {
            if (res.data.code == 1) {
              that.setData({
                userdata: res.data
              });
            }
          }
        })
      }
    })
  },
  /*
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /*
    用户点击右上角分享

  */
  onShareAppMessage: function(){

  },

  //跳转页面__喜欢
  uigo_like(){
    wx.navigateTo({
      url: 'like/like'
    });
  },
  
  go_userinfo(){
    wx.navigateTo({
      url: 'userinfo/userinfo?img=' + this.data.userdata.img + "&name=" + this.data.userdata.name + "&signtext=" + this.data.userdata.signtext
    });
  },

  //查看头像大图
  see_img(){
    let that = this;
    wx.previewImage({
      current: that.data.userdata.img,
      urls: [that.data.userdata.img],
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {},
    })
  },

  //跳转 - 意见反馈
  uigo_bugs(){
    wx.navigateTo({
      url: "bugs/bugs"
    });
  },

  //跳转 - 我的作品
  uigo_myup(){
    wx.navigateTo({
      url: 'myup/myup',
    })
  },

  
  //跳转页面 根据data-url
  uigo(res){
    wx.navigateTo({
      url: res.currentTarget.dataset.url
    });
  },
  
  //赞赏码
  zs(){
    
    wx.previewImage({
      urls: ['https://520i.net/zsm.jpg']
    })
  }


  

})