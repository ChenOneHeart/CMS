<template>
  <div>
    <!-- 导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/roles' }">权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 主体区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button @click="showAddDialog" type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table stripe border :data="roleList">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row :class="['border-bottom','center', (index === 0) ? 'border-top': '']" v-for="(item,index) in scope.row.children" :key="index">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag effect="light" type="primary" closable @close="deleteRight(scope.row,item.id)">
                  {{item.authName}}
                  <i class="el-icon-caret-right"></i>
                </el-tag>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row :class="[(index !== 0) ? 'border-top' : '','center']" v-for="(item, index) in item.children" :key="index">
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag effect="light" type="success" closable @close="deleteRight(scope.row,item.id)">
                      {{item.authName}}
                      <i class="el-icon-caret-right"></i>
                    </el-tag>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag effect="light" type="warning" v-for="(item, index) in item.children" :key="index" closable @close="deleteRight(scope.row,item.id)">
                      {{item.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索隐列 -->
        <el-table-column type="index" label="序号" width="55px"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <!-- 修改角色-按钮 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showUpdateDialog(scope.row.id)">编辑</el-button>
            <!-- 删除角色-按钮 -->
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
            <!-- 分配权限-按钮 -->
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetDialog(scope.row.id)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色-对话框 -->
    <el-dialog title="添加角色" :visible.sync="isAddDialogOn" width="45%" @closed="clearAddForm">
      <el-form :model="addRoleParams" :rules="roleRules" ref="addRoleForm" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleParams.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleParams.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框-底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="isAddDialogOn = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色-对话框 -->
    <el-dialog title="修改角色" :visible.sync="isUpdateDialogOn" width="45%" @closed="clearUpdateForm">
      <el-form :model="updateRoleParams" :rules="roleRules" ref="updateRoleForm" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="updateRoleParams.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="updateRoleParams.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框-底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="isUpdateDialogOn = false">取 消</el-button>
        <el-button type="primary" @click="updateRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限-对话框 -->
    <el-dialog title="分配权限" :visible.sync="isSetDialogOn" width="45%" @closed="clearSetForm">
      <el-tree ref="tree" :default-checked-keys="defaultKeys" default-expand-all show-checkbox :data="rightsList" :props="treeProps" node-key="id">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isSetDialogOn = false">取 消</el-button>
        <el-button type="primary" @click="setRole()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [], // 角色列表
      // 添加角色的请求数据
      addRoleParams: {
        roleName: '', // 角色名称
        roleDesc: '' // 角色描述
      },
      // 修改用户的请求数据
      updateRoleParams: {
        id: '',
        roleName: '', // 角色名称
        roleDesc: ''
      },
      // 添加角色和修改角色的表单验证信息
      roleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 树形控件绑定的数据
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defaultKeys: [], // tree控件默认选中的数据
      rightsList: [], // 权限列表
      isAddDialogOn: false, // 添加角色对话框是否打开
      isUpdateDialogOn: false, // 修改角色对话框是否打开
      isSetDialogOn: false, // 分配角色对话框是否打开
      setRoleId: ''
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    /* 获取角色列表 */
    async getRoleList() {
      const { data: res } = await this.axios.get('roles') // 获取角色列表
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
    },
    showAddDialog() {
      this.isAddDialogOn = true // 显示 添加角色对话框
    },
    /* 显示 修改角色 对话框 */
    async showUpdateDialog(id) {
      const { data: res } = await this.axios.get(`roles/${id}`) // 根据id查询角色
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色失败')
      }
      this.updateRoleParams.id = id
      this.updateRoleParams.roleName = res.data.roleName
      this.updateRoleParams.roleDesc = res.data.roleDesc
      this.isUpdateDialogOn = true
      return this.$message.success('查询角色成功')
    },
    /* 显示 分配权限 对话框 */
    async showSetDialog(id) {
      const { data: res } = await this.axios.get('rights/tree') // 获取所有权限列表
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.setRoleId = id
      this.rightsList = res.data // 获取权限列表并保存到前端
      const role = this.roleList.filter(item => item.id === id)[0] // 从所有角色列表（包括对应权限）中过滤出当前行的角色权限信息
      this.getRightId(role, this.defaultKeys)
      this.isSetDialogOn = true // 显示 分配权限对话框
    },
    /**
     * 递归获取所有最里层权限的id @param node 是一个多层嵌套的对象，可能含有children属性
     * */
    getRightId(node, array) {
      if (node.children === undefined) {
        return array.push(node.id)
      }
      node.children.forEach(item => {
        this.getRightId(item, array)
      })
    },
    clearAddForm() {
      this.$refs.addRoleForm.resetFields() // 关闭 添加角色对话框 时清除残留的表单数据
    },
    clearUpdateForm() {
      this.$refs.updateRoleForm.resetFields() // 关闭 添加角色对话框 时清除残留的表单数据
    },
    clearSetForm() {
      this.defaultKeys = [] // 关闭 分配权限对话框 时清除残留的Tree数据
    },
    /* 点击确定添加角色 */
    async addRole() {
      const { data: res } = await this.axios.post('roles', this.addRoleParams) // 添加角色
      this.$refs.addRoleForm.validate(valid => {
        if (!valid) return
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.isAddDialogOn = false
        this.getRoleList()
        return this.$message.success('添加角色成功')
      })
    },
    /* 点击确定修改角色 */
    updateRole() {
      this.$refs.updateRoleForm.validate(async valid => {
        if (!valid) return
        // 编辑提交角色
        const { data: res } = await this.axios.put(
          `roles/${this.updateRoleParams.id}`,
          {
            roleName: this.updateRoleParams.roleName,
            roleDesc: this.updateRoleParams.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        }
        this.isUpdateDialogOn = false
        this.getRoleList()
        return this.$message.success('修改角色成功')
      })
    },
    /* 点击按钮删除角色 */
    async deleteRole(id) {
      // 用result接收$confirm返回的promise
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
        return this.$message.info('取消删除角色')
      }
      const { data: res } = await this.axios.delete(`/roles/${id}`) // 删除角色
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.getRoleList()
      return this.$message.success('删除角色成功')
    },
    /* 删除权限 */
    async deleteRight(row, rightId) {
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
        return this.$message.info('取消删除权限')
      }
      const { data: res } = await this.axios.delete(
        `roles/${row.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      row.children = res.data
      return this.$message.success('删除权限成功')
    },
    /* 点击确定分配权限 */
    async setRole() {
      const keys = [
        ...this.$refs.tree.getCheckedKeys(),
        ...this.$refs.tree.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      // 角色授权
      const { data: res } = await this.axios.post(`roles/${this.setRoleId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) {
        return this.$message.error('角色授权失败')
      }
      this.isSetDialogOn = false
      this.getRoleList()
      return this.$message.success('角色授权成功')
    }
  }
}
</script>

<style scoped lang="less">
.el-tag {
  margin: 10px 5px;
}
.border-top {
  border-top: 1px solid #ccc;
}
.border-bottom {
  border-bottom: 1px solid #ccc;
}
.center {
  display: flex;
  align-items: center;
}
</style>
