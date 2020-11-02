<template>
  <div>
    <!-- 导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col>
          <!-- 添加分类按钮 -->
          <el-button @click="openAddDialog" type="primary" class="bottom">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table border :show-index="true" index-text="序号" :expand-type="false" :selection-type="false" :data="cateList" :columns="columns">
        <template v-slot:isok="scope">
          <i v-if="!scope.row.cat_deleted" class="el-icon-success"></i>
          <i v-else class="el-icon-error"></i>
        </template>
        <template v-slot:sort="scope">
          <el-tag size="mini" type="primary" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template v-slot:option="scope">
          <!-- 编辑按钮 -->
          <el-button @click="openUpdateDialog(scope.row.cat_id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <!-- 删除按钮 -->
          <el-button @click="openDeleteDialog(scope.row.cat_id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区 -->
      <el-pagination background @current-change="CurrentChange" @size-change="SizeChange" :current-page="getListParam.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="getListParam.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="isAddDialogOn" width="45%" @close="addDialogClosed">
      <el-form ref="addForm" :model="addForm" label-width="100px" :rules="addRules">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader clearable :props="cascaderProps" :options="parentCateList" v-model="selectedKeys" @change="cascaderChanged">
          </el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <div slot="footer">
        <el-button @click="isAddDialogOn = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑的对话框 -->
    <el-dialog title="编辑" :visible.sync="isUpdateDialogOn" width="45%" @close="updateDialogClosed">
      <el-form :rules="addRules" ref="updateForm" :model="updateForm" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="updateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <div slot="footer">
        <el-button @click="isUpdateDialogOn = false">取 消</el-button>
        <el-button type="primary" @click="updateCategory">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [], // 商品分类列表
      parentCateList: [], // 父级分类的列表
      total: 0, // 总页数
      // 请求参数
      getListParam: {
        type: 3, // 1，2，3 分别表示显示一层二层三层分类列表
        pagenum: 1, // 当前页数
        pagesize: 5 // 每页大小
      },
      // tree-table的列定义
      columns: [
        {
          label: '分类名称', // 列名
          prop: 'cat_name' // 列值
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template', // 表示将当前列定义为模板列
          template: 'isok' // 当前这一列使用的模板名称
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          prop: '',
          type: 'template',
          template: 'option'
        }
      ],
      isAddDialogOn: false, // 控制添加对话框的开启
      isUpdateDialogOn: false, // 控制修改对话框的开启
      // 添加分类的表单数据
      addForm: {
        cat_pid: 0, // 分类父 ID
        cat_name: '', // 分类名称：与input表单绑定
        cat_level: 0 // 分类层级
      },
      // 添加分类的验证规则
      addRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          {
            require: true,
            min: 1,
            max: 10,
            message: '长度在 1 到 10 个字符',
            trigger: 'blur'
          }
        ],
        cat_level: []
      },
      // 级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id', // 选中项绑定值
        label: 'cat_name', // 显示的名称
        children: 'children', // 子分类
        expandTrigger: 'hover', // 鼠标放置自动切换
        checkStrictly: true // 父级分类是否可选
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 编辑的表单数据
      updateForm: {}
    }
  },
  created() {
    this.getCateList()
    this.getParentCateList()
  },
  methods: {
    /* 打开删除对话框 */
    async openDeleteDialog(id) {
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
        return this.$message.info('取消删除分类')
      }
      const { data: res } = await this.axios.delete(`/categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      this.getCateList()
      this.getParentCateList()
      return this.$message.success('删除分类成功')
    },
    /* 提交编辑修改的内容 */
    updateCategory() {
      this.$refs.updateForm.validate(async valid => {
        if (!valid) return
        const {
          data: res
        } = await this.axios.put(`/categories/${this.updateForm.cat_id}`, {
          cat_name: this.updateForm.cat_name
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类失败')
        }
        this.getCateList()
        this.getParentCateList()
        this.isUpdateDialogOn = false
        return this.$message.success('修改分类成功')
      })
    },
    async openUpdateDialog(id) {
      const { data: res } = await this.axios.get(`/categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类失败')
      }
      this.updateForm = res.data
      this.isUpdateDialogOn = true // 打开编辑对话框
    },
    /* 获取商品分类数据列表（3层） */
    async getCateList() {
      const { data: res } = await this.axios.get('categories', {
        params: this.getListParam
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.total = res.data.total
      this.cateList = res.data.result
    },
    /* 获取商品分类数据列表（2层） */
    async getParentCateList() {
      // TODO 可以和getCateList合并
      const { data: res } = await this.axios.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败')
      }
      this.parentCateList = res.data
    },
    /* 当前页码改变 */
    CurrentChange(num) {
      this.getListParam.pagenum = num
      this.getCateList()
    },
    /* 每页显示个数改变 */
    SizeChange(size) {
      this.getListParam.pagesize = size
      this.getCateList()
    },
    openAddDialog() {
      this.isAddDialogOn = true // 打开添加分类对话框
    },
    addDialogClosed() {
      // 重置所有对话框中的数据
      this.addForm = {
        cat_pid: 0, // 分类父 ID
        cat_name: '', // 分类名称：与input表单绑定
        cat_level: 0 // 分类层级
      }
      this.selectedKeys = []
      this.$refs.addForm.resetFields() // 重置表单
    },
    updateDialogClosed() {
      this.$refs.updateForm.resetFields() // 重置表单
    },
    /* 添加分类 */
    addCategory() {
      this.$refs.addForm.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.axios.post('/categories', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.getCateList()
        this.getParentCateList()
        this.isAddDialogOn = false
        return this.$message.success('添加分类成功')
      })
    },
    /* 级联选择器选中项改变 */
    cascaderChanged() {
      // 如果 selectedKeys数组中的length > 0 则说明选中了父级分类，否则则没选中
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        // 当选择器选择的内容被清空时，同时清空addForm的数据
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    }
  }
}
</script>

<style scoped lang="less">
.bottom {
  margin-bottom: 20px;
}
.el-icon-success,
.el-icon-error {
  color: rgb(5, 173, 5);
}
.el-cascader {
  width: 100%;
}
</style>
