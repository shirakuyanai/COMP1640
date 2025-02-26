import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">eTutoring System</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li>
              <Link
                to="/staff"
                className="block py-2 px-4 hover:bg-gray-700"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/class/add"
                className="block py-2 px-4 hover:bg-gray-700"
              >
                Add Class
              </Link>
            </li>
            <li>
              <Link
                to="/class/edit"
                className="block py-2 px-4 hover:bg-gray-700"
              >
                Edit Class
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="block py-2 px-4 hover:bg-gray-700"
              >
                Logout
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 bg-gray-100">
        {children}
      </div>
    </div>
  );
}
