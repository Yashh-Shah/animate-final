export default function Footer() {
  return (
    <footer className="mt-16 border-t">
      <div className="container py-10 text-sm text-foreground/70 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Sentinel Guard. All rights reserved.</p>
        <nav className="flex gap-6">
          <a className="hover:text-foreground" href="#privacy">Privacy</a>
          <a className="hover:text-foreground" href="#terms">Terms</a>
          <a className="hover:text-foreground" href="#contact">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
