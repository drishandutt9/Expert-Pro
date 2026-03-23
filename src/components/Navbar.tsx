import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-white/5 shadow-2xl shadow-indigo-500/5">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 text-sm">R</div>
          RAG Nexus
        </Link>
        <div className="flex gap-8">
          <Link href="/upload" className="text-sm font-semibold tracking-wide text-gray-400 hover:text-white transition-colors relative group">
            Upload
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 transition-all group-hover:w-full opacity-0 group-hover:opacity-100"></span>
          </Link>
          <Link href="/chat" className="text-sm font-semibold tracking-wide text-gray-400 hover:text-white transition-colors relative group">
            Chat
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all group-hover:w-full opacity-0 group-hover:opacity-100"></span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
