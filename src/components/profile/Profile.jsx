import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Edit, Save, X } from "lucide-react";
import useApi from "../../hooks/useApi";
import { userAPI } from "../../api";
import { toast } from "react-toastify";
import { resolveImageUrl } from "../../utils/imageUrl";

const Profile = () => {
    const { user, token, login } = useAuth();
    const { callApi, loading } = useApi();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                mobile: user.mobile || "",
                gender: user.gender || "N/A",
                country_code: user.country_code || "N/A",
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        // Reset form data to original user data when canceling
        if (isEditing) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                mobile: user.mobile || "",
                gender: user.gender || "N/A",
                country_code: user.country_code || "N/A",
            });
        }
    };

    const handleInfoUpdate = async () => {
        try {
            const res = await callApi(userAPI.updateUserInfo(formData, token));
            if (res.success) {
                toast.success("Profile updated successfully!");
                login(res.data, token); // Update user context
                setIsEditing(false);
            }
        } catch (error) {
            toast.error("Failed to update profile.");
            console.error(error);
        }
    };

    const handlePasswordUpdate = async () => {
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        try {
            const res = await callApi(
                userAPI.updateUserPassword(
                    {
                        oldPassword: passwordData.oldPassword,
                        newPassword: passwordData.newPassword,
                    },
                    token
                )
            );
            if (res.success) {
                toast.success("Password updated successfully!");
                setPasswordData({
                    oldPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                });
            }
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update password.");
            console.error(error);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-8">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    Personal Information
                </h2>
                <button
                    onClick={handleEditToggle}
                    className="flex w-fit items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 font-medium text-white transition hover:bg-slate-700 sm:px-5"
                >
                    {isEditing ? (
                        <>
                            <X className="w-4 h-4" />
                            Cancel
                        </>
                    ) : (
                        <>
                            <Edit className="w-4 h-4" />
                            Edit Profile
                        </>
                    )}
                </button>
            </div>

            {/* Profile Image */}
            <div className="flex justify-center mb-10">
                <div className="relative">
                    <img
                        src={resolveImageUrl(user.cover) || "https://via.placeholder.com/150"}
                        alt="Profile"
                        className="w-40 h-40 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                    />
                    {isEditing && (
                        <button className="absolute bottom-2 right-2 bg-slate-800 p-3 rounded-full shadow-lg hover:bg-slate-700 transition">
                            <Edit className="w-4 h-4 text-white" />
                        </button>
                    )}
                </div>
            </div>

            {/* User Name */}
            <div className="text-center mb-10">
                <h3 className="mb-1 break-words text-2xl font-bold text-gray-900 sm:text-3xl">
                    {user.first_name} {user.last_name}
                </h3>
                <p className="text-gray-500">
                    Customer since {new Date(user.createdAt).getFullYear()}
                </p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                    </label>
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        readOnly={!isEditing}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${isEditing
                                ? "border-gray-300 bg-white text-gray-900 focus:ring-slate-400"
                                : "border-gray-200 bg-gray-50 text-gray-700"
                            }`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                    </label>
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        readOnly={!isEditing}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${isEditing
                                ? "border-gray-300 bg-white text-gray-900 focus:ring-slate-400"
                                : "border-gray-200 bg-gray-50 text-gray-700"
                            }`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        readOnly={!isEditing}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${isEditing
                                ? "border-gray-300 bg-white text-gray-900 focus:ring-slate-400"
                                : "border-gray-200 bg-gray-50 text-gray-700"
                            }`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        readOnly={!isEditing}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${isEditing
                                ? "border-gray-300 bg-white text-gray-900 focus:ring-slate-400"
                                : "border-gray-200 bg-gray-50 text-gray-700"
                            }`}
                    />
                </div>
                {isEditing && (
                    <div className="md:col-span-2">
                        <button
                            onClick={handleInfoUpdate}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                )}
            </div>

            {isEditing && (
                <div className="mt-12 pt-8 border-t border-gray-200 max-w-5xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        Change Password
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Old Password
                            </label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                            />
                        </div>
                        <div></div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmNewPassword"
                                value={passwordData.confirmNewPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                onClick={handlePasswordUpdate}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? "Saving..." : "Change Password"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
