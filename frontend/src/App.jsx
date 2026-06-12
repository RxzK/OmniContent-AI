import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart3,
  Settings,
  Plus,
  TrendingUp,
  Globe,
  Zap,
  Copy,
  ExternalLink,
  ChevronRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5000/api';

const App = () => {
  const [news, setNews] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Technology', 'Finance', 'Health', 'AI'];

  useEffect(() => {
    fetchNews();
    fetchHistory();
  }, []);

  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      const res = await axios.get(`${API_URL}/news`);
      setNews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNews(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/content`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (item) => {
    setGeneratingId(item.link);
    try {
      await axios.post(`${API_URL}/generate`, {
        title: item.title,
        category: item.category
      });
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingId(null);
    }
  };

  const filteredNews = activeCategory === 'All'
    ? news
    : news.filter(n => n.category === activeCategory);

  return (
    <div className="flex h-screen w-screen overflow-hidden text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 glass m-4 mr-0 flex flex-col p-6 gap-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500 rounded-lg glow">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight gradient-text">OmniContent</h1>
        </div>

        <nav className="flex flex-col gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeCategory === cat
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:bg-slate-800/50'
                }`}
            >
              <ChevronRight size={18} />
              <span className="font-medium">{cat}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Project Stats</div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Daily Limit</span>
              <span className="text-sm text-sky-400">14/50</span>
            </div>
          </div>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center px-4 py-2">
          <div>
            <h2 className="text-2xl font-bold">Trending Intelligence</h2>
            <p className="text-slate-400 text-sm">Real-time opportunities filtered by AI</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchNews}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 border border-slate-700"
            >
              <TrendingUp size={18} />
              <span>Refresh Trends</span>
            </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
          {/* Feed List */}
          <section className="glass overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <Globe size={18} className="text-sky-400" />
                Live Opportunity Feed
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingNews ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="animate-spin text-sky-500" size={40} />
                </div>
              ) : (
                filteredNews.map((item, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={item.link}
                    className="p-4 bg-slate-800/30 rounded-xl border border-white/5 hover:border-sky-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 bg-slate-800 text-[10px] uppercase font-bold tracking-widest rounded text-slate-400">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-500">{new Date(item.pubDate).toLocaleTimeString()}</span>
                    </div>
                    <h4 className="font-medium text-sm leading-relaxed mb-3 group-hover:text-sky-400 transition-colors">
                      {item.title}
                    </h4>
                    <button
                      onClick={() => handleGenerate(item)}
                      disabled={generatingId === item.link}
                      className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {generatingId === item.link ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Zap size={14} />
                      )}
                      Generate Content
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* Generated Content History */}
          <section className="glass overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                Ready to Publish
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-8">
                  <BarChart3 size={48} className="mb-4 opacity-20" />
                  <p>No content generated yet.<br />Select an item from the feed to start.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="space-y-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Generated Post</h4>
                      <p className="text-sm text-slate-300 bg-black/20 p-3 rounded-lg border border-white/5">
                        {item.socialMediaPost}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-2 border border-white/5">
                        <Copy size={14} /> Copy Post
                      </button>
                      <button className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                        <Plus size={14} /> Queue for Posting
                      </button>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-500">Based on: </span>
                      <span className="text-[10px] text-sky-400 truncate">{item.originalTitle}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
