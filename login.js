import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', async () => {
    let ApiKey = "";
    let AuthDomain = "";
    let ProjectId = "";
    let StorageBucket = "";
    let MessagingSenderId = "";
    let AppId = "";

    async function fetchAuthentications() {
        try {
            let response = await fetch('http://127.0.0.1:5001/authentications');
            let data = await response.json();
            ApiKey = data.apiKey;
            AuthDomain = data.authDomain;
            ProjectId = data.projectId;
            StorageBucket = data.storageBucket;
            MessagingSenderId = data.messagingSenderId;
            AppId = data.appId;

            const firebaseConfig = {
                apiKey: ApiKey,
                authDomain: AuthDomain,
                projectId: ProjectId,
                storageBucket: StorageBucket,
                messagingSenderId: MessagingSenderId,
                appId: AppId
            };

            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);

            const loginForm = document.querySelector('#login-form');
            const registerForm = document.querySelector('#register-form');
            const showRegister = document.querySelector('#show-register');
            const showLogin = document.querySelector('#show-login');
            const loginerror = document.querySelector('#loginerror');
            const registererrror = document.querySelector('#registererror');
            const input1 = document.querySelector('.input1');
            const input2 = document.querySelector('.input2');
            const input11 = document.querySelector('.input11');
            const input22 = document.querySelector('.input22');

            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                loginForm.style.display = 'none';
                registerForm.style.display = 'flex';
            });

            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                registerForm.style.display = 'none';
                loginForm.style.display = 'flex';
            });

            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = loginForm.querySelector('#Email').value;
                const password = loginForm.querySelector('#password').value;

                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        console.log('Logged in as: ', user.email);
                        window.location.replace('index.html');
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        console.log(errorCode);
                        const errorMessage = error.message;
                        console.log(errorMessage);
                        loginerror.innerHTML = "Invalid email or password";
                        input1.style.border = '3px solid red';
                        input11.style.border = '3px solid red';
                        setInterval(() => {
                            loginerror.innerHTML = "";
                            input1.style.border = '2px solid black';
                            input11.style.border = '2px solid black';
                            email.innerHTML = "";
                            password.innerHTML = "";
                        }, 3000);

                    });
            });

            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = registerForm.querySelector('#Email1').value;
                const password = registerForm.querySelector('#password1').value;

                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        console.log('Registered as: ', user.email);
                        window.location.replace('index.html');
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        console.log(errorCode);
                        const errorMessage = error.message;
                        console.log(errorMessage);
                        registererrror.innerHTML = "Invalid Password 8 Characters";
                        input2.style.border = '2px solid red';
                        input22.style.border = '2px solid red';
                        setInterval(() => {
                            registererrror.innerHTML = "";
                            input2.style.border = '2px solid black';
                            input22.style.border = '2px solid black';
                            email.innerHTML = "";
                            password.innerHTML = "";
                        }, 3000);
                    });
            });
        } catch (error) {
            console.error("Error fetching authentications:", error);
        }
    }

    await fetchAuthentications();
});