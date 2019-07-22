Page({
  /**
   * 页面的初始数据
   */
  data: {
    
    imginfo: [],
    title:'',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.showLoading({ title: '加载中...', mask: true });
    wx.getStorage({
      key: 'users_token',
      success(rt) {
        wx.request({
          url: 'https://520i.net/api.php?type=get_need_sh&session_id=' + rt.data,
          method: "get",
          dataType: "json",
          success(res) {
            if (res.data.code == 1) {
              that.setData({
                imginfo: res.data.data,
                title: res.data.data.title
              });
              wx.hideLoading();
            } else {
              wx.showToast({
                title: res.data.message+"",
                icon: "none",
                mask:true,
                duration: 3000
              });
            }
          },
          fail() {
            wx.showToast({
              title: '获取详情失败！请返回重试',
              mask: true,
              icon: "none",
              duration: 3000
            })
          }
        })
      }
    });




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
    return 0;
  },

  //查看图片
  seeimg() {
    let that = this;
    wx.previewImage({
      current: that.data.imginfo.url,
      urls: [that.data.imginfo.url],
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },


  //输入框的输入事件
  onChange(res){
    this.setData({
      title : res.detail
    })
  },

  // 表情包违规提交
  sh_no(){
    let that = this;
    wx.showLoading({
      title: '提交中...',
      mask:true
    });
    wx.getStorage({
      key: 'users_token',
      success(rt) {
        wx.request({
          url: 'https://520i.net/api.php?type=add_sh_no',
          method: "post",
          data:{
            session_id: rt.data,
            id:that.data.imginfo.id
          },
          success(res) {
            if (res.data.code == 1) {
              wx.hideLoading();
              wx.showModal({
                title: '提交成功',
                content: '已删除该违规表情，是否继续审核下一张?',
                success(res) {
                  if (res.confirm) {
                    that.onLoad();
                  }else{
                    wx.navigateBack({ delta: 1 })
                  }
                },
                fail(){
                  wx.navigateBack({ delta: 1 })
                }
              });
            }else{
              wx.showToast({
                title: res.data.message+"",
                icon: "none",
                mask: true,
                duration: 3000
              });
              wx.hideLoading();
            }

          },
          fail() {
            wx.showToast({
              title: '无网络链接',
              icon: "none",
              mask:true,
              duration: 30000
            })
            wx.hideLoading()
          }
        })
        
      }
    })
  },

  // 表情发布规提交
  sh_yes() {
    let that = this;
    wx.showLoading({
      title: '提交中...',
      mask: true
    });
    wx.getStorage({
      key: 'users_token',
      success(rt) {
        wx.request({
          url: 'https://520i.net/api.php?type=add_sh_yes',
          method: "post",
          data: {
            session_id: rt.data,
            id: that.data.imginfo.id,
            title:that.data.title
          },
          success(res) {
            if (res.data.code == 1) {
              wx.hideLoading();
              wx.showModal({
                title: '提交成功',
                content: '已发布该表情包，是否继续审核下一张?',
                success(res) {
                  if (res.confirm) {
                    that.onLoad();
                  } else{
                    wx.navigateBack({ delta: 1 })
                  }
                },
                fail(){
                  wx.navigateBack({ delta: 1 })
                }
              });
            } else {
              wx.showToast({
                title: res.data.message,
                icon: "none",
                mask: true,
                duration: 3000
              });
              wx.hideLoading();
            }

          },
          fail() {
            wx.showToast({
              title: '无网络链接',
              icon: "none",
              mask: true,
              duration: 30000
            })
            wx.hideLoading()
          }
        })

      }
    })
  },

})