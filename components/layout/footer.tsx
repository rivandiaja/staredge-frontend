export function Footer() {
  return (
    <footer className="border-t bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-slate-900 rounded-md flex items-center justify-center">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900">
              Staredge Digital
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 max-w-sm text-center md:text-left">
            Platform edukasi teknologi terbaik untuk mencetak talenta digital
            Indonesia yang kompetitif.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm font-bold">
          <a
            href="/privacy-policy"
            className="text-slate-400 hover:text-indigo-600 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-slate-400 hover:text-indigo-600 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="/contact"
            className="text-slate-400 hover:text-indigo-600 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}
