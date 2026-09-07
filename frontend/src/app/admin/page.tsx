"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Revenue", value: "$45,231", color: "text-green-600", bg: "bg-green-100" },
          { title: "Active Orders", value: "32", color: "text-orange-500", bg: "bg-orange-900" },
          { title: "Total Customers", value: "1,204", color: "text-orange-500", bg: "bg-orange-900" },
          { title: "Low Stock Items", value: "12", color: "text-red-600", bg: "bg-red-100" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
              <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center`}>
                <div className={`w-2 h-2 rounded-full ${stat.color.replace('text', 'bg')}`}></div>
              </div>
            </div>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <Link href="/admin/orders" className="text-sm text-orange-500 hover:text-orange-700 font-medium">View all orders &rarr;</Link>
        </div>
        <p className="text-gray-500">Welcome to the Admin Dashboard. Navigate to the Orders tab to manage customer orders.</p>
      </div>
    </div>
  );
}
