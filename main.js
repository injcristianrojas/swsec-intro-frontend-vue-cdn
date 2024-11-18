const { createApp, ref, onMounted, onUnmounted } = Vue

const JWTNAME = 'jwttoken'

const eventBus = mitt();

const getToken = () => {
  return localStorage.getItem(JWTNAME);
}
const jwtSet = () => getToken !== null;

const Login = {
  template: `
        <form @submit.prevent="login" ref="loginForm">
        <table>
            <tbody>
            <tr>
                <td>Usuario: </td>
                <td><input type="text" ref="username" /></td>
            </tr>
            <tr>
                <td>Password: </td>
                <td><input type="password" ref="password" /></td>
            </tr>
            <tr>
                <td>&nbsp;</td>
                <td><input type="submit" name="submit" value="Ingresar" /></td>
            </tr>
            </tbody>
        </table>
        </form>
    `,
  methods: {
    login: function () {
      axios.post(
        'http://127.0.0.1:9000/api/v2/login',
        {
          username: this.$refs.username.value,
          password: this.$refs.password.value,
        }
      ).then(
        res => {
          this.setToken(res.data.token);
          eventBus.emit('toggleComponent', true);
          this.$refs.loginForm.reset();
          this.$router.push('Welcome');
        }
      ).catch((error) => {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          alert('Error while logging in.')
        }
      });
    },
    setToken: function (token) {
      localStorage.setItem(JWTNAME, token);
    }
  }
}

const Menu = {
  template: `
    <ul v-if="isVisible">
      <li><a title="Home" id="home" href="/#/welcome">Home</a></li><li>|</li>
      <li><a title="Usuarios" id="users" href="/#/users">Usuarios</a></li><li>|</li>
      <li><a title="Muro" id="wall" href="/#/wall">Muro</a></li><li>|</li>
      <li><a title="Salir" id="exit" href="#" @click="logOut">Salir</a></li>
    </ul>
    <ul v-else>
      <li><a title="Welcome" id="welcome" href="/">Home</a></li>
    </ul>
  `,
  setup() {
    const isVisible = ref(jwtSet);

    onMounted(() => {
      eventBus.on('toggleComponent', (visibility) => {
        isVisible.value = visibility;
      });
    });

    onUnmounted(() => {
      eventBus.off('toggleComponent');
    });

    const logOut = () => {
      eventBus.emit('toggleComponent', false);
      localStorage.removeItem(JWTNAME);
    };

    return { isVisible, logOut }
  }
}

const Users = {
  template: `
        <div>
            <!-- Check if data is available -->
            <div v-if="rows">
                <!-- Iterate over the JSON object (array of objects) -->
                <table>
                    <thead>
                        <tr>
                            <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in rows" :key="index">
                            <td>{{ item.username }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else>
                <p>Cargando información...</p>
            </div>
        </div>
    `,
  data() {
    return {
      headers: ['Usuarios'],
      rows: []
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      fetch(
        'http://127.0.0.1:9000/api/v2/users/type/2',
        {
          method: "GET",
          headers: { "Authorization": `Bearer ${getToken()}` }
        }
      )
        .then(res => res.json())
        .then(
          (result) => {
            this.rows = result
            console.log(result)
          },
          (error) => {
            console.log(error)
          }
        )
    }
  }
}

const Wall = {
  template: `
        <div>
            <form @submit.prevent="postMessage">
                <input type="text" ref="message" />
                <input type="submit" value="Postear" />
            </form>
            <!-- Check if data is available -->
            <div v-if="rows">
                <!-- Iterate over the JSON object (array of objects) -->
                <table>
                    <thead>
                        <tr>
                            <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in rows" :key="index">
                            <td v-html="item.message"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else>
                <p>Cargando información...</p>
            </div>
        </div>
    `,
  data() {
    return {
      headers: ['Mensajes'],
      rows: [],
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      fetch(
        'http://127.0.0.1:9000/api/v2/messages',
        {
          method: "GET",
          headers: { "Authorization": `Bearer ${getToken()}` }
        }
      )
        .then(res => res.json())
        .then(
          (result) => {
            this.rows = result
            console.log(result)
          },
          (error) => {
            console.log(error)
          }
        )
    },
    postMessage() {
      axios.post(
        'http://127.0.0.1:9000/api/v2/messages/add',
        {
          'message': this.$refs.message.value
        },
        {
          headers: { "Authorization": `Bearer ${getToken()}` }
        }
      ).then(
        res => {
          console.log(res)
          this.fetchData()
        }
      ).catch((error) => {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
        }
      });
    },
  }
}

const Welcome = {
  template: `
    <p>Este es el sitio de Fans de Aves Chilenas. Bienvenido.</p>
  `
}

const routes = [
  { path: '/', component: Login },
  { path: '/users', component: Users },
  { path: '/wall', component: Wall },
  { path: '/welcome', component: Welcome },
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
})

const app = Vue.createApp({})
app.use(router)
app.mount('#app')

const menu = Vue.createApp(Menu)
menu.mount('#menu')
