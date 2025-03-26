'use client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type React from 'react';

const page = () => {
  const router = useRouter();

  interface AdminCardProps {
    title: string;
    path: string;
  }

  const AdminCard: React.FC<AdminCardProps> = ({ title, path }) => {
    return (
      <div className="border-2 border-brown/20 p-6 rounded-xl bg-white/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-between gap-4 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-brown">{title}</h2>
        <Button
          onClick={() => router.push(path)}
          className="w-full bg-brown text-white font-semibold py-4 rounded-lg">
          Manage {title}
        </Button>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-12">
        <h1 className="text-5xl font-bold text-brown mb-4 font-BaiJamjuree">
          <span className="bg-gradient-to-r from-purple to-blue text-transparent bg-clip-text">
            Admin
          </span>{' '}
          Dashboard
        </h1>
        <p className="text-brown/80 text-lg font-Anuphan">
          Manage your platform settings and configurations
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminCard title="User Management" path="/admin/user-management" />
        <AdminCard title="Tag Settings" path="/admin/tag-settings" />
        <AdminCard title="Template Management" path="/admin/template-management" />
      </div>

      <div className="mt-12 border-t border-brown/10 pt-8">
        <p className="text-center text-brown/60 font-Anuphan">
          Platform Version: 1.0.0 | Secure Admin Session
        </p>
      </div>
    </div>
  );
};

export default page;
