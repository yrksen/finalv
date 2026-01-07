import { Movie } from "./MovieCard";
import { Star } from "lucide-react";

interface RecentMoviesCarouselProps {
  movies: Movie[];
  onMovieClick?: (movie: Movie) => void;
}

export function RecentMoviesCarousel({ movies, onMovieClick }: RecentMoviesCarouselProps) {
  // Get the 10 most recently added movies
  const recentMovies = movies.slice(0, 10);

  if (!recentMovies.length) return null;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-3 md:gap-4 min-w-max px-3 md:px-4 py-2">
        {recentMovies.map((movie) => (
          <div
            key={movie.id}
            className="flex-shrink-0 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer w-[140px] md:w-[160px]"
            onClick={() => onMovieClick?.(movie)}
          >
            <img
              src={movie.image}
              alt={movie.title}
              className="w-full h-[200px] md:h-[240px] object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}