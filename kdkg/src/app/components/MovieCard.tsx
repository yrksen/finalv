import { Star, Trash2 } from "lucide-react";
import { Card } from "./ui/card";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string;
  rating: number;
  image: string;
  description: string;
  // Enhanced details
  imdbRating?: number;
  director?: string;
  cast?: string[];
  runtime?: string;
  plot?: string;
  imdbId?: string;
  trailer?: string;
  // User features
  userRating?: number;
  tags?: string[];
  // Community rating
  communityRating?: number;
  ratingCount?: number;
}

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
  onDelete?: (id: number) => void;
}

export function MovieCard({ movie, onClick, onDelete }: MovieCardProps) {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when deleting
    setShowPasswordPrompt(true);
    setPassword("");
    setPasswordError("");
  };

  const handlePasswordSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (password === "hassle") {
      setShowPasswordPrompt(false);
      setPassword("");
      setPasswordError("");
      if (onDelete && confirm(`Are you sure you want to delete "${movie.title}"?`)) {
        onDelete(movie.id);
      }
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleCancelPassword = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPasswordPrompt(false);
    setPassword("");
    setPasswordError("");
  };

  return (
    <div 
      className="flex-shrink-0 border-2 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative group"
      style={{ backgroundColor: '#D3D3D3' }}
      onClick={onClick}
    >
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Delete movie"
      >
        <Trash2 className="size-4" />
      </button>
      <img
        src={movie.image}
        alt={movie.title}
        className="w-full h-[200px] md:h-[240px] object-cover"
      />
      <div className="p-2 md:p-3">
        <h3 className="font-bold text-xs md:text-sm line-clamp-1 text-gray-900">{movie.title}</h3>
        <div className="flex items-center gap-1 md:gap-2 text-xs text-gray-700 mt-1">
          <span>{movie.year}</span>
          <span>•</span>
          <span className="line-clamp-1">{movie.genre}</span>
        </div>
        
        {/* Tags */}
        {movie.tags && movie.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {movie.tags.slice(0, 2).map((tag, idx) => (
              <span 
                key={idx}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-1">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-gray-900 dark:text-gray-900">{movie.rating.toFixed(1)}</span>
            {movie.runtime && (
              <>
                <span className="text-gray-500 dark:text-gray-700 text-xs">•</span>
                <span className="text-xs text-gray-600 dark:text-gray-800">{movie.runtime}</span>
              </>
            )}
          </div>
          {movie.userRating && movie.userRating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-blue-600 dark:text-blue-700 font-semibold">★ {movie.userRating}</span>
            </div>
          )}
        </div>
      </div>
      {showPasswordPrompt && (
        <Dialog open={showPasswordPrompt} onOpenChange={setShowPasswordPrompt}>
          <DialogContent className="p-4 md:p-6">
            <DialogHeader>
              <DialogTitle>Enter Password</DialogTitle>
              <DialogDescription>
                Please enter the password to delete the movie.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="mb-4"
            />
            {passwordError && <p className="text-red-500 mb-4">{passwordError}</p>}
            <div className="flex justify-end">
              <Button
                onClick={handlePasswordSubmit}
                className="mr-2"
              >
                Delete
              </Button>
              <Button
                onClick={handleCancelPassword}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}