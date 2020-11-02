<template>
  <div>
    <!-- 导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/orders' }">订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input @keyup.native.enter="queryOrder" v-model="getParams.order.query" placeholder="请输入内容">
            <el-button @click="queryOrder" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="getData.orderList" border stripe>
        <el-table-column type="index" label="序号" width="50px">
        </el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="80px">
        </el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="100px">
          <template v-slot="scope">
            <el-tag size="medium" v-if="scope.row.pay_status === '0'" type="success">已付款</el-tag>
            <el-tag size="medium" v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="100px">
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="200px">
          <template v-slot="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template v-slot="scope">
            <el-button @click="openEditDialog(scope.row)" size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button @click="openLocationDialog(scope.row)" size="mini" type="success" icon="el-icon-location"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background @current-change="currentChange" @size-change="sizeChange" :page-size="getParams.order.pagesize" :page-sizes="[1, 2, 5, 10]" :current-page="getParams.order.pagenum" :total="getData.total" layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="45%" @close="editDialogClose">
      <div></div>
      <el-form :model="addressForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="addressForm.address1" :options="cityData"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button @click="editOrder" type="primary">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="locationDialogVisible" width="45%" @close="locationDialogClose">
      <el-timeline>
        <el-timeline-item v-for="(item, index) in getData.locationList" :key="index" :timestamp="item.time">
          {{item.context}}
        </el-timeline-item>
      </el-timeline>
      <div slot="footer">
        <el-button @click="locationDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="locationDialogVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data() {
    return {
      getParams: {
        // 订单数据列表
        order: {
          query: '',
          pagenum: 1,
          pagesize: 10,
          user_id: '',
          pay_status: '',
          is_send: '',
          order_fapiao_title: '',
          order_fapiao_company: '',
          order_fapiao_content: '',
          quconsignee_addrery: ''
        },
        curId: '' // 当前对话框对应的订单
      },
      getData: {
        total: 0, // 总页数
        orderList: [], // 订单列表
        locationList: []
      },
      putParams: {
        // 修改订单状态
        status: {
          id: '',
          is_send: '',
          order_pay: '',
          order_price: '',
          order_number: '',
          pay_status: ''
        }
      },
      putData: {},
      editDialogVisible: false,
      locationDialogVisible: false,
      editRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      addressForm: {
        address1: [],
        address2: ''
      },
      selectedKeys: [],
      cityData: cityData
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 查看物流信息
    async getLocation() {
      const { data: res } = await this.axios.get('/kuaidi/1106975712662')
      this.getData.locationList = res.data
    },
    locationDialogClose() {},
    openLocationDialog(row) {
      this.getLocation()
      this.locationDialogVisible = true
    },
    async editOrder(id) {
      const { data: res } = await this.axios.get(
        `orders/${this.getParams.curId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改失败')
      }
      this.getOrderList()
      this.editDialogVisible = false
      return this.$message.success('修改成功')
    },
    editDialogClose() {
      this.getParams.curId = ''
      this.$refs.editFormRef.resetFields()
    },
    openEditDialog(row) {
      this.getParams.curId = row.order_id
      this.editDialogVisible = true
    },
    queryOrder() {
      this.getParams.order.pagenum = 1 // 搜索时从第一页开始显示
      this.getOrderList()
    },
    currentChange(num) {
      this.getParams.order.pagenum = num
      this.getOrderList()
    },
    sizeChange(size) {
      this.getParams.order.pagenum = 1 // 切换每页大小时从第一页开始显示
      this.getParams.order.pagesize = size
      this.getOrderList()
    },
    async getOrderList() {
      const { data: res } = await this.axios.get('orders', {
        params: this.getParams.order
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据列表失败')
      }
      this.getData.total = res.data.total
      this.getData.orderList = res.data.goods
    }
  }
}
</script>

<style scoped lang="less">
.el-cascader {
  width: 100%;
}
</style>
