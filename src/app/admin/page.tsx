'use client';
import { Button } from '@/components/ui/button';
import { Redo2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';

const page = () => {
  const router = useRouter();

  interface AdminCardProps {
    title: string;
    path: string;
  }
  const HomeBackButton = () => {
    const router = useRouter();

    return (
      <Button
        variant="link"
        size="sm"
        onClick={() => router.push('/')}
        className="font-BaiJamjuree w-fit bg-white border-x border-y border-brown text-brown text-md">
        <Redo2 className="transform rotate-180 text-brown" /> Back
      </Button>
    );
  };

  const AdminCard: React.FC<AdminCardProps> = ({ title, path }) => {
    return (
      <div className="border-2 border-brown/20 p-6 rounded-xl bg-white/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-between gap-8 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-brown">{title}</h2>
        <Button
          onClick={() => router.push(path)}
          className="w-full bg-brown text-white font-semibold py-4 rounded-lg">
          Manage
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col max-w-7xl mx-auto gap-8 w-full h-full">
      <section className="flex items-center justify-between">
        <h1 className="text-5xl font-bold text-brown mb-4 font-BaiJamjuree w-full">Admin</h1>
        <HomeBackButton />
      </section>
      <div className="grid w-full justify-center items-center grid-cols-[repeat(auto-fit,_minmax(200px,_310px))] gap-8">
        <AdminCard title="User Management" path="/admin/user-management" />
        <AdminCard title="Tag Settings" path="/admin/tag-settings" />
        <AdminCard title="Template Management" path="/admin/template-management" />
      </div>
    </div>
  );
};

export default page;
