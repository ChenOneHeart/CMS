<template>
  <div>
    <!-- 导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert center show-icon title="添加商品信息" type="info"> </el-alert>
      <el-steps align-center :active="Number(activeStep)" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form label-position="top" :rules="addFormRules" ref="addFormRef" :model="postParams">
        <!-- 选项卡 -->
        <el-tabs @tab-click="tabClick" v-model="activeStep" tab-position="left" :before-leave="beforeLeave">
          <!-- 基本信息 -->
          <el-tab-pane name="0" label="基本信息">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="postParams.goods_name" placeholder="name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="postParams.goods_price" placeholder="0"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="postParams.goods_weight" placeholder="0"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="postParams.goods_number" placeholder="0"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader @change="cascaderChange" v-model="postParams.goods_cat" :props="cascaderProps" :options="getData.cateList">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane name="1" label="商品参数">
            <!-- 分别为每项创建一个表单 -->
            <el-form-item v-for="(item,index) in getData.manyData" :label="item.attr_name" :key="index">
              <!-- 每一行的复选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox size="small" border v-for="(item,index) in item.attr_vals" :label="item" :key="index">
                </el-checkbox>
              </el-checkbox-group>
              <!-- <el-tag v-for="(item,index) in item.attr_vals.split(' ')" :key="index" type="success">{{ item }}</el-tag> -->
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性 -->
          <el-tab-pane name="2" label="商品属性">
            <el-form-item :label="item.attr_name" v-for="(item, index) in getData.onlyData" :key="index">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片 -->
          <el-tab-pane name="3" label="商品图片">
            <el-upload :on-success="handleSuccess" :headers="headers" list-type="picture" :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" multiple :limit="3">
              <el-button size="small" type="primary">点击上传</el-button>
              <span slot="tip" style="fontSize:12px;marginLeft:10px">(只能上传jpg/png文件，且不超过500kb)</span>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容 -->
          <el-tab-pane name="4" label="商品内容">
            <quill-editor v-model="postParams.goods_introduce"></quill-editor>
            <el-button @click="addGood" type="primary" size="medium">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="图片预览" width="45%" :visible.sync="previewDialogVisible" @close="previewDialogClose">
      <img width="100%" :src="pictureURL" alt="图片">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // get请求获取的参数
      getData: {
        cateList: [],
        manyData: [],
        onlyData: []
      },
      activeStep: '4', // 激活的步骤条 TODO 临时数据
      // post请求提交的参数
      postParams: {
        //  TODO 临时数据
        goods_name: 'name', // 商品名称
        goods_cat: [1707, 1709, 1744], // 以为’,'分割的分类列表
        goods_price: 10, // 商品价格
        goods_number: 10, // 商品数量
        goods_weight: 10, // 商品重量
        goods_introduce: '', // 介绍
        pics: [], // 上传的图片临时路径（对象）
        attrs: [] // 商品的参数（数组），包含 动态参数 和 静态属性
      },
      // 添加表带的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id', // 分类ID
        label: 'cat_name', // 分类名称
        children: 'children'
      },
      uploadURL: 'https://www.liulongbin.top:8888/api/private/v1/upload', // 图片上传的地址
      // 图片上传的请求头
      headers: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewDialogVisible: false, // 预览对话框
      pictureURL: ''
    }
  },
  created() {
    this.getCateList()
    this.tabClick() // TODO delete
  },
  methods: {
    addGood() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 调用lodash的cloneDeep进行深拷贝，直接修改goods_cat会导致绑定在级联选择器上的数组变成字符串从而报错
        const params = _.cloneDeep(this.postParams)
        params.goods_cat = params.goods_cat.join(',')
        // 将postParams处理成符合规范的提交参数
        this.getData.manyData.forEach(item => {
          const attrObject = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.postParams.attrs.push(attrObject)
        })
        this.getData.onlyData.forEach(item => {
          const attrObject = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.postParams.attrs.push(attrObject)
        })
        params.attrs = this.postParams.attrs
        const { data: res } = await this.axios.post('goods', params)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    },
    previewDialogClose() {},
    // 图片上传成功的钩子，
    handleSuccess(response) {
      // pics的格式  [{"pic":"/tmp_uploads/30f08d52c551ecb447277eae232304b8"},...]
      const picObject = {
        pic: response.data.tmp_path
      }
      this.postParams.pics.push(picObject)
    },
    // 图片预览
    handlePreview(file) {
      this.pictureURL = file.response.data.url
      this.previewDialogVisible = true
    },
    // 图片移除
    handleRemove(file, fileList) {
      /*
       1.获取将要删除的图片的路径
       2.从pics数组中找到图片对应的索引
       3.调用splice方法删除数组中的元素
       */
      // file.response.data.tmp_path: "tmp_uploads\bf06c2ecbafd8029732e834405a6ae3b.jpg"
      const filePath = file.response.data.tmp_path
      const index = this.postParams.pics.findIndex(
        // item : {"pic":"/tmp_uploads/30f08d52c551ecb447277eae232304b8"}
        item => item.pic === filePath
      )
      this.postParams.pics.splice(index, 1)
    },
    // tab 被选中时触发的钩子函数
    async tabClick() {
      // 获取动态参数
      if (this.activeStep === '1') {
        const { data: res } = await this.axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        // 将attr_vals从字符串转换为数组
        res.data.forEach(item => {
          if (item.attr_vals) {
            item.attr_vals = item.attr_vals.split(' ')
          } else {
            item.attr_vals = []
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败')
        }
        this.getData.manyData = res.data
      } else if (this.activeStep === '2') {
        // 获取静态属性
        const { data: res } = await this.axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败')
        }
        this.getData.onlyData = res.data
      } else {
      }
    },
    // 切换选项卡前的钩子
    beforeLeave(activeName, oldActiveName) {
      // 如果表单验证成功，则允许切换选项卡
      let flag = true
      this.$refs.addFormRef.validate(valid => {
        if (!valid) {
          flag = false
          this.$message.error('请填写完整的商品信息')
        }
      })
      return flag
    },
    cascaderChange(value) {
      // 禁止选择非三级分类
      if (value.length !== 3) {
        this.postParams.goods_cat = []
        return false
      }
    },
    // 获取商品分类数据列表（不传参）
    async getCateList() {
      const { data: res } = await this.axios.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据列表失败')
      }
      this.getData.cateList = res.data
    }
  },
  computed: {
    cateId() {
      return this.postParams.goods_cat.length === 3
        ? this.postParams.goods_cat[2]
        : null
    }
  }
}
</script>

<style scoped lang="less">
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.quill-editor {
  margin-bottom: 20px;
}
</style>
