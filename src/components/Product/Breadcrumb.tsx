import { Link } from 'react-router-dom';
import { ChevronRight, Eye } from 'lucide-react';

interface BreadcrumbProps {
  category?: string;
  title?: string;
}

export default function Breadcrumb({ category, title }: BreadcrumbProps) {
  return (
    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
      <div className="flex items-center gap-2">
        <Link to="/" className="hover:text-white transition-colors">Anasayfa</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-500">Tüm Kategoriler</span>
        {category && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-500">{category}</span>
          </>
        )}
        {title && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className="text-yellow-500 font-medium">{title}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-1.5 bg-[#1a1b23] px-2 py-1 rounded border border-white/5">
        <Eye className="w-3.5 h-3.5" />
        <span>{Math.floor(Math.random() * 500) + 50}</span>
      </div>
    </div>
  );
}
