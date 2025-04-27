"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb() {
  const pathname = usePathname();
  
  // Skip rendering breadcrumb on home page
  if (pathname === '/') return null;

  // Convert pathname to breadcrumb items
  const breadcrumbItems = pathname
    .split('/')
    .filter(item => item !== '')
    .map((item, index, array) => {
      const path = `/${array.slice(0, index + 1).join('/')}`;
      const label = item
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        label,
        path,
        isLast: index === array.length - 1
      };
    });

  return (
    <nav className="bg-white py-3 px-4 sm:px-8 lg:px-8 border-b pt-8">
      <div className="max-w-7xl mx-auto">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          <li className="flex-shrink-0">
            <Link 
              href="/" 
              className="text-gray-500 hover:text-gray-700 flex items-center whitespace-nowrap"
            >
              <Home size={16} className="mr-1 flex-shrink-0" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>
          {breadcrumbItems.map((item, index) => (
            <li key={item.path} className="flex items-center flex-shrink-0">
              <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
              {item.isLast ? (
                <span className="ml-2 text-gray-900 font-medium break-words">
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.path}
                  className="ml-2 text-gray-500 hover:text-gray-700 break-words"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
} 