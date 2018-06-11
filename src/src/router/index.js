import Vue from 'vue'
import Router from 'vue-router'
import Draw from '@/components/Draw'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Draw',
      component: Draw
    }
  ]
})
