import Navbar from "@/components/Navbar";
import TeamGallery from "@/components/TeamGallery";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sky-900 mb-2">
            My Teams
          </h1>
          <p className="text-sky-600">
            Manage your scouting data
          </p>
        </div>
        
        <TeamGallery />
      </main>
    </div>
  );
}
