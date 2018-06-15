import Vue from 'vue'
import Router from 'vue-router'
import Draw from '@/components/Draw'
import MainPanel from '@/components/MainPanel'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'MainPanel',
      component: MainPanel
    },
    {
      path: '/Draw',
      name: 'Draw',
      component: Draw
    }
  ]
})
