"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Swal from "sweetalert2";
import ProtectedRoute from "@/app/components/ProtectedRoute";

interface Order {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  total: number;
  discount: number;
  orderDate: string;
  status: string | null;
  cartItems: { productName: string; image: string }[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    client
      .fetch(
        `*[_type == "order"]{
          _id,
          firstName,
          lastName,
          phone,
          email,
          address,
          city,
          zipCode,
          total,
          discount,
          orderDate,
          status,
          cartItems[]->{
            productName,
            image
          }
        }`
      )
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const filteredOrders =
    filter === "All" ? orders : orders.filter((order) => order.status === filter);

  const toggleOrderDetails = (orderId: string) => {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleDelete = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await client.delete(orderId);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      Swal.fire("Deleted!", "Your order has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire("Error!", "Something went wrong while deleting.", "error");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await client.patch(orderId).set({ status: newStatus }).commit();

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      Swal.fire("Updated!", `Order marked as ${newStatus}.`, "success");
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire("Error!", "Something went wrong while updating the status.", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* Navbar */}
        <nav className="bg-[#FF9F0D] text-white p-4 shadow-md flex flex-col sm:flex-row justify-between items-center">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            {["All", "pending", "dispatch", "success"].map((status) => (
              <button
                key={status}
                className={`px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${
                  filter === status
                    ? "bg-white text-[#FF9F0D] font-bold shadow"
                    : "bg-[#FF7600] hover:bg-red-500"
                }`}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </nav>

        {/* Orders Table */}
        <div className="flex-1 p-4 overflow-x-auto">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <h2 className="text-2xl font-bold p-4 text-center text-gray-800">Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-black md:text-base">
                <thead className="bg-gray-50 text-[#FF7600]">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Customer</th>
                    <th className="p-2">Address</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Total</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr
                        className="hover:bg-gray-100 transition-all cursor-pointer"
                        onClick={() => toggleOrderDetails(order._id)}
                      >
                        <td className="p-2">{order._id}</td>
                        <td className="p-2">{order.firstName} {order.lastName}</td>
                        <td className="p-2">{order.address}</td>
                        <td className="p-2">{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td className="p-2">${order.total}</td>
                        <td className="p-2">
                          <select
                            value={order.status || ""}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="bg-gray-100 p-1 rounded text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="dispatch">Dispatch</option>
                            <option value="success">Completed</option>
                          </select>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(order._id);
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800 transition text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {selectedOrderId === order._id && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="p-4">
                            <div className="border rounded p-4">
                              <h3 className="font-bold mb-2">Order Details</h3>
                              <p><strong>Phone:</strong> {order.phone}</p>
                              <p><strong>Email:</strong> {order.email}</p>
                              <p><strong>City:</strong> {order.city}</p>
                              <h4 className="font-medium mt-2">Items:</h4>
                              <ul className="list-disc pl-5">
                                {order.cartItems.map((item, index) => (
                                  <li key={`${order._id}-${index}`} className="flex items-center gap-2">
                                    {item.productName}
                                    {item.image && (
                                      <Image
                                        src={urlFor(item.image).url()}
                                        width={40}
                                        height={40}
                                        alt={item.productName}
                                        className="rounded"
                                      />
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
