import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-poppins font-bold text-primary">404</h1>
          <h2 className="text-2xl font-poppins font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>
        <Button 
          onClick={() => window.location.href = "/"}
          className="bg-gradient-primary hover:opacity-90"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
