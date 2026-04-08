export const getToken = () => localStorage.getItem("access_token");

export const isAuthenticated = () => !!getToken();

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("theme"); // ← clears theme on logout
};
