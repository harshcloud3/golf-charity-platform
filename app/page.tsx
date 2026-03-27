import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Play Golf. 
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Give Back.</span>
            <br />
            Win Big.
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Subscribe monthly or yearly, track your scores, support amazing charities, 
            and get a chance to win in our monthly draws.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup" className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition transform hover:scale-105 shadow-md">
              Start Playing
            </Link>
            <Link href="#how-it-works" className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-50 transition">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Three simple steps to start making an impact</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 hover:shadow-lg transition-shadow rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Subscribe</h3>
              <p className="text-gray-700 text-lg">Choose monthly or yearly plan. 10% goes to charity of your choice.</p>
            </div>
            <div className="text-center p-6 hover:shadow-lg transition-shadow rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Enter Scores</h3>
              <p className="text-gray-700 text-lg">Record your last 5 Stableford scores (1-45 points).</p>
            </div>
            <div className="text-center p-6 hover:shadow-lg transition-shadow rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Win & Give</h3>
              <p className="text-gray-700 text-lg">Monthly draws with prizes. Support charities while you play.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">$50K+</div>
              <div className="text-lg font-semibold">Donated to Charity</div>
            </div>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">1,000+</div>
              <div className="text-lg font-semibold">Active Golfers</div>
            </div>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">$100K+</div>
              <div className="text-lg font-semibold">Prizes Awarded</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Charities Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Featured Charities</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Every subscription supports these amazing causes</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-32 bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
                <span className="text-6xl">⛳</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Golf for Good</h3>
                <p className="text-gray-700 text-base mb-4">Supports youth golf programs and junior development initiatives across the country.</p>
                <div className="flex items-center text-green-600 font-semibold">
                  <span>Learn more →</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-32 bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
                <span className="text-6xl">🌳</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Fairways Foundation</h3>
                <p className="text-gray-700 text-base mb-4">Environmental conservation and sustainability on golf courses worldwide.</p>
                <div className="flex items-center text-green-600 font-semibold">
                  <span>Learn more →</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-32 bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
                <span className="text-6xl">❤️</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Swing for Health</h3>
                <p className="text-gray-700 text-base mb-4">Mental health initiatives and wellness programs through the sport of golf.</p>
                <div className="flex items-center text-green-600 font-semibold">
                  <span>Learn more →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of golfers who are playing with purpose
          </p>
          <Link href="/auth/signup" className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg">
            Get Started Today
          </Link>
        </div>
      </section>
    </main>
  );
}