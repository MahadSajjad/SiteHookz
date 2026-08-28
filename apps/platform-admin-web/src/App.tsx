function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-surface border border-border p-8 rounded-lg shadow-md max-w-lg w-full text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">
          SiteHookz Platform Admin
        </h1>
        <p className="text-muted-foreground">
          This is a separate security boundary for platform administration.
        </p>
        <div className="p-4 bg-warning/10 text-warning-foreground border border-warning/20 rounded-md">
          <p className="font-semibold">Notice</p>
          <p className="text-sm">
            This application is not yet fully implemented.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
