
export default {
    computed: {
        StatusBar() {
            return this.$app.$options.globalData.StatusBar
        },
        CustomBar() {
            return this.$app.$options.globalData.CustomBar
        },
        Custom() {
            return this.$app.$options.globalData.Custom
        },
        bgColor() {
            return this.$app.$options.globalData.bgColor
        },
        bgClass() {
            return this.$app.$options.globalData.bgClass
        },
        windowHeight() {
            return this.$app.$options.globalData.windowHeight
        },
        userInfo() {
            return this.$app.$options.globalData.userInfo
        }
    },
    data: {
        total: 0,
        pagination: {
            pageSize: 10,
            pageIndex: 1

        }
    }
}