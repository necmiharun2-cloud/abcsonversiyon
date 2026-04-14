import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, User } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { blogPosts } from '../data/blogPosts';

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.id === slug);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <>
    <SEOHead title={post.title} description={post.excerpt} canonical={`/blog/${post.id}`} />
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Bloga don
      </Link>

      <article className="bg-[#1a1b23] rounded-2xl border border-white/5 overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-72 object-cover" />
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
            <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5" /> {post.author}</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.date}</span>
            <span className="inline-flex px-2 py-1 rounded bg-white/10 border border-white/10">{post.category}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">{post.title}</h1>
          <p className="text-gray-300 leading-relaxed">{post.content}</p>
        </div>
      </article>
    </div>
    </>
  );
}
