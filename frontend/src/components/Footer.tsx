export default function Footer() {
  return (
    <footer className="bg-[#050505] text-gray-300 py-12 mt-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <img src="/logo.png" alt="MobileShop Logo" className="h-32 w-auto mb-4 object-contain" />
            <p className="text-sm text-gray-400">
              Your one-stop destination for the latest and greatest mobile devices and accessories. Quality guaranteed.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-orange-500 transition-colors">Home</a></li>
              <li><a href="/shop" className="hover:text-orange-500 transition-colors">Shop</a></li>
              <li><a href="/categories" className="hover:text-orange-500 transition-colors">Categories</a></li>
              <li><a href="/contact" className="hover:text-orange-500 transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/faq" className="hover:text-orange-500 transition-colors">FAQ</a></li>
              <li><a href="/returns" className="hover:text-orange-500 transition-colors">Returns & Exchanges</a></li>
              <li><a href="/shipping" className="hover:text-orange-500 transition-colors">Shipping Information</a></li>
              <li><a href="/track" className="hover:text-orange-500 transition-colors">Track Order</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <div className="flex">
              <input type="email" placeholder="Enter your email" className="w-full px-4 py-2 rounded-l-md bg-[#111] border border-gray-700 text-white focus:outline-none focus:border-orange-500" />
              <button className="bg-orange-500 px-4 py-2 rounded-r-md text-white hover:bg-orange-600 transition-colors">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} MobileShop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
