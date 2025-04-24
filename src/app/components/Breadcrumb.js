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
    <nav className="bg-white py-3 px-4 sm:px-6 lg:px-8 border-b py-8">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link 
              href="/" 
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <Home size={16} className="mr-1" />
              Home
            </Link>
          </li>
          {breadcrumbItems.map((item, index) => (
            <li key={item.path} className="flex items-center">
              <ChevronRight size={16} className="text-gray-400" />
              {item.isLast ? (
                <span className="ml-2 text-gray-900 font-medium">
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.path}
                  className="ml-2 text-gray-500 hover:text-gray-700"
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