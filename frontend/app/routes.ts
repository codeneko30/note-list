import { type RouteConfig, index , route} from "@react-router/dev/routes";

export default [
    
    
     // Root index - redirect to login (or use login directly)
  index("routes/login.tsx"),
  
  // Auth routes
  route("register", "routes/register.tsx"),
  
  // Protected routes
  route("dashboard", "routes/dashboard.tsx"),
  
  // Dynamic route for list detail - MUST use $id for params
  route("lists/:id", "routes/lists.id.tsx"),



] satisfies RouteConfig;
