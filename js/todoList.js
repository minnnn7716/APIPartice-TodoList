// todoList
let data;
let tagStatu = 'all';

(() => {
    // 監聽按鈕「登出」，並切換頁面與清除登入資訊
    function eventForLogout() {
        const logout = document.querySelector('.logout');
        logout.addEventListener('click', e => signoutDelete(e));
    }

    // axios 登出 api
    function signoutDelete(e) {
        e.preventDefault();

        axios.delete(`${apiUrl}/users/sign_out`, key)
            .then(function (res) {
                alert('登出成功！');

                localStorage.removeItem('token');
                localStorage.removeItem('name');
                judgePage();
            })
            .catch(function (error) {
                alert('登出失敗');
            })
    }

    // 監聽「新增 todo」按鈕點擊、鍵盤 Enter
    function eventForAdd() {
        const input = document.querySelector('.addInput input');
        const addbtn = document.querySelector('.addbtn');
        let obj;

        addbtn.addEventListener('click', e => {
            e.preventDefault();

            if (!input.value.trim().length) {
                alert('待辦事項不得為空');
                return;
            }

            obj = {
                "todo": {
                    "content": input.value
                }
            }

            postItem(obj);
        })

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                if (!input.value.trim().length) {
                    alert('待辦事項不得為空');
                    return;
                }

                obj = {
                    "todo": {
                        "content": input.value
                    }
                }

                addbtn.style.backgroundColor = '#9F9A91';
                setTimeout(() => { addbtn.style.backgroundColor = '#333333' }, 500);
                postItem(obj);
            }
        })
    }

    // 切換完成狀態 tag
    function eventForTag() {
        const tagslist = document.querySelector('.list-tag');
        const tags = document.querySelectorAll('.list-tag li');

        tagslist.addEventListener('click', e => {
            tags.forEach(item => {
                item.classList.remove('active');
                e.target.classList.add('active');
            })

            tagStatu = e.target.dataset.statu;
            renderList();
        })
    }

    // 監聽「清除已完成項目」按鈕
    function eventForClear() {
        const clearBtn = document.querySelector('.clearBtn');

        clearBtn.addEventListener('click', e => {
            e.preventDefault();
            donelist = [];

            data.filter(item => item.completed_at ? donelist.push(item.id) : false);
            data = data.filter(item => item.completed_at !== true);

            deleteManyItem(donelist);
        })
    }

    function bindEvent() {
        eventForLogout();
        eventForAdd();
        eventForTag();
        eventForClear();
    }

    function init() {
        bindEvent();
    }

    init();
})();

// axios 取得 todos api
function getList() {
    axios.get(`${apiUrl}/todos`, key)
        .then(function (res) {
            data = res.data.todos;
            renderList();
        })
        .catch(function (error) {
            console.log(error);
        })
}

// axios 新增 todo api
function postItem(obj) {
    const input = document.querySelector('.addInput input');

    axios.post(`${apiUrl}/todos`, obj, key)
        .then(function (res) {
            data.push({
                ...res.data,
                completed_at: null
            })

            alert('新增代辦成功！');
            input.value = "";
            renderList();
        })
        .catch(function (error) {
            console.log(error);
        })
}

// 渲染 todos 列表
function renderList() {
    const listContent = document.querySelector('.list-content');
    const todoNum = document.querySelector('.todoNum span');
    let str = '';
    let count = 0;

    data.forEach((item, index) => {
        if (item.completed_at) {
            if (tagStatu === 'all' || tagStatu === 'done') {
                str += `
                <li>
                    <label class="todoItem" data-num="${index}">
                        <input type="checkbox" checked>
                        <span class="pointer-none">${item.content}</span>
                    </label>
                <a href="#" class="deleteBtn" data-num="${index}"></a>
                </li>
                `
            }
        } else {
            count += 1;
            if (tagStatu === 'all' || tagStatu === 'todo') {
                str += `
                <li>
                    <label class="todoItem" data-num="${index}">
                        <input type="checkbox">
                        <span class="pointer-none">${item.content}</span>
                    </label>
                <a href="#" class="deleteBtn" data-num="${index}"></a>
                </li>
                `
            }
        }

    });

    listContent.innerHTML = str;
    todoNum.textContent = count;

    itemsClickEvent();
}

// 監聽「代辦項目」上的點擊活動：刪除代辦、變更項目狀態
function itemsClickEvent() {
    const items = document.querySelectorAll('.list-content li');
    const inputs = document.querySelectorAll('.todoItem input');

    items.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            let index = e.target.dataset.num;
            let id = data[index].id;

            if (e.target.getAttribute('class') === 'deleteBtn') {
                deleteItem(id, index);
            } else {
                changeItemStatu(id);
                data[index].completed_at = !data[index].completed_at;
                renderList();
            }
        })
    })
}

// axios 刪除 todo api
function deleteItem(id, index) {
    axios.delete(`${apiUrl}/todos/${id}`, key)
        .then(function (res) {
            alert('刪除成功');
            data.splice([index], 1);
            renderList();
        })
        .catch(function (error) {
            console.log(error);
        })
}

// axios 連續執行刪除 todo api
function deleteManyItem(ary) {
    if (ary.length) {
        let newAry = ary.map(id => axios.delete(`${apiUrl}/todos/${id}`, key));

        Promise.all(newAry)
            .then((res) => {
                console.log(res);
                alert('已清除完成項目！');
                renderList();
            })
            .catch((error) => {
                console.log(error);
            })
    } else {
        alert('沒有已完成項目！');
    }
}

// axios 切換 todo 狀態 api
function changeItemStatu(id) {
    axios.patch(`${apiUrl}/todos/${id}/toggle`, {}, key)
        .then(function (res) {
        })
        .catch(function (error) {
            console.log(error);
        })
}