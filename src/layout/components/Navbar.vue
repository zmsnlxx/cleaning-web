<template>
  <div class="navbar">
   <!-- <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" /> -->

   <!-- <breadcrumb class="breadcrumb-container" /> -->
    <el-select class="title" v-model="orgid" @change="changeOrg">
      <el-option
        v-for="item in org"
        :key="item.value"
        :label="item.orgname"
        :value="item.orgid">
      </el-option>
    </el-select>

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img src="../../../public/img/head.jpg" class="user-avatar" alt="">
          <span class="name">{{ name }}</span>
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出登陆</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { orgChange } from '@/api/org'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      orgid: ''
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'name', 'org'])
  },
  async mounted() {
    this.orgid = this.org[0].orgid
    orgChange({ orgid: this.orgid }).then(() =>  {
      this.$store.dispatch('app/setOrg', this.orgid)
    })
  },
  methods: {
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    changeOrg(orgid) {
      console.log(orgid)
      orgChange({ orgid }).then(() =>  {
        this.$store.dispatch('app/setOrg', this.orgid)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .title {
    line-height: 50px;
    font-weight: 600;
    color: #000000;
    font-size: 18px;
    display: inline-block;
    margin-left: 24px;
  }

  .name {
    color: #000000;
    font-size: 16px;
    font-weight: 600;
  }
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        height: 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          margin: 0 10px;
        }
      }
    }
  }
}
</style>
