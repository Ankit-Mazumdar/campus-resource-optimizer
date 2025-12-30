import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center px-6">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <span className="font-bold text-slate-900">CampusHub</span>
        </Link>
      </div>

      {/* Content */}
      <div className="text-center max-w-md w-full space-y-8">
        {/* 404 Graphic */}
        <div className="space-y-4">
          <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            404
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Page Not Found
          </h1>
          <p className="text-lg text-slate-600">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or deleted.
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
          <p className="text-sm font-medium text-slate-900">
            Here are some helpful links:
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Check the URL for typos</li>
            <li>• Return to the home page</li>
            <li>• Browse available resources</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link to="/">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white flex gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button
              variant="outline"
              className="w-full border-slate-300 flex gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-sm text-slate-500">
        <p>Error ID: {location.pathname}</p>
      </div>
    </div>
  );
};

export default NotFound;
