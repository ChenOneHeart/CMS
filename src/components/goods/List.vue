<template>
  <div>
    <!-- 导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 主体区 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="getParams.query" @keyup.native.enter="queryGood" @clear="queryGood" clearable placeholder="请输入内容">
            <el-button @click="getGoodList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品 -->
        <el-col :span="5">
          <!-- 添加商品的按钮 -->
          <el-button @click="goAddPage" type='primary'>添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表 -->
      <el-table border stripe :data="getData.goodList" style="width: 100%">
        <el-table-column type="index" label="序号" width="50px">
        </el-table-column>
        <el-table-column prop="goods_name" label="商品名称">
        </el-table-column>
        <el-table-column prop="goods_price" label="商品价格" width="80px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80px">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="170px">
          <template v-slot="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot="scope">
            <!-- 修改商品的按钮 -->
            <el-button @click="openUpdateDialog(scope.row)" type="primary" size="mini" icon="el-icon-edit"></el-button>
            <!-- 删除商品的按钮 -->
            <el-button @click="openDeleteDialog(scope.row.goods_id)" type="danger" size="mini" icon="el-icon-delete"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination background @current-change="currentChange" @size-change="sizeChange" :page-size="getParams.pagesize" :page-sizes="[1, 2, 5, 10]" :current-page="getParams.pagenum" :total="getData.total" layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </el-card>
    <!-- 修改商品的对话框 -->
    <el-dialog title="修改商品" :visible.sync="updateDialogVisible" width="65%" close="updateDialogClose">
      <el-form ref="updateFormRef" :rules="updataRules" :model="putParams.updateData" label-width="100px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="putParams.updateData.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="putParams.updateData.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="putParams.updateData.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="putParams.updateData.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="updateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateGood">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // get请求的参数
      getParams: {
        query: '', // 查询参数
        pagenum: 1, // 当前页码
        pagesize: 10 // 每页显示条数
      },
      // get请求接收的数据
      getData: {
        total: 0, // 总共商品条数
        goodList: [], // 商品数据列表
        goodData: {} // 根据id查询到的单个商品数据
      },
      putParams: {
        id: 0,
        updateData: {
          goods_name: '',
          goods_price: '',
          goods_number: '',
          goods_weight: '',
          goods_introduce: '',
          pics: '',
          attrs: []
        }
      },
      addDialogVisible: false,
      updateDialogVisible: false,
      updataRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getGoodList()
  },
  methods: {
    queryGood() {
      this.getParams.pagenum = 1 // 将页码重置，防止当前页码不是第一页无法显示查询到的数据
      this.getGoodList()
    },
    sizeChange(size) {
      this.getParams.pagenum = 1
      this.getParams.pagesize = size
      this.getGoodList()
    },
    currentChange(num) {
      this.getParams.pagenum = num
      this.getGoodList()
    },
    async updateGood() {
      const { data: res } = await this.axios.put(
        `goods/${this.putParams.id}`,
        this.putParams.updateData
      )
      if (res.meta.status !== 200) {
        this.updateDialogVisible = false
        return this.$message.error('接口不存在')
      }
      this.getGoodList()
      this.updateDialogVisible = false
    },
    goAddPage() {
      this.$router.push('/goods/add')
    },
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
        return this.$message.info('取消删除')
      }
      const { data: res } = await this.axios.delete(`goods/${id}`) // TODO
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.getGoodList()
      return this.$message.success('删除成功')
    },
    openUpdateDialog(row) {
      this.putParams.id = row.goods_id
      this.getGood(row.goods_id)
      this.updateDialogVisible = true
    },
    // 关闭修改商品对话框
    updateDialogClose() {
      this.$refs.updateFormRef.resetFields()
    },
    async getGood(id) {
      const { data: res } = await this.axios.get(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询商品失败')
      }
      this.putParams.updateData.goods_name = res.data.goods_name
      this.putParams.updateData.goods_price = res.data.goods_price
      this.putParams.updateData.goods_number = res.data.goods_number
      this.putParams.updateData.goods_weight = res.data.goods_weight
      this.putParams.updateData.goods_introduce = res.data.goods_introduce
      this.putParams.updateData.pics = res.data.pics
      this.putParams.updateData.attrs = res.data.attrs
      this.getData.goodData = res.data
    },
    // 获取商品列表数据
    async getGoodList() {
      const { data: res } = await this.axios.get('goods', {
        params: this.getParams
      })
      this.getData.goodList = res.data.goods // 保存参数 goods
      this.getData.total = res.data.total // 保存参数 total
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
    }
  }
}
</script>

<style scoped lang="less">
</style>
