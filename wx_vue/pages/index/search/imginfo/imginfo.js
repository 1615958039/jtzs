Page({
  /**
   * 页面的初始数据
   */
  data: {
    id:0, //图片ID
    imginfo:{
      admin_name: '加载中...',
      admin_text: '该用户很懒还没设置个性签名哦~',
      islike: 'false',
      like: 0
    },

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({title: '加载中...',mask:true});
    let that = this;
    that.setData({
      id:options.id
    });
    wx.getStorage({
      key: 'users_token',
      success(rt) {
        wx.request({
          url: 'https://520i.net/api.php?type=get_img_info&id=' + options.id + '&session_id=' + rt.data,
          method:"get",
          dataType:"json",
          success(res){
            if(res.data.code == 1){
              that.setData({
                imginfo: res.data.imginfo
              });
              wx.hideLoading();
            }else{
              wx.showToast({
                title: res.data.message+"",
                icon: "none",
                mask:true,
                duration: 5000
              })
            }
          },
          fail(){
            wx.showToast({
              title: '获取详情失败！请返回重试',
              icon: "none",
              mask: true,
              duration: 5000
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
    let that = this;
    return {
      title: '杰图助手_斗图表情包在线制作',
      path: '/pages/index/search/imginfo/imginfo?id=' + that.data.id,
      imageUrl: that.data.imginfo.url
    }
  },

  //查看图片
  seeimg(){
    let that = this;
    wx.previewImage({
      current: that.data.imginfo.url,
      urls: [that.data.imginfo.url],
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {},
    })
  },
  //点击小红心
  like(){
    let that = this;
    let like = parseInt(that.data.imginfo.like);
    if(that.data.imginfo.islike=='false'){
      //点亮小红心
      wx.getStorage({
        key: 'users_token',
        success(rt) {
          wx.request({
            url: 'https://520i.net/api.php?type=add_img_love',
            data:{
              id: that.data.imginfo.id,
              session_id: rt.data
            },
            method: "post",
            dataType: "json",
            success(res) {
              if (res.data.code == 1) {
                that.setData({
                  imginfo: {
                    'id': that.data.imginfo.id,
                    'url': that.data.imginfo.url,
                    'like': like + 1,
                    'see': that.data.imginfo.see,
                    'islike': 'true',
                    'admin_name': that.data.imginfo.admin_name,
                    'admin_text': that.data.imginfo.admin_text,
                    'admin_imgurl': that.data.imginfo.admin_imgurl,
                  }
                });
              } else if (res.data.code == -3 || res.data.code == '-3'){
                wx.showToast({
                  title: res.data.message,
                  icon: "none",
                  mark:true,
                  duration: 2000
                })
              }
            }
          })
        }
      });
    }else{
      //关闭小红心
      wx.getStorage({
        key: 'users_token',
        success(rt) {
          wx.request({
            url: 'https://520i.net/api.php?type=del_img_love',
            data: {
              id: that.data.imginfo.id,
              session_id: rt.data
            },
            method: "post",
            dataType: "json",
            success(res) {
              if (res.data.code == 1) {
                that.setData({
                  imginfo: {
                    'id': that.data.imginfo.id,
                    'url': that.data.imginfo.url,
                    'like': like - 1,
                    'see': that.data.imginfo.see,
                    'islike': 'false',
                    'admin_name': that.data.imginfo.admin_name,
                    'admin_text': that.data.imginfo.admin_text,
                    'admin_imgurl': that.data.imginfo.admin_imgurl,
                  }
                });
              }
            }
          })
        }
      });
      

    }
  }


})