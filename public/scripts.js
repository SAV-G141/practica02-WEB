const apiBase = '/api';

// Roles
const roleForm = document.getElementById('role-form');
const roleIdInput = document.getElementById('role-id');
const roleNameInput = document.getElementById('role-name');
const roleCancelBtn = document.getElementById('role-cancel');
const rolesTableBody = document.querySelector('#roles-table tbody');

// Users
const userForm = document.getElementById('user-form');
const userIdInput = document.getElementById('user-id');
const userNameInput = document.getElementById('user-name');
const userEmailInput = document.getElementById('user-email');
const userPasswordInput = document.getElementById('user-password');
const userRoleSelect = document.getElementById('user-role');
const userAvatarInput = document.getElementById('user-avatar');
const userCancelBtn = document.getElementById('user-cancel');
const usersTableBody = document.querySelector('#users-table tbody');

// Load roles and populate role select and table
async function loadRoles() {
  const res = await fetch(apiBase + '/roles');
  const roles = await res.json();
  userRoleSelect.innerHTML = '';
  rolesTableBody.innerHTML = '';
  roles.forEach(function(role) {
    // Populate select
    var option = document.createElement('option');
    option.value = role.id;
    option.textContent = role.name;
    userRoleSelect.appendChild(option);
    // Populate table
    var tr = document.createElement('tr');
    tr.innerHTML = 
      '<td>' + role.id + '</td>' +
      '<td>' + role.name + '</td>' +
      '<td>' +
        '<button onclick="editRole(' + role.id + ', \'' + role.name + '\')">Editar</button> ' +
        '<button onclick="deleteRole(' + role.id + ')">Eliminar</button>' +
      '</td>';
    rolesTableBody.appendChild(tr);
  });
}

// Load users and populate table
async function loadUsers() {
  const res = await fetch(apiBase + '/users');
  const users = await res.json();
  usersTableBody.innerHTML = '';
  users.forEach(function(user) {
    var tr = document.createElement('tr');
    tr.innerHTML = 
      '<td>' + user.id + '</td>' +
      '<td>' + user.name + '</td>' +
      '<td>' + user.email + '</td>' +
      '<td>' + (user.avatar ? '<img class="avatar" src="/uploads/' + user.avatar + '" alt="avatar" />' : '') + '</td>' +
      '<td>' + user.role_id + '</td>' +
      '<td>' +
        '<button onclick="editUser(' + user.id + ')">Editar</button> ' +
        '<button onclick="deleteUser(' + user.id + ')">Eliminar</button>' +
      '</td>';
    usersTableBody.appendChild(tr);
  });
}

// Role form submit
roleForm.addEventListener('submit', async e => {
  e.preventDefault();
  const id = roleIdInput.value;
  const name = roleNameInput.value.trim();
  if (!name) return alert('El nombre del rol es obligatorio');
  if (id) {
    // Update role
    const res = await fetch(apiBase + '/roles/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) return alert('Error al actualizar rol');
  } else {
    // Create role
    const res = await fetch(apiBase + '/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error al crear rol:', errorData);
      return alert('Error al crear rol: ' + (errorData.error || 'Error desconocido'));
    }
  }
  roleForm.reset();
  roleIdInput.value = '';
  roleCancelBtn.style.display = 'none';
  loadRoles();
});

// Cancel role edit
roleCancelBtn.addEventListener('click', () => {
  roleForm.reset();
  roleIdInput.value = '';
  roleCancelBtn.style.display = 'none';
});

// Edit role
function editRole(id, name) {
  roleIdInput.value = id;
  roleNameInput.value = name;
  roleCancelBtn.style.display = 'inline';
}

// Delete role
async function deleteRole(id) {
  if (!confirm('¿Está seguro de eliminar este rol?')) return;
  const res = await fetch(apiBase + '/roles/' + id, { method: 'DELETE' });
  if (!res.ok) return alert('Error al eliminar rol');
  loadRoles();
}

// User form submit
userForm.addEventListener('submit', async e => {
  e.preventDefault();
  const id = userIdInput.value;
  const formData = new FormData();
  formData.append('name', userNameInput.value.trim());
  formData.append('email', userEmailInput.value.trim());
  if (userPasswordInput.value) {
    formData.append('password', userPasswordInput.value);
  }
  formData.append('role_id', userRoleSelect.value);
  if (userAvatarInput.files[0]) {
    formData.append('avatar', userAvatarInput.files[0]);
  }

  let url = apiBase + '/users';
  let method = 'POST';
  if (id) {
    url += '/' + id;
    method = 'PUT';
  }

  const res = await fetch(url, {
    method,
    body: formData
  });
  if (!res.ok) {
    const error = await res.json();
    return alert('Error: ' + (error.error || 'Error desconocido'));
  }
  userForm.reset();
  userIdInput.value = '';
  userCancelBtn.style.display = 'none';
  loadUsers();
});

// Cancel user edit
userCancelBtn.addEventListener('click', () => {
  userForm.reset();
  userIdInput.value = '';
  userCancelBtn.style.display = 'none';
});

// Edit user
async function editUser(id) {
  const res = await fetch(apiBase + '/users/' + id);
  if (!res.ok) return alert('Error al obtener usuario');
  const user = await res.json();
  userIdInput.value = user.id;
  userNameInput.value = user.name;
  userEmailInput.value = user.email;
  userPasswordInput.value = '';
  userRoleSelect.value = user.role_id;
  userCancelBtn.style.display = 'inline';
}

// Delete user
async function deleteUser(id) {
  if (!confirm('¿Está seguro de eliminar este usuario?')) return;
  const res = await fetch(apiBase + '/users/' + id, { method: 'DELETE' });
  if (!res.ok) return alert('Error al eliminar usuario');
  loadUsers();
}

// Initial load
loadRoles();
loadUsers();
