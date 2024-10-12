const Login = {
    template: `
        <form @submit.prevent="login">
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
                    //ReactDOM.render(<MenuLogged />, document.getElementById('menu'));
                    //ReactDOM.render(<Welcome />, document.getElementById('root'));
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

