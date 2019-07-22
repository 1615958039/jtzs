Page({
  data: {
    img_size: [0, 0], //高宽
    img_url: '',  //背景图片url
    img_text_type:1,  //当前编辑的文本ID
    img_text1: { "text": "", "size": 18, "color": "#000", "x": 0, "y": 0},
    img_text2: { "text": "", "size": 18, "color": "#000", "x": 0, "y": 0},
    img_text3: { "text": "", "size": 18, "color": "#000", "x": 0, "y": 0},
    img_text4: { "text": "", "size": 18, "color": "#000", "x": 0, "y": 0},
    img_text5: { "text": "", "size": 18, "color": "#000", "x": 0, "y": 0},
    active_text:'请输入文本', //当前输入框的文本
    active_text_color:"#000000", //文字颜色
    active_text_size:'18',
    picker_show:false,
    picker_bg_h:'60%',
    picker_value: [6,10,14,18,22,26,30,34,38,48,60,70,80,90,100,120,150],
    picker_key:3,

    index_type:{}
  },
  onLoad: function (options) {
    let that = this;
    that.setData({ index_type : options })
    if(options.type=='ca'){
      that.setData({ img_url : options.url });
      that.indexs();
    }else{

      wx.showLoading({
        title: '加载中...',
        mask:true
      });

      wx.downloadFile({
        url: options.url,
        success: function(res){
          that.setData({
            img_url: res.tempFilePath
          });
          that.indexs();
          wx.hideLoading();
        },
        fail:function(res){
          wx.showToast({
            title: '图片载入失败！请返回重试',
            icon:"none",
            duration: 3000
          });
        }
      });
    }
    
  },

  indexs(){
    let that = this;
    let query = wx.createSelectorQuery();
    //取画布的高宽
    query.select('#myCanvas').boundingClientRect(function (res) {
      that.setData({
        img_size: [parseInt(res.height), parseInt(res.width)],
        img_text1: { "text": "请输入文本", "size": 18, "color": "#000000", "x": parseInt(res.height / 2), "y": parseInt(res.width / 10) * 9 },
        img_text2: { "text": "", "size": 18, "color": "#000000", "x": parseInt(res.height / 2), "y": parseInt(res.width / 10) * 9 },
        img_text3: { "text": "", "size": 18, "color": "#000000", "x": parseInt(res.height / 2), "y": parseInt(res.width / 10) * 9 },
        img_text4: { "text": "", "size": 18, "color": "#000000", "x": parseInt(res.height / 2), "y": parseInt(res.width / 10) * 9 },
        img_text5: { "text": "", "size": 18, "color": "#000000", "x": parseInt(res.height / 2), "y": parseInt(res.width / 10) * 9 }
      });
      that.setimg();
    }).exec();
  },

  //构建画布内容
  setimg(res){
    let that = this;
    const context = wx.createCanvasContext('myCanvas');
    //获取画布对象
    
    context.setFillStyle('#FFFFFF');
    context.fillRect(0, 0, that.data.img_size[1], that.data.img_size[0]);
    //修改背景颜色为白色
    
    context.drawImage(that.data.img_url, 0, 0, that.data.img_size[1], that.data.img_size[0]);
    //写入图片作为背景

    context.setTextAlign('center');
    context.setFontSize(that.data.img_text1.size);
    context.setFillStyle(that.data.img_text1.color);
    context.fillText(that.data.img_text1.text, that.data.img_text1.x,that.data.img_text1.y);
    //写入文本_1

    context.setTextAlign('center');
    context.setFontSize(that.data.img_text2.size);
    context.setFillStyle(that.data.img_text2.color);
    context.fillText(that.data.img_text2.text, that.data.img_text2.x, that.data.img_text2.y);
    //写入文本_2

    context.setTextAlign('center');
    context.setFontSize(that.data.img_text3.size);
    context.setFillStyle(that.data.img_text3.color);
    context.fillText(that.data.img_text3.text, that.data.img_text3.x, that.data.img_text3.y);
    //写入文本_3

    context.setTextAlign('center');
    context.setFontSize(that.data.img_text4.size);
    context.setFillStyle(that.data.img_text4.color);
    context.fillText(that.data.img_text4.text, that.data.img_text4.x, that.data.img_text4.y);
    //写入文本_4

    context.setTextAlign('center');
    context.setFontSize(that.data.img_text5.size);
    context.setFillStyle(that.data.img_text5.color);
    context.fillText(that.data.img_text5.text, that.data.img_text5.x, that.data.img_text5.y);
    //写入文本_5

    context.draw();
    
  },





  //触摸移动对应ID文本内容
  touchs(res) {
    let that = this;
    let nowx = res.touches[0].x;
    let nowy = res.touches[0].y;
    let type = that.data.img_text_type;
    if (type==1 || type==null){
      //文本1改变轨迹，其他不变
      that.setData({
        img_text1: { "text": that.data.img_text1.text, "size": that.data.img_text1.size, "color": that.data.img_text1.color,"x":nowx,"y":nowy}
      });
    }else if(type==2){
      //文本2改变轨迹，其他不变
      that.setData({
        img_text2: { "text": that.data.img_text2.text, "size": that.data.img_text2.size, "color": that.data.img_text2.color, "x": nowx, "y": nowy }
      });
    } else if (type == 3) {
      //文本3改变轨迹，其他不变
      that.setData({
        img_text3: { "text": that.data.img_text3.text, "size": that.data.img_text3.size, "color": that.data.img_text3.color, "x": nowx, "y": nowy }
      });
    } else if (type == 4) {
      //文本4改变轨迹，其他不变
      that.setData({
        img_text4: { "text": that.data.img_text4.text, "size": that.data.img_text4.size, "color": that.data.img_text4.color, "x": nowx, "y": nowy }
      });
    } else if (type == 5) {
      //文本5改变轨迹，其他不变
      that.setData({
        img_text5: { "text": that.data.img_text5.text, "size": that.data.img_text5.size, "color": that.data.img_text5.color, "x": nowx, "y": nowy }
      });
    }


    that.setimg();
  },

  //保存画布内的图片
  savecan() {
    let that = this;
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        wx.previewImage({
          current: tempFilePath,     //当前图片地址
          urls: [tempFilePath],               //所有要预览的图片的地址集合 数组形式
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
      },
      fail: function (res) {
        console.log(res);
      }
    })

  },

  //点击切换文本选项卡
  tap_click(res){
    let id = res.detail.index + 1;
    
    let active_text = '';
    let active_text_color = '';
    let active_text_size = '';

    if(id == 1){
      active_text = this.data.img_text1.text;
      active_text_color = this.data.img_text1.color;
      active_text_size = this.data.img_text1.size;
    }else if(id == 2){
      active_text = this.data.img_text2.text;
      active_text_color = this.data.img_text2.color;
      active_text_size = this.data.img_text2.size;
    } else if (id == 3) {
      active_text = this.data.img_text3.text;
      active_text_color = this.data.img_text3.color;
      active_text_size = this.data.img_text3.size;
    } else if (id == 4) {
      active_text = this.data.img_text4.text;
      active_text_color = this.data.img_text4.color;
      active_text_size = this.data.img_text4.size;
    } else{
      active_text = this.data.img_text5.text;
      active_text_color = this.data.img_text5.color;
      active_text_size = this.data.img_text5.size;
    }


    this.setData({
      active_text: active_text,
      active_text_color: active_text_color,
      active_text_size: active_text_size,
      img_text_type : id
    });
  },


  //文本框设置图标
  active_text_icon(){
    this.setData({
      dialog_show:true
    })
  },

  //输入框onchange
  active_text_onchange(res){
    this.setData({
      active_text:res.detail
    });
    this.textset();
  },

  //点击选择颜色标签
  active_color_do(res){
    this.setData({
      active_text_color : res.currentTarget.dataset.color
    });
    this.textset();
  },

  //作图内容写入画板
  textset(){
    let that = this;
    let id = that.data.img_text_type;
    if (id == 1) {
      that.setData({
        img_text1: { "text": that.data.active_text, "size": that.data.active_text_size, "color": that.data.active_text_color, "x": that.data.img_text1.x, "y": that.data.img_text1.y}
      });
    } else if (id == 2) {
      that.setData({
        img_text2: { "text": that.data.active_text, "size": that.data.active_text_size, "color": that.data.active_text_color, "x": that.data.img_text2.x, "y": that.data.img_text2.y }
      });
    } else if (id == 3) {
      that.setData({
        img_text3: { "text": that.data.active_text, "size": that.data.active_text_size, "color": that.data.active_text_color, "x": that.data.img_text3.x, "y": that.data.img_text3.y }
      });
    } else if (id == 4) {
      that.setData({
        img_text4: { "text": that.data.active_text, "size": that.data.active_text_size, "color": that.data.active_text_color, "x": that.data.img_text4.x, "y": that.data.img_text4.y }
      });
    } else {
      that.setData({
        img_text5: { "text": that.data.active_text, "size": that.data.active_text_size, "color": that.data.active_text_color, "x": that.data.img_text5.x, "y": that.data.img_text5.y }
      });
    }
    that.setimg();
  },



  //显示关闭 ： 遮罩层和picker
  picker_show(){
    let that = this;
    if (that.data.picker_show==false){
      let h = wx.getSystemInfoSync().windowHeight - 264;
      h = h + "px";
      that.findPickerKey();
      that.setData({
        picker_show: true,
        picker_bg_h: h
      });
      
    }else{
      that.setData({
        picker_show: false
      })
    }
  },
  //picker点击确认按钮
  picker_yes(res){
    let that = this;
    let key = res.detail.index;
    let value = res.detail.value;
    that.setData({
      picker_show: false,
      active_text_size: value
    });
    that.textset();
  },

  //找picker的key
  findPickerKey(){
    let that = this;
    let active_text_size = that.data.active_text_size;
    let i = 0;
    let data = that.data.picker_value;
    while (i < data.length) {
      if (data[i] == active_text_size) {
        break;
      } else {
        i++;
      }
    }
    that.setData({
      picker_key: i
    });
  },

  onShareAppMessage(res) {
    let that = this;
    let imgurl = that.data.img_url;
    if (that.data.index_type.type == 'ca'){
      imgurl = "https://520i.net/icon.png";
    }
    return {
      title: '斗图表情包在线制作',
      imageUrl:imgurl,
      path:"pages/tools/imglist/imglist"
    }
  }

})
