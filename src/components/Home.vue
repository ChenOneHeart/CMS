<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header height="80px">
      <div>
        <img class="logo-img" src="../assets/home_logo.png" alt="图片">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside v-cloak :width="asideWidth">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu :default-active="$route.path" router :collapse-transition="false" :collapse="isCollapse" :unique-opened="true" background-color="#333744" text-color="#fff" active-text-color="#409eff">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="(item, index) in menuList" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 一级菜单图标 -->
              <i :class="iconClass[index]"></i>
              <!-- 一级菜单文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="(subItem) in item.children" :key="subItem.id">
              <!-- 二级菜单的模板区域 -->
              <template slot="title">
                <!-- 二级菜单图标 -->
                <i class="el-icon-menu"></i>
                <!-- 二级菜单文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      // 左侧菜单信息，用于保存从服务器获取的菜单信息
      menuList: [],
      // 使用第三方图标库作为一级菜单左侧的图标
      iconClass: [
        'iconfont icon-users',
        'iconfont icon-tijikongjian',
        'iconfont icon-shangpin',
        'iconfont icon-danju',
        'iconfont icon-baobiao'
      ],
      isCollapse: false, // 一级菜单是否折叠
      asideWidth: '200px',
      isAddEvent: false // 是否给侧边栏绑定了事件
    }
  },
  created() {
    this.getMenuList()
  },
  /**
   * 防止右侧箭头图标在折叠时的闪烁
   */
  updated() {
    var arrowIcons = document.getElementsByClassName('el-submenu__icon-arrow')
    var submenu = document.getElementsByClassName('el-submenu')
    var aside = document.getElementsByClassName('el-aside')[0]
    for (let i = 0; i < submenu.length; i++) {
      arrowIcons[i].style.opacity = 0
    }
    if (this.isAddEvent) return false
    else {
      aside.addEventListener('transitionend', () => {
        for (let i = 0; i < submenu.length; i++) {
          arrowIcons[i].style.opacity = 1
        }
      })
      this.isAddEvent = true
    }
  },
  methods: {
    /**
     * 退出按钮绑定的事件
     */
    logout() {
      window.sessionStorage.clear() // 清除token
      this.$router.push('/login') // 跳转到登录页面
    },
    /**
     * 获取所有的菜单
     */
    async getMenuList() {
      const { data: res } = await this.axios.get('menus') // 解构赋值出响应信息中由服务器返回的数据
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg) // 获取菜单列表失败
      this.menuList = res.data // 将菜单列表保存到组件的data中
    },
    /**
     * 折叠一级菜单进行的操作
     */
    toggleCollapse() {
      this.isCollapse = !this.isCollapse // 切换一级菜单的折叠状态
      if (this.asideWidth === '200px') {
        this.asideWidth = '64px'
      } else {
        this.asideWidth = '200px'
      }
    }
  }
}
</script>
<style lang="css" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  font-size: 30px;
  color: white;
}

.el-header > div {
  display: flex;
  align-items: center;
}

.el-aside {
  background-color: #333744;
  color: white;
  transition: width 0.3s; /* 侧边栏折叠过渡 */
  -moz-transition: width 0.3s; /* Firefox */
  -webkit-transition: width 0.3s; /* Safari and Chrome */
  -o-transition: width 0.3s; /* Opera */
}
/* .el-submenu__icon-arrow .el-icon-arrow-down {
  transition: opacity 3s;
} */
.toggle-button {
  background-color: #4a5064;
  font-size: 15px;
  padding: 2px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 2px;
  color: #fff;
  cursor: pointer;
}

.el-menu {
  border-right: none;
}
.el-main {
  background-color: #ddd;
}
.logo-img {
  width: 80px;
  height: 80px;
}
.iconfont {
  margin-right: 10px; /* 一级菜单图标和文本间的空隙 */
}
</style>
