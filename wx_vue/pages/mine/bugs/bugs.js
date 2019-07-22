// pages/mine/bugs/bugs.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bugs:'',
    bugs_long:0,

    is_save:false,


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },


  //输入框字数统计
  ipt_change(res){
    let that = this;
    that.setData({
      bugs_long: res.detail.cursor
    });
  },

  //提交，按钮事件
  save(){
    let that = this;
    if(that.data.is_save==false){
      if(that.data.bugs_long<10){
        wx.showModal({
          title: '提交失败',
          content: '请输入不低于10个字的问题描述',
          showCancel: false,
          success(res) {}
        })
        return 0;
      }
      that.setData({ is_save: true });

      /* 这里是request */

      wx.showModal({
        title: '提交成功',
        content: '感谢您对我们的关注和支持，我们会认真处理您的反馈，尽快修复和完善相关功能',
        showCancel:false,
        success(res) {
          //关闭当前页面
          wx.navigateBack({
            delta: 1
          })
        }
      })
      

    }
  }
})