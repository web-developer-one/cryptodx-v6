// This file is configured to be a valid, but inactive, middleware.
// By exporting an empty matcher, we ensure Next.js recognizes the file
// but never executes the middleware for any routes, preventing build conflicts.
export const config = {
  matcher: [],
};

export default function middleware() {
  // This function is required for the module to be valid but will not run.
}
