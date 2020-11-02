<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="logo_box">
        <img src="../assets/login_logo.png" alt="图片" />
      </div>
      <!-- 登录的表单区域 -->
      <el-form :model="loginForm" :rules="rulesForm" ref="loginForm" label-width="0px" class="login_form">
        <!-- 用户名输入框 -->
        <el-form-item prop="username">
          <el-input placeholder="用户名（3-5字符）" v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input placeholder="密码（6-15字符）" type="password" v-model="loginForm.password" prefix-icon="el-icon-lock" show-password></el-input>
        </el-form-item>
        <!-- 登录和重置按钮 -->
        <el-form-item class="btn">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loginForm: {
        username: 'admin', // 用户名
        password: '123456' // 密码
      },
      rulesForm: {
        // 配置表单验证规则
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置登录表单
    resetForm () {
      this.$refs.loginForm.resetFields()
      this.$alert('<center>重置成功</center>', '', {
        // 使用MessageBox.alert组件
        confirmButtonText: '确定', // 确认按钮
        dangerouslyUseHTMLString: true // 将 message 属性作为 HTML 片段处理
      })
    },
    /**
     * 点击登录按钮完成的操作：
     * 成功：1.验证表单信息>2.发起axios请求，http请求成功>3.登录请求成功>4.保存token，跳转页面。
     * 失败：1.由组件处理>2.返回信息>3.返回信息
     */
    login () {
      this.$refs.loginForm.validate(valid => {
        if (!valid) return // 表单验证失败
        // 表单验证成功
        this.axios.post('login', this.loginForm).then(res => {
          if (res.status !== 200) return this.$message.error('http请求失败') // 使用Messaget组件
          // http请求成功
          res = res.data
          // 登录请求成功
          if (res.meta.status !== 200) return this.$message.error('登录失败')
          this.$message.success('登录成功')
          window.sessionStorage.setItem('token', res.data.token) // 将登录成功后服务器返回的token值存储到sessionStorage
          this.$router.push('/home') // 登录成功后跳转到home页面
        })
      })
    }
  }
}
</script>

<style scoped lang="css">
/** 登录界面最外层 */
.login_container {
  background-color: #2b4b6b;
  height: 100%; /** 高度充满全屏 */
}

/**登录盒子 */
.login_box {
  width: 450px;
  height: 320px;
  background-color: #fff;
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 5%;
}

/** 登录界面图标盒子 */
.logo_box {
  left: 50%;
  transform: translate(-50%, -50%);
  height: 130px;
  width: 130px;
  border-radius: 50%;
  border: 1px solid #eee;
  padding: 10px;
  box-shadow: 0 0 30px #ddd;
  background-color: #fff;
  position: absolute;
}

/** 登录界面图标 */
div.login_box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}

/** 登录表单元素 */
.login_form {
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box; /** 设置盒子模型为IE标准 */
  position: absolute;
  bottom: 0;
}
/** 登录界面按钮 */
.btn {
  display: flex;
  justify-content: flex-end;
}
</style>
