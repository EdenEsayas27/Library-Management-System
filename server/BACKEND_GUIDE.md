# Library Management Backend (Node.js + Express + Supabase)

## Folder Structure

```txt
server/
  config/
    db.js
    test.js
  src/
    app.js
    server.js
    config/
      env.js
      supabase.js
    controllers/
      authController.js
      bookController.js
      borrowController.js
      genreController.js
      memberController.js
      reportController.js
      staffController.js
    middlewares/
      authMiddleware.js
      roleMiddleware.js
    models/
      bookModel.js
      borrowModel.js
      genreModel.js
      memberModel.js
      staffModel.js
    routes/
      authRoutes.js
      bookRoutes.js
      borrowRoutes.js
      genreRoutes.js
      memberRoutes.js
      reportRoutes.js
      staffRoutes.js
      index.js
    utils/
      jwt.js
```

## JWT + dotenv Setup

Add these in `server/.env`:

```env
PORT=5000
JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=1d
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

JWT flow:
- `POST /api/auth/login` validates staff credentials and returns signed token.
- Protected routes require `Authorization: Bearer <token>`.
- `requireRole("admin")` protects admin-only routes.

## Sample Routes by Feature

- Auth: `POST /api/auth/login`, `POST /api/auth/logout`
- Books: `GET /api/books?q=node&genre=1`, `POST /api/books`, `PATCH /api/books/:id`, `DELETE /api/books/:id`
- Members: `POST /api/members`, `PATCH /api/members/:id`, `DELETE /api/members/:id`, `GET /api/members/:id/history`
- Borrow/Return: `POST /api/borrows`, `PATCH /api/borrows/:id/return`, `GET /api/borrows/overdue`
- Staff: `POST /api/staff`, `DELETE /api/staff/:id`
- Reports: `GET /api/reports/stats`, `GET /api/reports/genres/popular`
- Genres: `GET /api/genres`, `POST /api/genres`, `PATCH /api/genres/:id`, `DELETE /api/genres/:id`

## Supabase CRUD Query Examples

### Books

```js
// Create
await supabase.from("books").insert({ title, author, isbn, available_copies, genre_id }).select().single();

// Read with filter/search
await supabase.from("books").select("*").eq("genre_id", genreId).ilike("title", `%${q}%`);

// Update
await supabase.from("books").update({ title, available_copies }).eq("id", bookId).select().single();

// Delete
await supabase.from("books").delete().eq("id", bookId);
```

### Members

```js
await supabase.from("members").insert({ full_name, email, phone }).select().single();
await supabase.from("members").update({ full_name, phone }).eq("id", memberId).select().single();
await supabase.from("members").delete().eq("id", memberId);
await supabase
  .from("borrow_records")
  .select("id, borrowed_at, due_date, returned_at, books(title, isbn)")
  .eq("member_id", memberId);
```

### Borrow / Return

```js
// Validate available copies first, then create borrow
await supabase.from("borrow_records").insert({ member_id, book_id, borrowed_at, due_date }).select().single();

// Return
await supabase
  .from("borrow_records")
  .update({ returned_at: new Date().toISOString() })
  .eq("id", borrowId)
  .is("returned_at", null);
```

### Staff

```js
await supabase.from("staff").insert({ full_name, email, password_hash, role }).select().single();
await supabase.from("staff").delete().eq("id", staffId);
```

### Genres

```js
await supabase.from("genres").select("*").order("name");
await supabase.from("genres").insert({ name }).select().single();
await supabase.from("genres").update({ name }).eq("id", genreId).select().single();
await supabase.from("genres").delete().eq("id", genreId);
```

### Reports

```js
// Overdue books
await supabase.from("borrow_records").select("*").is("returned_at", null).lt("due_date", new Date().toISOString());

// Statistics (counts)
await supabase.from("books").select("id", { count: "exact", head: true });
await supabase.from("members").select("id", { count: "exact", head: true });
await supabase.from("borrow_records").select("id", { count: "exact", head: true }).is("returned_at", null);
```

