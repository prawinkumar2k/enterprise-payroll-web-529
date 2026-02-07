import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";

export default function Placeholder() {
  const location = useLocation();
  const pathName = location.pathname.split("/").filter(Boolean).join(" / ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Coming Soon
          </h1>
          <p className="text-lg text-muted-foreground">
            <span className="capitalize">{pathName || "This section"}</span> is
            being built
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <p className="text-muted-foreground mb-6">
            This feature is currently under development. Continue prompting to
            have us build out this page with full functionality.
          </p>
          <div className="bg-primary-50 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold mb-2">Path: {location.pathname}</p>
            <p className="text-muted-foreground">
              Share your requirements and we'll build it!
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 btn-primary text-base">
          
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>);

}