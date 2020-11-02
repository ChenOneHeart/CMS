# COMPONENTS

## Home.vue

### 重复触发路由报错

menu.js?443e:769 Error: Avoided redundant navigation to current location: "/users"
修改 router 的 index.js 文件

```javascript
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
```

### 侧边栏开启路由模式

使用 element-ui 自带的 router 属性
启用该模式会在激活导航时以 index 作为 path 进行路由跳转。

```html
<!-- 侧边栏菜单：添加router属性 -->
<el-menu
  router
  :collapse-transition="false"
  :collapse="isCollapse"
  :unique-opened="true"
  background-color="#333744"
  text-color="#fff"
  active-text-color="#409eff"
>
  <!-- ... -->
  <!-- 二级菜单：设置index属性为后台传来的路径 -->
  <el-menu-item
    :index="'/' + subItem.path"
    v-for="(subItem) in item.children"
    :key="subItem.id"
  ></el-menu-item
></el-menu>
```

## Users.vue

### 搜索用户

```html
<el-input v-model="userListParams.query" placeholder="请输入内容">
<el-buttont @click="getUserList" slot="append" icon="el-icon-search"></el-button>
</el-input>
```

### 修改用户-对话框

这里显示数据可以使用通过 v-slot 传来的 scope.row 表单信息
为了数据安全选择向服务器请求信息。

### async deleteUser(id)

```javascript
async deleteUser(id) {
  const res = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).catch(error => error)
  console.log(res) // 点击取消：返回cacel，点击确定：返回confirm
}
```

## Roles.vue

### top 和 bottom 边框重复问题

同时设置 top 和 bottom 的边框，两者无法重叠
解决方法：

1. 设置 margin-top: -1px 或者 margin-bottom:-1px
2. 排除重复设置边框的标签，使用 class 动态绑定类，当遇到重复设置的标签时不绑定该类。

```html
<el-row :class="['border-bottom', (index === 0) ? 'border-top': '']"></el-row>
<el-row :class="[(index !== 0) ? 'border-top' : '']"></el-row>
```

## Users.vue

下拉菜单

```html
<el-select v-model="selected" placeholder="请选择一个角色">
  <el-option
    v-for="(item) in roleList"
    :key="item.id"
    :label="item.roleName"
    :value="item.id"
  >
  </el-option>
</el-select>
```

:value="item.id" // 将值绑定为角色列表中的 id 属性，以便提交表单

## Add.vue

关于 el-upload 的使用
需要给 upload 组件设置 headers 属性，用于自定义 http 请求，
在请求时给请求头添加某个字段。
这里添加了`Authorization: window.sessionStorage.getItem('token')`
headers 为对象

```javascript
headers: {
  Authorization: window.sessionStorage.getItem('token')
}
```

```html
<el-upload
  :headers="headers"
  list-type="picture"
  :action="uploadURL"
  :on-preview="handlePreview"
  :on-remove="handleRemove"
  multiple
  :limit="3"
>
  <el-button size="small" type="primary">点击上传</el-button>
  <span slot="tip" style="fontSize:12px;marginLeft:10px"
    >(只能上传jpg/png文件，且不超过500kb)</span
  >
</el-upload>
```
