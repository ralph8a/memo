// Application State Management
export const state = {
  currentUser: null,
  currentPage: 'home'
};

export function setUser(user) {
  state.currentUser = user;
  if (user) {
    localStorage.setItem('krauser_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('krauser_user');
  }
}

export function getUser() {
  if (!state.currentUser) {
    const stored = localStorage.getItem('krauser_user');
    if (stored) {
      state.currentUser = JSON.parse(stored);
    }
  }
  return state.currentUser;
}

export function setPage(page) {
  state.currentPage = page;
}

export function getPage() {
  return state.currentPage;
}

export function clearState() {
  state.currentUser = null;
  state.currentPage = 'home';
  localStorage.removeItem('krauser_user');
}
