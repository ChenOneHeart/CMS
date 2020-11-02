<template>
  <div>
    <!-- 导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 警告文字 -->
      <el-alert show-icon :closable="false" title="注意：只允许为第三级分类设置相关参数！" type="warning">
      </el-alert>
      <!-- 选择商品分类 -->
      <el-row class="margin">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择器 -->
          <el-cascader clearable v-model="selectedKeys" :props="cascaderProps" :options="cateList" @change="cateChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- 所有的参数 -->
      <el-tabs v-model="activeName" @tab-click="tabClick" type="border-card">
        <!-- 添加动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加动态参数按钮 -->
          <el-button @click="openAddDialog" size="mini" :disabled="btnDisabled" type="primary">添加参数</el-button>
          <el-table border stripe :data="dynamicData" style="width: 100%">
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag @close="deleteVal(scope.row, scope.$index, index)" v-for="(item,index) in valList[scope.$index]" :key="index" closable>{{ item }}</el-tag>
                <el-input class="input-new-tag" ref="saveTagInput" v-if="scope.row.inputVisible" v-model="inputValue[scope.$index]" size="small" @keyup.enter.native="handleInputConfirm(scope.row, scope.$index)" @blur="handleInputConfirm(scope.row, scope.$index)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="50px">
            </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button @click="openEditDialog(scope.row.attr_id)" type="primary" size="mini" icon="el-icon-edit">修改</el-button>
                <el-button @click="openDeleteDialog(scope.row.attr_id)" type="danger" size="mini" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加静态属性按钮 -->
          <el-button @click="openAddDialog" size="mini" :disabled="btnDisabled" type="primary">添加属性</el-button>
          <el-table border stripe :data="staticData" style="width: 100%">
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag @close="deleteVal(scope.row, scope.$index, index)" v-for="(item,index) in valList[scope.$index]" :key="index" closable>{{ item }}</el-tag>
                <el-input class="input-new-tag" ref="saveTagInput" v-if="scope.row.inputVisible" v-model="inputValue[scope.$index]" size="small" @keyup.enter.native="handleInputConfirm(scope.row, scope.$index)" @blur="handleInputConfirm(scope.row, scope.$index)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="50px">
            </el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button @click="openEditDialog(scope.row.attr_id)" type="primary" size="mini" icon="el-icon-edit">修改</el-button>
                <el-button @click="openDeleteDialog(scope.row.attr_id)" type="danger" size="mini" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog :title="'添加'+ DialogText" :visible.sync="isAddDialogOn" width="45%" @close="addDialogClose">
      <el-form :rules="addRules" ref="addFormRef" :model="addForm" label-width="100px">
        <el-form-item :label="DialogText + '：'" prop="attr_name">
          <el-input v-model="addForm.attr_name" placeholder="请输入参数名"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="isAddDialogOn = false">取 消</el-button>
        <el-button type="primary" @click="addParam">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog :title="'修改'+ DialogText" :visible.sync="isEditDialogOn" width="45%" @close="editDialogClose">
      <el-form :rules="addRules" ref="editFormRef" :model="editForm" label-width="100px">
        <el-form-item :label="DialogText +'：'" prop="attr_name">
          <el-input v-model="editForm.attr_name" placeholder="请输入参数"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="isEditDialogOn = false">取 消</el-button>
        <el-button type="primary" @click="editParam">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      inputValue: [], // 所有行文本框的内容：每一行对应inputValue[$index]
      valList: [], // 属性列表：二维数组，表格每一行数据对应inputValue[$index]
      isEditDialogOn: false, // 编辑对护框是否显示
      addRules: {
        attr_name: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ]
      },
      isAddDialogOn: false,
      editForm: {}, // 修改的数据
      addForm: {
        attr_name: '' // 分类参数名称
      },
      activeName: 'many', // Tabs组件默认绑定的
      // 商品分类列表
      cateList: [],
      dynamicData: [],
      staticData: [],
      // 级联选择器的配置选项
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: true
      },
      // 级联选择器绑定的数组
      selectedKeys: [1707, 1709, 1744] // TODO 临时数据
    }
  },
  created() {
    this.getCateList()
    this.getParamList() // TODO 临时数据
  },
  methods: {
    /* 提交删除的标签 */
    async deleteVal(row, $index, index) {
      /**
       * @param $index : 需要删除的属性的表格行数索引
       * @param index : 需要删除的标签的索引
      //  */
      this.valList[$index].splice(index, 1)
      const { data: res } = await this.axios.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name, // 属性的名字
          attr_sel: this.activeName, // 属性的类型[many或only]
          attr_vals: this.valList[$index].join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除标签失败')
      }
      this.getParamList()
      return this.$message.success('删除标签成功')
    },
    /* 显示输入框 */
    showInput(row) {
      row.inputVisible = true
      // $nextTick：当页面上的元素被重新渲染时，调用回调函数
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus() // 让input自动获得焦点
      })
    },
    /* 提交添加的标签 */
    async handleInputConfirm(row, $index) {
      if (this.inputValue[$index].trim().length === 0) {
        this.inputValue[$index] = ''
        row.inputVisible = false
        return
      }
      this.valList[$index].push(this.inputValue[$index].trim())
      row.inputVisible = false
      this.inputValue[$index] = ''
      const { data: res } = await this.axios.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name, // 新属性的名字
          attr_sel: this.activeName, // 属性的类型[many或only]
          attr_vals: this.valList[$index].join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('添加标签失败')
      }
      return this.$message.success('添加标签成功')
    },
    /* 编辑提交参数 */
    editParam() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 添加动态参数或者静态属性
        const { data: res } = await this.axios.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name, // 参数名称
            attr_sel: this.activeName // [only,many]
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类参数失败')
        }
        this.isEditDialogOn = false
        this.getParamList()
        return this.$message.success('修改分类参数成功')
      })
    },
    /* 关闭修改对话框事件 */
    editDialogClose() {
      // 清空修改参数的数据
      this.editForm = {}
      this.$refs.editFormRef.resetFields()
    },
    /* 打开修改对话框 */
    async openEditDialog(attrId) {
      // 根据ID查询参数
      const { data: res } = await this.axios.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类参数失败')
      }
      this.editForm = res.data
      this.isEditDialogOn = true
    },
    /* 打开删除对话框 */
    async openDeleteDialog(attrId) {
      const result = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err) // 取消将返回 'cancel'
      if (result !== 'confirm') {
        return this.$message('取消删除')
      }
      const { data: res } = await this.axios.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )
      if (res.meta.status !== 200) {
        return this.$message({
          message: '删除失败',
          type: 'error'
        })
      }
      this.getParamList()
      return this.$message({
        message: '删除成功',
        type: 'success'
      })
    },
    /* 添加动态参数或静态属性 */
    addParam() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 添加动态参数或者静态属性
        const { data: res } = await this.axios.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类参数失败')
        }
        this.isAddDialogOn = false
        this.getParamList()
        return this.$message.success('添加分类参数成功')
      })
    },
    /* 打开添加对话框+删除参数 */
    openAddDialog() {
      this.isAddDialogOn = true
    },
    /* 添加对话框关闭 */
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    /* 获取参数列表 */
    async getParamList() {
      const { data: res } = await this.axios.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类参数失败')
      }
      res.data.forEach((item, index) => {
        // 保存静态属性或动态参数的具体值
        this.valList[index] = item.attr_vals ? item.attr_vals.split(' ') : [] // 获取到的attr_vals是字符串，使用空格区分，这里转换为数组
        item.inputVisible = false // 控制文本框显示
        this.inputValue[index] = '' // 文本框中输入的值
      })
      /**
       * TODO 这里直接给this.valList赋值没有bug，但是使用forEach赋值会出现bug
       * 当删除tag标签时能够成功删除但是不能实时刷新。这里临时使用getParamList()方法刷新整个参数部分
       */
      if (this.activeName === 'many') {
        this.dynamicData = res.data
      } else {
        this.staticData = res.data
      }
    },
    tabClick(tab, event) {
      if (this.selectedKeys.length !== 3) {
        return this.$message.warning('请选择商品分类')
      }
      this.getParamList() // 每次切换选项卡时重新获取分类参数列表
    },
    /* 级联选择器值改变触发事件 */
    cateChange() {
      // 让用户不能选择非三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.dynamicData = []
        this.staticData = []
        return false
      }
      this.getParamList() // 每次更换商品分类时重新获取分类参数列表
    },
    /* 获取商品分类数据列表（全部） */
    async getCateList() {
      const { data: res } = await this.axios.get('/categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data
    }
  },
  computed: {
    /* 对话框的共用文本 */
    DialogText() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    },
    // 禁用状态 如果级联选择器选中了三级参数，则开启按钮
    btnDisabled() {
      return this.selectedKeys.length !== 3 // this.selectedKeys.length !== 3的返回值是一个 boolean不需要使用三元运算符
    },
    // 分类id
    cateId() {
      return this.selectedKeys.length === 3
        ? this.selectedKeys[this.selectedKeys.length - 1]
        : null
    }
  }
}
</script>

<style scoped lang="less">
.margin {
  margin-top: 20px;
  margin-bottom: 30px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 32px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
