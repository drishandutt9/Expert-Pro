import Link from 'next/link';
import { ArrowRight, UploadCloud, MessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-grid-white/[0.02] relative">
      <div className="absolute inset-0 bg-background/50 pointer-events-none" />
      <div className="z-10 max-w-4xl w-full text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Talk to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Documents</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Upload any text or PDF, instantly convert it into vector search context, and chat with an advanced AI that knows exactly what you uploaded.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
          <Link href="/upload" className="group flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20">
            <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
              <UploadCloud className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-white">Upload Docs</div>
              <div className="text-sm text-gray-400">Vectorize & Store</div>
            </div>
            <ArrowRight className="w-5 h-5 ml-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>

          <Link href="/chat" className="group flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
            <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-white">Start Chatting</div>
              <div className="text-sm text-gray-400">Ask questions</div>
            </div>
            <ArrowRight className="w-5 h-5 ml-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
