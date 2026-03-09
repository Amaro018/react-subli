import React from "react"

const AdminCharts = () => {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Revenue Chart Placeholder */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
        <h3 className="mb-6 text-lg font-semibold text-gray-800">Weekly Revenue</h3>
        <div className="flex h-64 items-end justify-between gap-2 px-2">
          {[45, 70, 35, 90, 60, 85, 50].map((height, i) => (
            <div key={i} className="group relative w-full flex flex-col justify-end gap-2">
              <div
                className="w-full rounded-t bg-[#111b52]/10 transition-all duration-300 hover:bg-[#111b52]"
                style={{ height: `${height}%` }}
              ></div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-xs font-medium text-gray-500 px-2">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>

      {/* Recent Activity / Stats Placeholder */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
        <h3 className="mb-6 text-lg font-semibold text-gray-800">Recent Activity</h3>
        <div className="space-y-6">
          {[
            {
              title: "New Order #2562",
              time: "2 mins ago",
              type: "order",
              color: "bg-green-100 text-green-600",
            },
            {
              title: "New User Registration",
              time: "15 mins ago",
              type: "user",
              color: "bg-blue-100 text-blue-600",
            },
            {
              title: "Product Stock Alert",
              time: "1 hour ago",
              type: "alert",
              color: "bg-red-100 text-red-600",
            },
            {
              title: "Order #2560 Delivered",
              time: "3 hours ago",
              type: "order",
              color: "bg-green-100 text-green-600",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${item.color
                    .split(" ")[1]
                    .replace("text", "bg")}`}
                ></div>
                <span className="text-sm font-medium text-gray-700">{item.title}</span>
              </div>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminCharts
