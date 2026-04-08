const supabase = require("../config/supabase");

async function upsertGenre(name) {
  const { data, error } = await supabase
    .from("genres")
    .upsert({ name }, { onConflict: "name" })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}

async function seedSampleData() {
  try {
    const genreNames = ["Fiction", "Science", "Technology", "History", "Fantasy"];
    const genreRows = [];
    for (const name of genreNames) {
      const row = await upsertGenre(name);
      genreRows.push(row);
    }

    const genreByName = Object.fromEntries(genreRows.map((g) => [g.name, g.id]));

    const books = [
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "9780132350884",
        total_copies: 5,
        available_copies: 5,
        genre_id: genreByName.Technology,
      },
      {
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt",
        isbn: "9780201616224",
        total_copies: 4,
        available_copies: 4,
        genre_id: genreByName.Technology,
      },
      {
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        isbn: "9780553380163",
        total_copies: 3,
        available_copies: 3,
        genre_id: genreByName.Science,
      },
      {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        isbn: "9780547928227",
        total_copies: 6,
        available_copies: 6,
        genre_id: genreByName.Fantasy,
      },
    ];

    const { error: booksError } = await supabase
      .from("books")
      .upsert(books, { onConflict: "isbn" });
    if (booksError) throw booksError;


    console.log("Sample data seeded successfully.");
    console.log(`Genres seeded: ${genreNames.length}`);
    console.log(`Books upserted: ${books.length}`);
   
  } catch (error) {
    console.error("Failed to seed sample data:", error.message);
    process.exitCode = 1;
  }
}

seedSampleData();
