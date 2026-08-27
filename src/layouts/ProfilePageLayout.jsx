import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Edit,
  ShoppingBag,
} from "lucide-react";
import { NavLink, useLocation } from "react-router";
import useApi from "../hooks/useApi";
import { orderAPI } from "../api";
import { resolveImageUrl } from "../utils/imageUrl";

const profileTabs = [
  {
    name: "Profile",
    path: "/profile",
    icon: User,
  },
  {
    name: "Order History",
    path: "/orders",
    icon: Package,
  },
  {
    name: "My Addresses",
    path: "/address",
    icon: MapPin,
  },
];

const ProfilePageLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const { callApi } = useApi();
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await callApi(orderAPI.getMyOrders());
        if (res.success) setOrderCount((res.data || []).length);
      } catch {
        setOrderCount(0);
      }
    };
    if (user) load();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">
            Please log in to view your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <img
                src={resolveImageUrl(user.cover) || "https://via.placeholder.com/120"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
              />
              <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition">
                <Edit className="w-4 h-4 text-gray-700" />
              </button>
            </div>
            <div className="text-white text-center md:text-left flex-1">
              <h1 className="text-4xl font-bold mb-2">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-slate-200 text-lg mb-1 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              <p className="text-slate-200 text-lg flex items-center justify-center md:justify-start gap-2">
                <Phone className="w-4 h-4" />
                {user.mobile || "N/A"}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-lg text-center">
                <ShoppingBag className="w-6 h-6 text-white mx-auto mb-1" />
                <div className="text-2xl font-bold text-white">{orderCount}</div>
                <div className="text-xs text-slate-200">Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
              <div className="p-5 bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                <h2 className="font-bold text-gray-800 text-lg">My Account</h2>
              </div>
              <nav className="flex flex-col p-2">
                {profileTabs.map((tab) => (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      location.pathname === tab.path
                        ? "bg-slate-800 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageLayout;
