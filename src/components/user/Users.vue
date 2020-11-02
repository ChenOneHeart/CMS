<template>
  <div>
    <!-- 导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/users' }">用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 主体区 -->
    <el-card>
      <!-- 搜索和添加 -->
      <el-row :gutter="20">
        <!-- 搜索用户 -->
        <el-col :span="8">
          <!-- 搜索用户-搜索框 -->
          <el-input @keyup.native.enter="queryUser" @clear="queryUser" clearable v-model="userListParams.query" placeholder="请输入内容">
            <!-- 搜索用户-按钮 -->
            <el-button @click="queryUser" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <!-- 添加用户 -->
        <el-col :span="5">
          <!-- 添加用户-按钮 -->
          <el-button @click="showAddUserDialog" type='primary'>添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table border stripe :data="userList" style="width: 100%">
        <el-table-column label="序号" type="index" width="50px">
        </el-table-column>
        <el-table-column prop="username" label="姓名">
        </el-table-column>
        <el-table-column prop="email" label="邮箱">
        </el-table-column>
        <el-table-column prop="mobile" label="电话">
        </el-table-column>
        <el-table-column prop="role_name" label="角色">
        </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template v-slot="scope">
            <el-switch :disabled="isSwitchOn" @change="userStateChange(scope.row)" v-model="scope.row.mg_state">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!-- 修改用户-按钮 -->
            <el-button @click="showUpdateDialog(scope.row.id)" size="mini" type="primary" icon="el-icon-edit"></el-button>
            <!-- 删除用户-按钮 -->
            <el-button @click="deleteUser(scope.row.id)" size="mini" type="danger" icon="el-icon-delete"></el-button>
            <!-- 分配角色-按钮 -->
            <el-tooltip :enterable="false" effect="dark" content="分配角色" placement="top">
              <el-button @click="showSetDialog(scope.row)" size="mini" type="warning" icon="el-icon-setting"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="userListParams.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="userListParams.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户-对话框 -->
    <el-dialog title="添加用户" :visible.sync="isAddDialogOn" width="45%" @closed="clearAddForm">
      <!-- 添加用户-对话框-表单 -->
      <el-form status-icon :model="addUserParams" :rules="addUserRules" ref="addUserForm" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserParams.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserParams.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserParams.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserParams.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--添加用户-对话框-底部-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="isAddDialogOn = false">取 消</el-button>
        <el-button @click="addUser" type="primary">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户-对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="isUpdateDialogOn" width="45%" @closed="clearUpdateForm">
      <!-- 修改用户-对话框-表单 -->
      <el-form :model="updateUserParams" :rules="addUserRules" ref="updateUserForm" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input disabled="disabled" v-model="updateUserParams.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="updateUserParams.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="updateUserParams.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--修改用户-对话框-底部-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="isUpdateDialogOn = false">取 消</el-button>
        <el-button @click="updateUser" type="primary">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限-对话框 -->
    <el-dialog title="提示" :visible.sync="isSetDialogOn" width="45%" @closed="clearSetData">
      <p>当前的用户：{{userInfo.username}}</p>
      <p>当前的角色：{{userInfo.role_name}}</p>
      <span>分配新角色：</span>
      <el-select v-model="selected" placeholder="请选择一个角色">
        <el-option v-for="(item) in roleList" :key="item.id" :label="item.roleName" :value="item.id">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isSetDialogOn = false">取 消</el-button>
        <el-button type="primary" @click="setUser">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) {
        return callback()
      } else {
        return callback(new Error('请输入合法的邮箱'))
      }
    }
    var checkMobile = (rule, value, callback) => {
      const regmobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regmobile.test(value)) {
        return callback()
      } else {
        return callback(new Error('请输入合法的手机号'))
      }
    }
    return {
      // 请求获取用户列表的参数
      userListParams: {
        query: '', // 查询参数（接口参数，不能修改该键）
        pagenum: 1, // 当前页数（接口参数，不能修改该键）
        pagesize: 10 // 每页多少条数据（接口参数，不能修改该键）
      },
      value: true,
      userList: [], // 用于保存从后台请求回来的用户列表数据
      roleList: [], // 角色列表数据
      total: 0, // 用于保存从后台请求回来的total
      isSwitchOn: false, // 用户列表-状态-开关
      isAddDialogOn: false, // 添加用户-对话框-是否显示
      isUpdateDialogOn: false, // 修改用户-对话框-是否显示
      isSetDialogOn: false, // 分配角色-对话框-是否显示
      // 添加用户-请求参数
      addUserParams: {
        username: '一位不愿透漏姓名的网友', // TODO 临时数据
        password: 'anonymous',
        email: 'anonymous@anonymous.com',
        mobile: '13666666666'
      },
      // 修改用户-请求参数
      updateUserParams: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      // 添加用户-对话框-表单-验证规则
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [{ required: true, validator: checkEmail, trigger: 'blur' }],
        mobile: [{ required: true, validator: checkMobile, trigger: 'blur' }]
      },
      userInfo: {}, // 需要分配角色的用户信息
      selected: '' // 已选中角色的id值（和下拉菜单双向绑定）
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    /* 获取用户列表 */
    async getUserList() {
      const { data: res } = await this.axios.get('users', {
        params: this.userListParams
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users // 保存从后台请求回来的用户列表数据
      this.total = res.data.total // 保存从后台请求回来的total
    },
    /* 搜索并获取用户列表 */
    queryUser() {
      this.userListParams.pagenum = 1 // 将页码重置，防止当前页码不是第一页无法显示查询到的数据
      this.getUserList()
    },
    /* 添加用户 */
    addUser() {
      this.$refs.addUserForm.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.axios.post('users', this.addUserParams)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.isAddDialogOn = false
        this.getUserList()
        return this.$message.success('添加用户成功')
      })
    },
    /* 提交 修改用户-表单信息 */
    updateUser() {
      this.$refs.updateUserForm.validate(async valid => {
        if (!valid) {
          this.$message.error('表单验证失败')
          return false
        }
        const { data: res } = await this.axios.put(
          `users/${this.updateUserParams.id}`,
          {
            email: this.updateUserParams.email,
            mobile: this.updateUserParams.mobile
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败')
        }
        this.isUpdateDialogOn = false
        this.getUserList()
        return this.$message.success('修改用户信息成功')
      })
    },
    /* 删除用户 */
    async deleteUser(id) {
      const result = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      if (result !== 'confirm') {
        return this.$message.info('取消删除用户')
      }
      const { data: res } = await this.axios.delete(`/users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.getUserList()
      return this.$message.success('删除用户成功')
    },
    showAddUserDialog() {
      this.isAddDialogOn = true
    },
    /* 点击 修改用户-按钮 */
    async showUpdateDialog(id) {
      const { data: res } = await this.axios.get(`users/${id}`)
      const data = res.data
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.updateUserParams.id = id
      this.updateUserParams.username = data.username
      this.updateUserParams.email = data.email
      this.updateUserParams.mobile = data.mobile
      this.isUpdateDialogOn = true // 显示 修改用户-对话框
    },
    /* 显示分配角色对话框 */
    async showSetDialog(row) {
      this.userInfo = row
      const { data: res } = await this.axios.get('roles')
      this.roleList = res.data
      this.isSetDialogOn = true // 显示分配角色对话框
    },
    /* 每页显示个数改变 */
    handleSizeChange(pageSize) {
      this.userListParams.pagesize = pageSize
      this.getUserList() // 更新用户数据列表
    },
    /* 当前页码改变 */
    handleCurrentChange(currentPage) {
      this.userListParams.pagenum = currentPage
      this.getUserList() // 更新用户数据列表
    },
    /* 状态栏更新后向服务器更新数据 */
    async userStateChange(userInfo) {
      this.isSwitchOn = true
      const id = userInfo.id // 用户id
      const type = userInfo.mg_state // 用户状态
      const { data: res } = await this.axios.put(`users/${id}/state/${type}`)
      if (res.meta.status !== 200) {
        return setTimeout(() => {
          this.$message.error('更新用户状态失败')
          this.isSwitchOn = false
        }, 500)
      }
      setTimeout(() => {
        this.$message.success('更新用户状态成功')
        this.isSwitchOn = false
      }, 500)
    },
    clearAddForm() {
      this.$refs.addUserForm.resetFields() // 关闭 添加用户-对话框 清除残留的表单数据
    },
    clearUpdateForm() {
      this.$refs.updateUserForm.resetFields() // 关闭 修改用户-对话框 清除残留的表单数据
    },
    /* 给用户分配权限 */
    async setUser() {
      if (this.selected === '') {
        return this.$message.warning('请选择要分配的角色')
      }
      const { data: res } = await this.axios.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selected
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.isSetDialogOn = false
      this.getUserList()
      return this.$message.success('更新角色成功')
    },
    /* 重置分配角色的数据 */
    clearSetData() {
      this.roleList = []
      this.selected = ''
      this.userInfo = {}
    }
  }
}
</script>

<style scoped lang="less">
</style>
