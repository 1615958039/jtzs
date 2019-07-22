Page({

  /** 
   * 页面的初始数据
   */
  data: {
    texts:"",
    output:'',

    now_id:0,

    picker_data:[
      {
        text: "҉菊҉花҉文",
        val: "҉",
        type:0
      }, {
        text: "带ۣۖิۣۖิۣۖิ刺",
        val:'"ۣۖิۣۖิ"ۣۖิ"',
        type:1
      }, {
        text: '竖立字体',
        val: '\n',
        type: 0
      }, {
        text: "禁⃠止⃠",
        val: "⃠",
        type: 0
      }, {
        text: "⃟菱⃟形⃟",
        val: "⃟",
        type: 0
      }, {
        text: "圈⃘⃘圈⃘⃘",
        val: "⃘⃘",
        type: 0
      }, {
        text: "⃢胶⃢囊⃢",
        val: "⃢",
        type: 0
      }, {
        text: "横̶ ̶线̶ ",
        val: "̶",
        type: 0
      }, {
        text: "꯭ ꯭ ꯭ ꯭下꯭划꯭线꯭",
        val: "꯭",
        type: 0
      }
      

    ]
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

  //写入剪切板
  set_jqb(){
    let that = this;
    if (that.data.output!=""){
      wx.setClipboardData({
        data: that.data.output,
        success() {
          wx.showToast({title:"复制成功！"})
        }
      })
    }else{
      return 0;
    }
  },

  //选择器点击事件
  sle_it(res){
    this.setData({
      now_id: res.detail.value
    })
  },

  //文本框输入事件
  oc_texts(res){
    this.setData({
      texts: res.detail.value
    });
  },

  //生成特殊文字
  doit(){
    let that = this;
    let text = that.data.texts;
    let now_id = that.data.now_id;
    let type = that.data.picker_data[now_id].type;
    let val = that.data.picker_data[now_id].val;
    let output = '';
    let i = 0;

    if(text.length<1){
      wx.showToast({
        title: "请先输入文本！",
        icon:"none"
      });
      return 0;
    }

    if(type==0){
      output = val+output;
      while (i < text.length) {
        output = output + text.substr(i, 1) + val;
        i = i + 1;
      }
    }else if(type==1){
      val = val.replace(/"/g,'');
      output = val + output;
      while (i < text.length) {
        output = output + text.substr(i, 1) + val;
        i = i + 1;
      }
    }
    


    that.setData({
      output:output
    });
      
  

  }






})