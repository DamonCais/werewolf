import Vuex from '@wepy/x';

export default new Vuex.Store({
  state: {
    counter: 0,
    bgColor: 'bg-gradual-blue',
    bgClass: '',
    StatusBar: 0,
  },
  mutations: {
    increment (state) {
      state.counter++;
    },
    decrement (state) {
      state.counter--;
    },
    setStatusBar(state,StatusBar){
      console.log(StatusBar)
      state.StatusBar = StatusBar;
    }
  },
  actions: {
    increment ({ commit }) {
      commit('increment');
    },
    decrement ({ commit }) {
      commit('decrement');
    },
    incrementAsync ({ commit }) {
      setTimeout(() => {
        commit('increment');
      }, 1000);
    }
  }
});
