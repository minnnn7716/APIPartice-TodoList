// 登入註冊
const apiUrl = 'https://todoo.5xcamp.us';
const form = document.forms['logoAndSign'];
let token;
let key = {};

checkToken();
submitClickEvent();

// 判斷目前是否登入並切換頁面
function judgePage() {
    const logoAndSign = document.querySelector('.logoAndSign');
    const todoList = document.querySelector('.todoList');
    const userName = document.querySelector('.userName');

    if (localStorage.getItem('token')) {
        logoAndSign.style.display = 'none';
        todoList.style.display = 'block';
        userName.innerHTML = localStorage.getItem('name');
        getList();
    } else {
        logoAndSign.style.display = 'block';
        todoList.style.display = 'none';
        renderForm(judgeForm());
    }
}

// 判斷目前是「登入 / 註冊」並切換表單
function judgeForm() {
    let formStatu = form.dataset.form;
    let inputObj;

    if (formStatu === 'log') {
        inputObj = {
            email: {
                type: 'email',
                name: 'Email'
            },
            password: {
                type: 'password',
                name: '密碼'
            },
            btn: ['登入', '註冊帳號']
        }
    } else if (formStatu === 'sign') {
        inputObj = {
            email: {
                type: 'email',
                name: 'Email'
            },
            nickname: {
                type: 'text',
                name: '暱稱'
            },
            password: {
                type: 'password',
                name: '密碼'
            },
            passwordAgain: {
                type: 'password',
                name: '再次輸入密碼'
            },
            btn: ['註冊帳號', '登入']
        }
    }

    return inputObj;
}

// 渲染「登入 / 註冊」的表單
function renderForm(obj) {
    let inputStr = '';
    let btnStr = '';

    for (const key in obj) {
        if (key !== 'btn') {
            let placeholderText = key === 'passwordAgain' ? obj[key].name : `請輸入${obj[key].name}`;

            inputStr += `
        <div>
            <label for="${key}">${obj[key].name}</label>
            <input type="${obj[key].type}" id="${key}" name="${key}" placeholder="${placeholderText}">
            <p class="remind">此欄位不可為空</p>
        </div>
        `
        } else {
            btnStr = `
            <input class="btn-bg mb-3" type="submit" value="${obj[key][0]}">
            <a href="#" class="btn-text">${obj[key][1]}</a>
            `
        }
    }

    document.querySelector(".userInforInputs").innerHTML = inputStr;
    document.querySelector(".formbtn").innerHTML = btnStr;

    changeFormClickEvent();
}

// 監聽按鈕切換「登入 / 註冊」
function changeFormClickEvent() {
    let changeFormBtn = document.querySelector('.btn-text');

    changeFormBtn.addEventListener('click', e => {
        e.preventDefault();

        if (e.target.innerHTML === '註冊帳號') {
            form.dataset.form = 'sign'
        } else if (e.target.innerHTML === '登入') {
            form.dataset.form = 'log'
        }

        renderForm(judgeForm());
    })
}

// 驗證送出的表單欄位是否符合規範
function verifyInput() {
    let obj;

    // 若未給予空字串，在尚未通過驗證寫入資料前，206 行會報錯，因無法針對 undefined 的值使用 trim()
    let loginPassword = "";
    let comfirmPassword = "";

    // 驗證規則
    let verifyObj = {
        email: {
            content: '@',
            fn: function (input) {
                if (!input.includes(this.content)) {
                    return `格式不正確，須包含 ${this.content}`;
                }

                return true;
            }
        },
        nickname: {
            minlength: 3,
            fn: function (input) {
                if (input.length < this.minlength) {
                    return `長度需大於 ${this.minlength}`;
                }

                return true;
            }
        },
        password: {
            minlength: 6,
            fn: function (input) {
                if (input.length < this.minlength) {
                    return `長度需大於 ${this.minlength}`;
                }

                loginPassword = input;
                return true;
            }
        },
        passwordAgain: {
            minlength: 6,
            fn: function (input) {
                if (input.length < this.minlength) {
                    return `長度需大於 ${this.minlength}`;
                }

                if (input !== form['password'].value) {
                    return `兩次輸入密碼不相符`;
                }

                comfirmPassword = input;
                return true;
            }
        }
    }

    // 驗證輸入框不得為空與長度及是否包含指定內容
    for (let i = 0; i < form.length - 1; i++) {
        if (form[i].value.trim() === "") {
            form[i].classList.add('errorInput');
            form[i].nextElementSibling.innerHTML = '此欄位不得為空';
        } else if (verifyObj[form[i].name].fn(form[i].value) !== true) {
            form[i].classList.add('errorInput');
            form[i].nextElementSibling.innerHTML = verifyObj[form[i].name].fn(form[i].value);

        } else {
            form[i].classList.remove('errorInput');
        }
    }

    // 區分不同頁面需推送的物件資料
    if (form.dataset.form === 'log') {
        obj = {
            "user": {
                "email": form['email'].value,
                "password": loginPassword
            }
        }
    } else if (form.dataset.form === 'sign') {
        obj = {
            "user": {
                "email": form['email'].value,
                "nickname": form['nickname'].value,
                "password": comfirmPassword
            }
        }
    }

    for (const [key, value] of Object.entries(obj.user)) {
        if (!value.trim()) return false;
    }

    return obj;
}

// 監聽按鈕送出「登入 / 註冊」的表單
function submitClickEvent() {
    form.addEventListener('submit', e => {
        e.preventDefault();

        let obj = verifyInput() ? verifyInput() : false;

        if (obj) {
            if (form.dataset.form === 'sign') signupPost(obj);
            if (form.dataset.form === 'log') loginPost(obj);
        }
    })
}

// 登入權限測試
function checkToken() {
    axios.get(`${apiUrl}/check`, {
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    })
        .then(function (res) {
            console.log('權限通過');
            token = localStorage.getItem('token');
            key = {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            }
            judgePage();
        })
        .catch(function (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('name');
            judgePage();
        })
}

// axios 註冊 api
function signupPost(obj) {
    axios.post(`${apiUrl}/users`, obj)
        .then(function (res) {
            localStorage.setItem('token', res.headers.authorization);
            localStorage.setItem('name', res.data.nickname);
            alert('註冊成功！將保持登入狀態轉跳至您的待辦清單 ^__^/');
            checkToken();
        })
        .catch(function (error) {
            console.log(error);
            alert(error.response.data.error);
        })
}

// axios 登入 api
function loginPost(obj) {
    axios.post(`${apiUrl}/users/sign_in`, obj)
        .then(function (res) {
            localStorage.setItem('token', res.headers.authorization);
            localStorage.setItem('name', res.data.nickname);
            alert('登入成功！將保持登入狀態轉跳至您的待辦清單 ^__^/');
            checkToken();
        })
        .catch(function (error) {
            alert("電子信箱或密碼錯誤。");
        })
}