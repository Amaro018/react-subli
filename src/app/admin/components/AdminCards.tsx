"use client"
import { useQuery } from "@blitzjs/rpc"
import getShops from "../../queries/getShops"

export default function AdminCards() {
    // Fetch shops using the useQuery hook
    const [shops, refetch] = useQuery(getShops, {})

    // Filter and count shops based on status
    const pendingShops = shops?.filter(shop => shop.status === "pending").length || 0;
    const approvedShops = shops?.filter(shop => shop.status === "approved").length || 0;
    const rejectedShops = shops?.filter(shop => shop.status === "rejected").length || 0;

    console.log("Shops: ", shops);

    return (
        <>
            <div className="flex flex-row gap-4 w-full">
                {/* Pending Shops */}
                <div className="flex flex-col items-center p-2 gap-2 shadow-lg shadow-slate-500 rounded-lg w-full">
                    <h1>Pending Shops</h1>
                    <p className="text-2xl">{pendingShops}</p>
                </div>

                {/* Approved Shops */}
                <div className="flex flex-col items-center p-2 gap-2 shadow-lg shadow-slate-500 rounded-lg w-full">
                    <h1>Approved Shops</h1>
                    <p className="text-2xl">{approvedShops}</p>
                </div>

                {/* Rejected Shops */}
                <div className="flex flex-col items-center gap-2  p-2 shadow-lg shadow-slate-500 rounded-lg w-full">
                    <h1>Rejected Shops</h1>
                    <p className="text-2xl">{rejectedShops}</p>
                </div>
            </div>
        </>
    );
}

