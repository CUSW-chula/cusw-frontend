export default async function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-cream text-brown font-BaiJamjuree animate-fade-in">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brown border-t-transparent" />
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    </div>
  );
}
