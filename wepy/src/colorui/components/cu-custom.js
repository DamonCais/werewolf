const app = getApp();
Component({
  /**
   * 组件的一些选项
   */
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  /**
   * 组件的对外属性
   */
  properties: {
    bgColor: {
        type: String,
        default: 'bg-green'
    },
    isCustom: {
        type: [Boolean, String],
        default: false
    },
    isBack: {
        type: [Boolean, String],
        default: false
    },
    isSearch: {
        type: [Boolean, String],
        default: false
    },
    bgImage: {
        type: String,
        default: ''
    },
    StatusBar: {
        type: Number,
        default: 20
    },
    CustomBar: {
        type: Number,
        default: 64
    },
    Custom: {
        type: Object,
    },

},
  /**
   * 组件的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },
  /**
   * 组件的方法列表
   */
  methods: {
    BackPage() {
      wx.navigateBack({
        delta: 1
      });
    },
    toHome(){
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  }
})