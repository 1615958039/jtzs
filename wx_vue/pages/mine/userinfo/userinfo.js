Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    userdata:{},
    v_img:'',
    v_name:'',
    v_signtext:'',

    is_save:false,  //保存中提示

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //载入个人信息

    that.setData({
      userdata: {
        name: options.name,
        signtext: options.signtext,
        img: options.img
      },
      v_name: options.name,
      v_signtext: options.signtext
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

  save(){
    let that = this;
    if(that.data.is_save == false){
      that.setData({ is_save : true });//开启加载状态
      if (that.data.v_img==''){
        //只上传昵称个性签名
        let v_name = that.data.v_name+"";
        if(v_name.length<2){
          wx.showToast({
            title: '请输入2个字符以上的昵称',
            mask:true,
            icon:"none",
            duration: 2000
          });
          that.setData({ is_save: false });
          return 0;
        }
        if (v_name == that.data.userdata.name && that.data.userdata.signtext == that.data.v_signtext){
          that.setData({ is_save: false });
          return 0;
        }

        wx.getStorage({
          key: 'users_token',
          success(rt) {
            wx.request({
              url: 'https://520i.net/api.php?type=update_name',
              data: {
                session_id: rt.data,
                name: that.data.v_name,
                signtext: that.data.v_signtext
              },
              method: "post",
              success(res) {
                that.setData({ is_save: false });
                if(res.data.code==1){
                  wx.showToast({
                    title: '修改成功！',
                    mask: true,
                    icon: "success",
                    duration: 2000,
                    complete() {
                      setTimeout(function () {
                        wx.navigateBack({ delta: 1 })
                      }, 1900);
                    }
                  })
                }else{
                  wx.showToast({
                    title: res.data.message+"",
                    mask: true,
                    icon: "none",
                    duration: 2000
                  })
                }
              },
              fail() {
                wx.showToast({
                  title: '无法链接到服务器，请重试',
                  mask:true,
                  icon: "none",
                  duration: 2000
                })
              }
            })
          }
        })
      }else{
        //上传图片
        wx.getStorage({
          key: 'users_token',
          success(rt) {
            wx.uploadFile({
              url: 'https://520i.net/api.php?type=update_img&name=' + that.data.v_name + "&signtext=" + that.data.v_signtext + "&session_id=" + rt.data,
              filePath: that.data.v_img[0],
              name: 'file',
              success(res) {
                let data = decodeURIComponent(res.data)
                data = JSON.parse(data)
                if (data.code == 1) {
                  wx.showToast({
                    title: '保存成功！',
                    icon: "success",
                    mask: true,
                    duration: 2000,
                    complete() {
                      setTimeout(function(){
                        wx.navigateBack({ delta: 1 })
                      },1900);
                    }
                  });
                } else {
                  wx.showToast({
                    title: data.message+"",
                    icon: "none",
                    mask: true,
                    duration: 2000
                  })
                }
              },
              fail(res) {
                wx.showToast({
                  title: "网络连接失败，请检查网络设置",
                  icon:"none",
                  mask: true,
                  duration: 2000
                })
              },
              complete(res) {
                that.setData({ is_save: false })
              }
            })
          }
        });
        
      }
    }
  },


  on_name(res){
    let name = res.detail.value;
    name = name.replace(/[^\u4E00-\u9FA5|0-9|a-z|A-Z]/g, '');
    this.setData({ v_name: name });
  },
  on_signtext(res){
    this.setData({ v_signtext: res.detail.value });
  },

  img() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function (res) {
        let file = res.tempFilePaths[0].split(".");
        let type = file[file.length - 1];
        if(type!='jpg' && type!="jpeg" && type!="png"){
          wx.showToast({
            title: "暂不支持该图片格式(."+type+")",
            icon:"none",
            mask:true,
            duration: 2000
          });
          return 0;
        }
        if (res.tempFiles[0].size / 1024 < 5 || res.tempFiles[0].size/1024 > 2048) {
          wx.showToast({
            title: "头像仅限在5kb~2m之间哦~",
            icon: "none",
            mask: true,
            duration: 2000
          });
          return 0;
        }

        that.setData({
          v_img : res.tempFilePaths,
          userdata : {
            img: res.tempFilePaths[0]
          }
        })
      }
    });
  }


})