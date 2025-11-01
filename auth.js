// Хранилище пользователей
let users = JSON.parse(localStorage.getItem('users')) || {}

function login() {
  const username = document.getElementById('username').value.trim()
  const password = document.getElementById('password').value

  if (!username || !password) {
    showMessage('Заполни все поля, братик <3!', 'error')
    return
  }

  if (users[username] && users[username].password === password) {
    localStorage.setItem('currentUser', username)
    showMessage('Успешный вход!', 'success')

    setTimeout(() => {
      window.location.href = 'todo.html'
    }, 1000)
  } else {
    showMessage('Неверный логин или пароль!', 'error')
  }
}

function register() {
  const username = document.getElementById('username').value.trim()
  const password = document.getElementById('password').value

  if (!username || !password) {
    showMessage('Заполни все поля братик <3!', 'error')
    return
  }

  if (password.length < 8) {
    showMessage('Пароль должен быть не менее 8 символов!', 'error')
    return
  }

  if (users[username]) {
    showMessage('Такой пользователь уже существует!', 'error')
    return
  }

  users[username] = {
    password: password,
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem('users', JSON.stringify(users))
  localStorage.setItem('currentUser', username)
  showMessage('Регистрация успешна <3!', 'success')

  setTimeout(() => {
    window.location.href = 'todo.html'
  }, 1000)
}

function logout() {
  localStorage.removeItem('currentUser')
  window.location.href = 'index.html'
}

function showMessage(text, type) {
  const message = document.getElementById('authMessage')
  message.textContent = text
  message.className = `message ${type}`
}

// Обработчики Enter
document.addEventListener('DOMContentLoaded', function () {
  const passwordInput = document.getElementById('password')
  const usernameInput = document.getElementById('username')

  if (passwordInput) {
    passwordInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') login()
    })
  }

  if (usernameInput) {
    usernameInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') login()
    })
  }
})
