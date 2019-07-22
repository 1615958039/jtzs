// pages/tools/imglist/imglist.js
Page({
 
  /**
   * 页面的初始数据
   */ 
  data: {
    isload: false,
    data:[],
    foot: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.index();
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

  //加载图片列表
  index(id) {
    id = parseInt(id);
    let that = this;
    let keyword = that.data.keyword + "";
    that.setData({ isload: true });//开启UI加载框
    if (id == 0) { id = 1 }
    /* 这里写http请求获取data */
    

    wx.getStorage({
      key: 'users_token',
      success(rt) {
        wx.request({
          url: 'https://520i.net/api.php?type=get_img_template',
          data: {
            session_id: rt.data,
            page_id: id
          },
          method: "post",
          dataType: "json",
          success(res) {
            if (res.data.code == 1) {
              that.setData({
                data: res.data
              });
              that.page_go();
              that.setData({ isload: false });
            }
          },
          fail() {
            wx.showToast({
              title: '无网络，请返回重试',
              icon: "none",
              duration: 3000
            })
          }
        })
      }
    });
  },


  //翻页器点击事件
  foot(res) {
    let that = this;
    let id = res.currentTarget.dataset.do;
    let now = parseInt(that.data.data.pagenow);
    let max = parseInt(that.data.data.pagemax);
    if (id == 'sta') {
      if (now == 1) { return 0; }
      that.index(1);
    } else if (id == 'up') {
      if (now == 1) { return 0; }
      that.index(now - 1);
    } else if (id == "dw") {
      if (now == max) { return 0; }
      that.index(now + 1);
    } else if (id == "end") {
      if (now == max) { return 0; }
      that.index(max);
    } else {
      that.index(id);
    }
  },


  //分页器，自动配置当前data
  page_go() {
    let that = this;
    let id = parseInt(that.data.data.pagenow);
    let max = parseInt(that.data.data.pagemax);
    let foot = [];
    let x = 0;
    let n = -2;
    let m = 2;
    if (id == 1) {
      n = 0;
      m = 4;
    } else if (id == 2) {
      n = -1;
      m = 3;
    } else if (id == (max - 1)) {
      n = -3;
      m = 1;
    } else if (id == max) {
      n = -4;
      m = 0;
    }
    while (n <= m) {
      x = id + n;
      if (x < 1 || x > max) {
      } else {
        foot.push(x);
      }
      n = n + 1;
    }
    that.setData({
      foot: foot
    });
  },


  //普通图片跳转到作图页面
  uigo(res) {
    let id = res.currentTarget.id;
    wx.navigateTo({
      url: 'imgshop/imgshop?type=&url=' + id
    });
  },
  //唤醒相机选择图片到作图页面
  uigo_ca(){
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
        wx.navigateTo({
          url: 'imgshop/imgshop?type=ca&url=' + res.tempFilePaths
        });
      }
    });
  }

})