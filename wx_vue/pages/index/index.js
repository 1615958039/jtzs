var app = getApp();
Page({
  /**
   * 页面的初始数据
   */  
  data: {
    search_keywords:'',
    isload: false,
    img_list:[],

    one_onshow:false



  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;

    setTimeout(function () {
      that.setData({
        one_onshow: true
      })
    }, 5000);
    
    that.setData({ isload: true });  //载入开始
    that.get_data();
    
    

    

    
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
    if (this.data.one_onshow == true) {
      this.get_data();
    }
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


  uigo(res){
    /* 跳转到图片详情页面 */
    let id = res.currentTarget.id;
    wx.navigateTo({
      url:'search/imginfo/imginfo?id='+id
    });
  },


  onSearch(res){
    let keyword = res.detail;
    wx.navigateTo({
      url: 'search/search?keyword=' + keyword
    });
  },

  uigo_more(){
    wx.navigateTo({
      url: 'search/search'
    });
  },

  get_data(){
    let that = this;
    wx.getStorage({
      key: 'users_token',
      success(rt) {
        if (rt.data == "") {
          setTimeout(function () {
            that.get_data();
          }, 300);
        } else {
          wx.request({
            url: 'https://520i.net/api.php?type=index&session_id=' + rt.data,
            method: "get",
            success(res) {
              if(res.data.code == 1){
                that.setData({
                  isload: false,
                  img_list: res.data.imglist
                });
              }else if(res.data.code == -1){
                app.dologin();
                setTimeout(function(){
                  that.onLoad();
                },2000);
              }else{
                wx.showToast({
                  title: res.data.message+"",
                  icon: "none",
                  duration: 5000
                });
              }
            },
            fail() {
              wx.showToast({
                title: '无网络，请重启小程序',
                icon: "none",
                duration: 5000
              })
            }
          })
        }
      },
      fail(){
        setTimeout(function () {
          that.get_data();
        }, 300);
      }
    })

  }
  
})