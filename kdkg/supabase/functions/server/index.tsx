import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ea58c774/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all movies
app.get("/make-server-ea58c774/movies", async (c) => {
  try {
    const movies = await kv.getByPrefix("movie:");
    return c.json({ success: true, movies });
  } catch (error) {
    console.error("Error fetching movies:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add a new movie
app.post("/make-server-ea58c774/movies", async (c) => {
  try {
    const movie = await c.req.json();
    await kv.set(`movie:${movie.id}`, movie);
    return c.json({ success: true, movie });
  } catch (error) {
    console.error("Error adding movie:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a movie
app.delete("/make-server-ea58c774/movies/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`movie:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting movie:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update movie poster
app.patch("/make-server-ea58c774/movies/:id/poster", async (c) => {
  try {
    const id = c.req.param("id");
    const { image } = await c.req.json();
    
    // Get the existing movie
    const movie = await kv.get(`movie:${id}`);
    if (!movie) {
      return c.json({ success: false, error: "Movie not found" }, 404);
    }
    
    // Update the image field
    const updatedMovie = { ...movie, image };
    await kv.set(`movie:${id}`, updatedMovie);
    
    return c.json({ success: true, movie: updatedMovie });
  } catch (error) {
    console.error("Error updating movie poster:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update movie fields (genre, etc.)
app.patch("/make-server-ea58c774/movies/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    // Get the existing movie
    const movie = await kv.get(`movie:${id}`);
    if (!movie) {
      return c.json({ success: false, error: "Movie not found" }, 404);
    }
    
    // Update the movie with the provided fields
    const updatedMovie = { ...movie, ...updates };
    await kv.set(`movie:${id}`, updatedMovie);
    
    return c.json({ success: true, movie: updatedMovie });
  } catch (error) {
    console.error("Error updating movie:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all "to watch" movies
app.get("/make-server-ea58c774/towatch", async (c) => {
  try {
    const toWatchMovies = await kv.getByPrefix("towatch:");
    return c.json({ success: true, movies: toWatchMovies });
  } catch (error) {
    console.error("Error fetching to watch movies:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add a new "to watch" movie
app.post("/make-server-ea58c774/towatch", async (c) => {
  try {
    const movie = await c.req.json();
    await kv.set(`towatch:${movie.id}`, movie);
    return c.json({ success: true, movie });
  } catch (error) {
    console.error("Error adding to watch movie:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a "to watch" movie
app.delete("/make-server-ea58c774/towatch/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`towatch:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting to watch movie:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get comments for a movie
app.get("/make-server-ea58c774/comments/:movieId", async (c) => {
  try {
    const movieId = c.req.param("movieId");
    const comments = await kv.getByPrefix(`comment:${movieId}:`);
    return c.json({ success: true, comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all comments
app.get("/make-server-ea58c774/comments", async (c) => {
  try {
    const comments = await kv.getByPrefix("comment:");
    return c.json({ success: true, comments });
  } catch (error) {
    console.error("Error fetching all comments from database:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add a comment to a movie
app.post("/make-server-ea58c774/comments", async (c) => {
  try {
    const comment = await c.req.json();
    await kv.set(`comment:${comment.movieId}:${comment.id}`, comment);
    return c.json({ success: true, comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a comment
app.delete("/make-server-ea58c774/comments/:movieId/:commentId", async (c) => {
  try {
    const movieId = c.req.param("movieId");
    const commentId = c.req.param("commentId");
    await kv.del(`comment:${movieId}:${commentId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Submit a rating for a movie
app.post("/make-server-ea58c774/ratings", async (c) => {
  try {
    const { movieId, rating, userIdentifier } = await c.req.json();
    
    if (!movieId || !rating || !userIdentifier) {
      return c.json({ success: false, error: "Missing required fields" }, 400);
    }
    
    if (rating < 1 || rating > 5) {
      return c.json({ success: false, error: "Rating must be between 1 and 5" }, 400);
    }
    
    const ratingData = {
      movieId,
      rating,
      userIdentifier,
      timestamp: Date.now(),
    };
    
    // Store rating with key: rating:movieId:userIdentifier
    await kv.set(`rating:${movieId}:${userIdentifier}`, ratingData);
    
    return c.json({ success: true, rating: ratingData });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all ratings for a movie
app.get("/make-server-ea58c774/ratings/:movieId", async (c) => {
  try {
    const movieId = c.req.param("movieId");
    const ratings = await kv.getByPrefix(`rating:${movieId}:`);
    
    // Calculate average
    const average = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;
    
    return c.json({ 
      success: true, 
      ratings,
      average: Math.round(average * 10) / 10, // Round to 1 decimal
      count: ratings.length 
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all ratings (for calculating averages on load)
app.get("/make-server-ea58c774/ratings", async (c) => {
  try {
    const allRatings = await kv.getByPrefix("rating:");
    
    // Group ratings by movieId
    const ratingsByMovie: { [key: string]: any[] } = {};
    allRatings.forEach(rating => {
      if (!ratingsByMovie[rating.movieId]) {
        ratingsByMovie[rating.movieId] = [];
      }
      ratingsByMovie[rating.movieId].push(rating);
    });
    
    // Calculate averages
    const averages: { [key: string]: { average: number, count: number } } = {};
    Object.keys(ratingsByMovie).forEach(movieId => {
      const ratings = ratingsByMovie[movieId];
      const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      averages[movieId] = {
        average: Math.round(average * 10) / 10,
        count: ratings.length
      };
    });
    
    return c.json({ success: true, averages });
  } catch (error) {
    console.error("Error fetching all ratings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get user's personal ratings
app.get("/make-server-ea58c774/user-ratings/:userIdentifier", async (c) => {
  try {
    const userIdentifier = c.req.param("userIdentifier");
    const allRatings = await kv.getByPrefix("rating:");
    
    // Filter ratings for this user
    const userRatings: { [key: string]: number } = {};
    allRatings.forEach(rating => {
      if (rating.userIdentifier === userIdentifier) {
        userRatings[rating.movieId] = rating.rating;
      }
    });
    
    return c.json({ success: true, userRatings });
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);