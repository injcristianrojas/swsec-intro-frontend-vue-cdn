const { createApp, ref, onMounted, onUnmounted } = Vue

const eventBus = mitt();

const Home = { template: '<div><h1>Home</h1><p>This is home page</p></div>' }
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
            localStorage.setItem('jwttoken', token);
        }
    }
}
const Menu = {
    template: `
        <ul v-if="isVisible">
            <li><a title="Home" id="home" href="#">Home</a></li><li>|</li>
            <li><a title="Usuarios" id="users" href="#">Usuarios</a></li><li>|</li>
            <li><a title="Muro" id="wall" href="#">Muro</a></li><li>|</li>
            <li><a title="Salir" id="exit" href="#" @click="hideComponent">Salir</a></li>
        </ul>
    `,
    setup() {
        const isVisible = ref(false)

        onMounted(() => {
            eventBus.on('toggleComponent', (visibility) => {
                isVisible.value = visibility;
            });
        });

        onUnmounted(() => {
            eventBus.off('toggleComponent');
        });

        const hideComponent = () => {
            eventBus.emit('toggleComponent', false);
        };

        return { isVisible, hideComponent }
    }
}

const routes = [
    { path: '/', component: Login },
    { path: '/login', component: Login },
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