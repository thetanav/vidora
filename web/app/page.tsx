import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Upload, Play, BarChart3, Zap, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-gray-900">YUX</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Dashboard
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Videos
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Analytics
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Settings
          </Link>
        </div>
        <Link href="/upload">
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Video
          </Button>
        </Link>
      </nav>

      <main className="pt-24">
        <section className="px-6 py-20 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Video Hosting for{" "}
              <span className="text-primary">Modern Teams</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Upload, manage, and share your videos with powerful analytics and
              seamless playback. Built for creators who demand excellence.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/upload">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Global CDN ensures your videos load instantly, no matter where
                  your audience is located.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Deep Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track views, engagement, and audience behavior with detailed
                  real-time analytics.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Bank-level encryption and access controls keep your content
                  safe and secure.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Videos</h2>
              <Link href="/upload">
                <Button variant="ghost" className="gap-2 text-primary">
                  <Upload className="w-4 h-4" />
                  Upload New
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-white font-bold">YUX</span>
              </div>
              <p className="text-sm">
                Modern video hosting platform for teams who care about quality.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            &copy; 2025 YUX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
