import http from "./http";

const responseData = (response) => response.data;

export const authApi = {
  login: (body) => http.post("/auth/login", body).then(responseData),
  logout: () => http.post("/auth/logout").then(responseData),
};

export const reportsApi = {
  stats: () => http.get("/reports/stats").then(responseData),
  popularGenres: () => http.get("/reports/genres/popular").then(responseData),
  overdueBooks: () => http.get("/borrows/overdue").then(responseData),
};

export const booksApi = {
  list: (params) => http.get("/books", { params }).then(responseData),
  create: (body) => http.post("/books", body).then(responseData),
  update: (id, body) => http.patch(`/books/${id}`, body).then(responseData),
  remove: (id) => http.delete(`/books/${id}`).then(responseData),
};

export const membersApi = {
  list: (params) => http.get("/members", { params }).then(responseData),
  create: (body) => http.post("/members", body).then(responseData),
  update: (id, body) => http.patch(`/members/${id}`, body).then(responseData),
  remove: (id) => http.delete(`/members/${id}`).then(responseData),
  history: (id) => http.get(`/members/${id}/history`).then(responseData),
};

export const borrowsApi = {
  create: (body) => http.post("/borrows", body).then(responseData),
  returnBook: (id) => http.patch(`/borrows/${id}/return`).then(responseData),
  overdue: () => http.get("/borrows/overdue").then(responseData),
};

export const genresApi = {
  list: () => http.get("/genres").then(responseData),
  create: (body) => http.post("/genres", body).then(responseData),
  update: (id, body) => http.patch(`/genres/${id}`, body).then(responseData),
  remove: (id) => http.delete(`/genres/${id}`).then(responseData),
};

export const staffApi = {
  list: () => http.get("/staff").then(responseData),
  create: (body) => http.post("/staff", body).then(responseData),
  remove: (id) => http.delete(`/staff/${id}`).then(responseData),
};
