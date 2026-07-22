"use client";
import { useGetStaffForAccountManager } from "@/hooks/account-manager/staff";
import React, { useState } from "react";
import { toast } from "sonner";
import { Inbox } from "lucide-react"; // Import the icon

// 1. Dedicated component for the Access Code cell
const AccessCodeCell = ({ staffId }) => {
  const [code, setCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleGetCode = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await fetch(
        `/api/account-manager/staff/${staffId}/access-code`
      );
      const data = await response.json();

      if (data.success) {
        setCode(data.accessCode);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (code) {
    return (
      <span className="font-mono text-gray-900 font-medium tracking-wider">
        {code}
      </span>
    );
  }

  if (isLoading) {
    return (
      <span className="text-gray-400 text-sm animate-pulse">Fetching...</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleGetCode}
        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium transition-colors"
      >
        Show Code
      </button>
      {error && <span className="text-red-500 text-xs">Failed</span>}
    </div>
  );
};

// 2. Main Staff component
const Staff = () => {
  const page = 1;
  const { data, error, refetch, isLoading } = useGetStaffForAccountManager(page);

  const staffList = data?.staffMembers || [];

  // --- Modal State Management ---
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, staff: null });
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = (staff) => {
    setDeleteModal({ isOpen: true, staff });
    setConfirmName(""); 
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, staff: null });
    setConfirmName("");
  };

  // --- Execute Delete API Call ---
  const executeDelete = async () => {
    const staffId = deleteModal.staff?._id;
    if (!staffId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/account-manager/staff`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ staffId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server returned an error:", response.status, errorText);
        toast.error(`Failed to delete (Status: ${response.status}).`);
        setIsDeleting(false);
        return;
      }

      const result = await response.json();

      if (result.success) {
        if (refetch) refetch();
        toast.success("Staff member deleted successfully");
        closeDeleteModal();
      } else {
        toast.error(result.message || "Failed to delete staff");
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-red-500 bg-red-50 rounded-md">
        <p>Error loading staff members. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Staff Members</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-500 text-lg animate-pulse">Loading staff...</p>
        </div>
      ) : staffList.length === 0 ? (
        // --- Your New Empty State UI ---
        <div className="flex flex-col w-full items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16 px-6 text-center">
          <div className="rounded-full bg-white p-3 shadow-sm border border-gray-100">
            <Inbox className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-gray-900">
            No Staff Member found
          </h3>
          <p className="mt-1 text-xs text-gray-500 max-w-sm">
            There are no Staff Members accessed yet. Create one to manage users.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Access Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffList.map((staff) => (
                <tr
                  key={staff._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {staff.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{staff.email}</div>
                    <div className="text-sm text-gray-500">{staff.mobile}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AccessCodeCell staffId={staff._id} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        staff.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {staff.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openDeleteModal(staff)}
                      className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Delete Staff Member
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              This action cannot be undone. To confirm, please type{" "}
              <strong className="text-gray-900 select-none">
                {deleteModal.staff?.name}
              </strong>{" "}
              below.
            </p>

            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={deleteModal.staff?.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-6"
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={
                  isDeleting || confirmName !== deleteModal.staff?.name
                }
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
              >
                {isDeleting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;