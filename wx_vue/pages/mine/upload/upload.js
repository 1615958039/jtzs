Page({
  
  /**
   * 页面的初始数据   
   */
  data: {
    index: null,
    imgList: [],
    img_num: 0,

    q_show:false
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




  ChooseImage() {
    let that = this;
    let have = that.data.img_num;
    wx.chooseImage({
      count: 9-have,
      sizeType: 'compressed',
      sourceType: ['album'],
      success: (res) => {
        let file = [];
        let filetype = '';
        let filename = '';
        let filesize = 0;
        let i = 0;
        for (let i = 0; i < res.tempFilePaths.length;i++){
          filename = res.tempFilePaths[i].split(".");
          filetype = filename[filename.length - 1];
          if(filetype != "png" && filetype != "jpg" && filetype != "jpeg"){
            continue;
          }
          filesize = res.tempFiles[i].size/1024;
          if(filesize<5 || filesize>2048){
            continue;
          }
          file = file.concat(res.tempFilePaths[i]);
        }

        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(file)
          });
        } else {
          this.setData({
            imgList: file
          });
        }

        if(file.length>0){
          this.setData({ img_num: this.data.img_num + res.tempFilePaths.length })
        }
        

      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      content: '是否删除该表情包',
      cancelText: '取消',
      confirmText: '删除',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          });
          this.setData({ img_num: this.data.img_num - 1 })
        }
      }
    })
  },

  //上传表情包
  upfile(){
    let that = this;
    let file = that.data.imgList;
    if(file.length<1){
      wx.showToast({
        title: '请先选择图片哦~',
        mask: true,
        icon: "none",
        duration: 2000
      });
      return 0;
    }
    wx.showLoading({ title: '上传准备中...', mask: true });
    that.upfiles();

  },



  upfiles(){
    let that = this;
    let endnum = that.data.imgList.length+"";
    let havenum = that.data.img_num;
    if(endnum==0 || endnum=='0'){
      wx.hideLoading();
      wx.showModal({
        title: '恭喜您!',
        content: '图片上传成功！等待管理员审核通过即可发布',
        cancelText: "继续上传",
        confirmText: "查看状态",
        success(res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '../myup/myup'
            });
          } else if (res.cancel) {
            that.setData({ 
              index: null,
              imgList: [],
              img_num: 0
            })
          }
        }
      })
      return 0;
    }

    wx.showLoading({ title: '上传中(' + havenum + "/" + (havenum - endnum) + ")", mask: true });
    wx.getStorage({
      key: 'users_token',
      success(rt) {
        wx.uploadFile({
          url: 'https://520i.net/api.php?type=users_upimg&session_id=' + rt.data,
          filePath: that.data.imgList[0],
          name: 'file',
          success(res) {
            let data = decodeURIComponent(res.data);
            data = JSON.parse(data);
            
            if (data.code == -1 || data.code == '-1') {
              wx.showToast({
                title: data.message,
                icon: "none",
                mask: true,
                duration: 3000
              });
              return 0;
            } else if (data.code == 0 || data.code == '0') {
              wx.showToast({
                title: data.message+"",
                icon: "none",
                mask: true,
                duration: 2000
              });
              return 0;
            }
            that.data.imgList.splice(0, 1);
            that.setData({
              imgList: that.data.imgList
            });
            that.upfiles();
          },
          fail(res) {
            wx.showToast({
              title: "网络连接失败，请检查网络设置",
              icon: "none",
              mask: true,
              duration: 2000
            });
            wx.hideLoading();
            return 0;
          }
        })
      }
    });
      
    
  },


  //显示上传说明提示框
  showModal(){
    this.setData({
      q_show : true
    })
  },

  //隐藏上传说明提示框
  hideModal(){
    this.setData({
      q_show: false
    })
  }


})