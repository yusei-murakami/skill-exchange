// シンプルなクライアント側認証（localStorageベース）
(function(){
  const STORAGE_KEY = 'skill_exchange_user';
  const USERS_KEY = 'skill_exchange_users';

  function getUser(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)); }catch(e){ return null; }
  }

  function setUser(user){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  function clearUser(){
    localStorage.removeItem(STORAGE_KEY);
  }

  function getUsers(){
    try{ return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }catch(e){ return []; }
  }

  function saveUsers(users){
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function addUser(user){
    const users = getUsers();
    users.push(user);
    saveUsers(users);
  }

  // パスワードをSHA-256でハッシュ（hex）
  async function hashPassword(password){
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const arr = Array.from(new Uint8Array(hash));
    return arr.map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  function createLoginModal(onSuccess){
    // モーダル要素
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = 0;
    modal.style.top = 0;
    modal.style.right = 0;
    modal.style.bottom = 0;
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.zIndex = 9999;

    const box = document.createElement('div');
    box.style.width = '320px';
    box.style.padding = '18px';
    box.style.borderRadius = '12px';
    box.style.background = '#fff';
    box.style.boxShadow = '0 10px 30px rgba(10,20,50,0.12)';

    box.innerHTML = `
      <h3 style="margin:0 0 8px 0">ログイン</h3>
      <div style="margin-bottom:8px">
        <label style="display:block;font-weight:600;margin-bottom:6px">ユーザー名</label>
        <input id="_auth_username" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e6e8ee" />
      </div>
      <div style="margin-bottom:12px">
        <label style="display:block;font-weight:600;margin-bottom:6px">パスワード</label>
        <input id="_auth_password" type="password" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e6e8ee" />
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="_auth_cancel" style="padding:8px 12px;border-radius:8px;border:1px solid #e6e8ee;background:transparent">キャンセル</button>
        <button id="_auth_submit" style="padding:8px 12px;border-radius:8px;background:linear-gradient(180deg,#5b8cff,#3a6be0);color:#fff;border:none">ログイン</button>
      </div>
    `;

    modal.appendChild(box);
    document.body.appendChild(modal);

    // イベント
    modal.querySelector('#_auth_cancel').addEventListener('click', ()=>{ document.body.removeChild(modal); });
    modal.querySelector('#_auth_submit').addEventListener('click', async ()=>{
      const username = modal.querySelector('#_auth_username').value.trim();
      const password = modal.querySelector('#_auth_password').value;
      if(!username){ alert('ユーザー名を入力してください'); return; }

      const users = getUsers();
      const found = users.find(u=>u.name === username);
      if(!found){
        alert('ユーザーが見つかりません。新規登録してください。');
        return;
      }
      const hashed = await hashPassword(password);
      if(found.passwordHash !== hashed){
        alert('パスワードが正しくありません');
        return;
      }

      setUser({ name: username, loggedAt: Date.now() });
      document.body.removeChild(modal);
      if(typeof onSuccess === 'function') onSuccess(getUser());
    });

    // フォーカス
    setTimeout(()=>{ const el = modal.querySelector('#_auth_username'); if(el) el.focus(); },10);
  }

  function updateUI(){
    const user = getUser();
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplay = document.getElementById('userDisplay');
    const registrationArea = document.getElementById('registrationArea');
    const needLoginNotice = document.getElementById('needLoginNotice');

    if(user){
      if(userDisplay) userDisplay.textContent = `ログイン中: ${user.name}`;
      if(loginBtn) loginBtn.style.display = 'none';
      if(logoutBtn) logoutBtn.style.display = 'inline-block';
      if(registrationArea) registrationArea.style.display = 'block';
      if(needLoginNotice) needLoginNotice.style.display = 'none';
    }else{
      if(userDisplay) userDisplay.textContent = '';
      if(loginBtn) loginBtn.style.display = 'inline-block';
      if(logoutBtn) logoutBtn.style.display = 'none';
      if(registrationArea) registrationArea.style.display = 'none';
      if(needLoginNotice) needLoginNotice.style.display = 'block';
    }

    // 登録ボタンの活性化制御（あれば）
    const submitBtn = document.querySelector('.btn.primary');
    if(submitBtn){
      submitBtn.disabled = !user;
      submitBtn.style.opacity = submitBtn.disabled ? '0.7' : '1';
      submitBtn.title = submitBtn.disabled ? 'ログインすると登録できます' : '';
    }
  }

  function createSignupModal(onSuccess){
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = 0;
    modal.style.top = 0;
    modal.style.right = 0;
    modal.style.bottom = 0;
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.zIndex = 9999;

    const box = document.createElement('div');
    box.style.width = '360px';
    box.style.padding = '18px';
    box.style.borderRadius = '12px';
    box.style.background = '#fff';
    box.style.boxShadow = '0 10px 30px rgba(10,20,50,0.12)';

    box.innerHTML = `
      <h3 style="margin:0 0 8px 0">新規登録</h3>
      <div style="margin-bottom:8px">
        <label style="display:block;font-weight:600;margin-bottom:6px">ユーザー名</label>
        <input id="_signup_username" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e6e8ee" />
      </div>
      <div style="margin-bottom:8px">
        <label style="display:block;font-weight:600;margin-bottom:6px">パスワード（6文字以上）</label>
        <input id="_signup_password" type="password" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e6e8ee" />
      </div>
      <div style="margin-bottom:12px">
        <label style="display:block;font-weight:600;margin-bottom:6px">パスワード（確認）</label>
        <input id="_signup_password2" type="password" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e6e8ee" />
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="_signup_cancel" style="padding:8px 12px;border-radius:8px;border:1px solid #e6e8ee;background:transparent">キャンセル</button>
        <button id="_signup_submit" style="padding:8px 12px;border-radius:8px;background:linear-gradient(180deg,#5b8cff,#3a6be0);color:#fff;border:none">登録する</button>
      </div>
    `;

    modal.appendChild(box);
    document.body.appendChild(modal);

    modal.querySelector('#_signup_cancel').addEventListener('click', ()=>{ document.body.removeChild(modal); });
    modal.querySelector('#_signup_submit').addEventListener('click', async ()=>{
      const username = modal.querySelector('#_signup_username').value.trim();
      const pw1 = modal.querySelector('#_signup_password').value;
      const pw2 = modal.querySelector('#_signup_password2').value;
      if(!username){ alert('ユーザー名を入力してください'); return; }
      if(pw1.length < 6){ alert('パスワードは6文字以上にしてください'); return; }
      if(pw1 !== pw2){ alert('パスワードが一致しません'); return; }

      const users = getUsers();
      if(users.find(u=>u.name === username)){
        alert('そのユーザー名は既に使われています');
        return;
      }

      const hash = await hashPassword(pw1);
      addUser({ name: username, passwordHash: hash, createdAt: Date.now() });
      setUser({ name: username, loggedAt: Date.now() });
      document.body.removeChild(modal);
      if(typeof onSuccess === 'function') onSuccess(getUser());
    });

    setTimeout(()=>{ const el = modal.querySelector('#_signup_username'); if(el) el.focus(); },10);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    // 初期UI更新
    updateUI();

    // 初回（ユーザーがまだ一人も作成されていない）なら自動で新規登録を促す
    const users = getUsers();
    const current = getUser();
    if(!current && users.length === 0){
      // 少し遅らせてモーダルを開く（レンダリング完了後）
      setTimeout(()=>{
        createSignupModal(()=>{
          updateUI();
        });
      }, 200);
    }

    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if(loginBtn){
      loginBtn.addEventListener('click', ()=>{
        createLoginModal(()=>{
          updateUI();
        });
      });
    }

    // notice のログインボタン（index.html上のもの）
    const noticeLogin = document.getElementById('noticeLoginBtn');
    if(noticeLogin){
      noticeLogin.addEventListener('click', ()=>{
        // 新規登録モーダルを開く
        createSignupModal(()=>{
          updateUI();
        });
      });
    }

    if(logoutBtn){
      logoutBtn.addEventListener('click', ()=>{
        if(confirm('ログアウトしますか？')){
          clearUser();
          updateUI();
        }
      });
    }

    // フォーム送信ガード（登録ページ用）
    const form = document.getElementById('skillForm');
    if(form){
      form.addEventListener('submit', function(e){
        if(!getUser()){
          e.preventDefault();
          alert('登録するにはログインが必要です。ログインしてください。');
          createLoginModal(()=>{
            updateUI();
          });
          return false;
        }
      });
    }
  });

})();
