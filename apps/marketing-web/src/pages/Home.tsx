export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 px-4 md:px-8 max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">SiteHookz</h1>
        <nav className="space-x-4">
          <a href="http://app.sitehookz.localhost/login" className="text-muted-foreground hover:text-foreground">
            Login
          </a>
          <a href="http://app.sitehookz.localhost/register" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Sign Up
          </a>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-foreground">
            The Ultimate Multi-Product SaaS Platform
          </h2>
          <p className="text-xl text-muted-foreground">
            Scale your institution with our powerful suite of tools. From education management to enterprise operations, SiteHookz has you covered.
          </p>
          <div className="flex justify-center gap-4 pt-8">
            <a href="http://app.sitehookz.localhost/register" className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium text-lg hover:bg-primary/90 transition-colors">
              Get Started for Free
            </a>
            <a href="#features" className="bg-surface text-foreground border border-border px-8 py-3 rounded-md font-medium text-lg hover:bg-surface-secondary transition-colors">
              View Products
            </a>
          </div>
        </div>

        <div id="features" className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface border border-border p-8 rounded-lg shadow-sm">
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Education Product</h3>
            <p className="text-muted-foreground">
              A comprehensive learning management system tailored for modern institutions. Manage courses, students, and grades all in one place.
            </p>
          </div>
          {/* More cards can be added here */}
        </div>
      </main>
    </div>
  );
}
