Page({
  /**
   * 页面的初始数据
   */
  data: {

    iconList: [
      {
        icon: 'picfill',
        color: 'purple',
        badge: 0, //图标右上角小红点
        name: '自制表情包',
        uigo: "imglist/imglist",
      }, {
        icon: 'font',
        color: 'blue',
        badge: 0,
        name: '特殊文字制作',
        uigo: "text/text"
      }, 
    
    ],

    
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
    let that = this;
    wx.getStorage({
      key: 'users_token',
      success(rt) {
        wx.request({
          url: 'https://520i.net/api.php?type=get_need_sh',
          data: {
            session_id: rt.data
          },
          method: "post",
          dataType: "json",
          success(res) {
            if (res.data.code == 1 || res.data.code == 2) {
              that.setData({
                iconList : that.data.iconList.concat([{
                  icon: 'post',
                  color: 'red',
                  badge: 0,
                  name: '表情包审核',
                  uigo: "go_sh"
                }])
              })
            }
          }
        })
      }
    });
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

  click(res){
    let url = res.currentTarget.dataset.url;
    
    if(url=="go_sh"){
      //表情包审核页面
      wx.getStorage({
        key: 'users_token',
        success(rt) {
          wx.request({
            url: 'https://520i.net/api.php?type=get_need_sh',
            data: {
              session_id: rt.data
            },
            method: "post",
            dataType: "json",
            success(res) {
              if (res.data.code == 1) {
                wx.navigateTo({
                  url: 'imgsh/imgsh'
                });
              }else{
                wx.showToast({
                  title: res.data.message+"",
                  mask: true,
                  icon: "none",
                  duration: 3000
                })
              }
            },
            fail() {
              wx.showToast({
                title: '无法链接服务器，请检查您的网络设置',
                mask:true,
                icon: "none",
                duration: 2000
              })
            }
          })
        }
      });

      return 0;
    }

    wx.navigateTo({
      url: url
    });
  }
})