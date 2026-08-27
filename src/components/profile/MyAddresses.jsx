import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Edit, Trash2 } from 'lucide-react';
import AddressModal from './AddressModal';
import useApi from '../../hooks/useApi';
import { userAPI } from '../../api';
import { toast } from 'react-toastify';

const MyAddresses = () => {
    const { user, token, login } = useAuth();
    const { callApi, loading } = useApi();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const openModal = (address = null) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingAddress(null);
        setIsModalOpen(false);
    };

    const handleSave = (updatedUser) => {
        login(updatedUser, token);
    };

    const handleDelete = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                const res = await callApi(userAPI.deleteUserAddress({ addressId }, token));
                if (res.success) {
                    toast.success('Address deleted successfully!');
                    login(res.data, token);
                }
            } catch (error) {
                toast.error('Failed to delete address.');
                console.error(error);
            }
        }
    };

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Addresses</h2>
                <button
                    onClick={() => openModal()}
                    className="flex w-fit items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 font-medium text-white transition hover:bg-slate-700 sm:px-5"
                >
                    <MapPin className="w-4 h-4" />
                    Add New Address
                </button>
            </div>

            {user.address?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.address.map((addr, i) => (
                        <div
                            key={i}
                            className="p-6 border-2 border-gray-200 rounded-xl hover:border-slate-300 transition bg-gradient-to-br from-white to-gray-50"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-slate-800 p-2 rounded-lg">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openModal(addr)}
                                        className="text-slate-600 hover:text-slate-800"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(addr._id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 text-gray-700">
                                <p className="font-semibold text-gray-900">{addr.street}</p>
                                <p>{addr.city}, {addr.state} {addr.zip}</p>
                                <p className="text-sm text-gray-600">{addr.country}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-12 h-12 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved addresses</h3>
                    <p className="text-gray-500 mb-6">Add an address for faster checkout</p>
                    <button
                        onClick={() => openModal()}
                        className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-medium"
                    >
                        Add Address
                    </button>
                </div>
            )}

            <AddressModal
                isOpen={isModalOpen}
                onClose={closeModal}
                address={editingAddress}
                onSave={handleSave}
            />
        </div>
    );
};

export default MyAddresses;