import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-[#0a0a0a] text-gray-100">
      {/* Hero Section (New Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Banner (Left) */}
          <div className="lg:w-2/3 relative rounded-2xl overflow-hidden group shadow-lg h-[400px] lg:h-[500px]">
            <img 
              src="https://images.unsplash.com/photo-1601784551446-20c9e07cd5d3?w=1000&q=80" 
              alt="Main Promotion" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center p-10">
              <span className="text-orange-500 font-bold tracking-wider mb-2 uppercase text-sm">Special Offer</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                Upgrade to the <br /> <span className="text-orange-500">Latest Tech</span>
              </h2>
              <p className="text-gray-300 mb-8 max-w-md">Get the best deals on premium smartphones and accessories. Limited time only!</p>
              <div>
                <Link href="/shop" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-orange-500/30">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Side Banners (Right) */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="relative rounded-2xl overflow-hidden group shadow-lg flex-1 min-h-[190px] lg:min-h-0 lg:h-[238px]">
              <img 
                src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=600&q=80" 
                alt="Promotion 1" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white mb-1">New Arrivals</h3>
                <p className="text-orange-400 font-medium">Explore Collection &rarr;</p>
              </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden group shadow-lg flex-1 min-h-[190px] lg:min-h-0 lg:h-[238px]">
              <img 
                src="https://images.unsplash.com/photo-1572569531935-eb4ae3700b18?w=600&q=80" 
                alt="Promotion 2" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white mb-1">Accessories</h3>
                <p className="text-orange-400 font-medium">Up to 40% Off &rarr;</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Bar */}
        <div className="mt-8 bg-[#111] border border-gray-800 rounded-2xl p-6 hidden md:flex flex-wrap justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 p-3 rounded-full text-orange-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-gray-300 font-medium text-sm">36 Months EMI</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 p-3 rounded-full text-orange-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            </div>
            <span className="text-gray-300 font-medium text-sm">Fastest Home Delivery</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 p-3 rounded-full text-orange-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </div>
            <span className="text-gray-300 font-medium text-sm">Exchange Facility</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 p-3 rounded-full text-orange-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            <span className="text-gray-300 font-medium text-sm">Best Price Deals</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 p-3 rounded-full text-orange-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <span className="text-gray-300 font-medium text-sm">After-Sales Service</span>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-white">Featured Products</h2>
          <Link href="/shop" className="text-orange-500 hover:text-orange-400 font-medium transition-colors">View All &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-[#111] rounded-2xl shadow-sm border border-gray-800 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group cursor-pointer flex flex-col h-full overflow-hidden">
              <div className="h-48 bg-[#1a1a1a] relative overflow-hidden flex items-center justify-center border-b border-gray-800">
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <span className="text-gray-600">Product Image</span>
                </div>
                {item === 1 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">SALE</span>
                )}
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-1 group-hover:text-orange-400 transition-colors">iPhone 15 Pro Max</h3>
                  <p className="text-sm text-gray-500 mb-3">Apple • Smartphone</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <span className="text-xl font-bold text-white">$1,199</span>
                    {item === 1 && <span className="text-sm text-gray-500 line-through ml-2">$1,299</span>}
                  </div>
                  <button className="bg-gray-800 text-gray-300 p-2 rounded-full hover:bg-orange-600 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-[#050505] py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Smartphones', 'Tablets', 'Laptops', 'Accessories'].map((cat, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="bg-[#111] rounded-full w-32 h-32 mx-auto flex items-center justify-center mb-4 group-hover:bg-orange-600/10 group-hover:border group-hover:border-orange-500/50 transition-all duration-300 shadow-sm">
                  <span className="text-gray-500 group-hover:text-orange-500">{cat[0]}</span>
                </div>
                <h3 className="text-center font-medium text-gray-300 group-hover:text-orange-400 transition-colors">{cat}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
