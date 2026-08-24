import React, { useEffect, useState } from "react";
import { deleteUserRecord, getStoredUser, listUsers, resetUserPassword, saveUserRecord } from "../../api.js";
import { UserEditModal } from "./UserEditModal.jsx";

export function UsersSimple() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listUsers().then(setUsers).catch((error) => {
      alert(error.response?.data?.message || "Users could not be loaded from MongoDB.");
    }).finally(() => setLoading(false));
  }, []);

  function saveUsers(nextUsers) {
    setUsers(nextUsers);
  }

  async function saveUser(user) {
    try {
      const saved = await saveUserRecord(user);
      const exists = users.some((item) => item.id === saved.id);
      saveUsers(exists ? users.map((item) => item.id === saved.id ? saved : item) : [saved, ...users]);
      setEditing(null);
    } catch (error) {
      alert(error.response?.data?.message || "User could not be saved.");
    }
  }

  async function resetPassword(user) {
    const nextPassword = window.prompt(`Set new password for ${user.name}`, "password");
    if (!nextPassword) return;
    try {
      await resetUserPassword(user.id, nextPassword);
      saveUsers(users.map((item) => item.id === user.id ? { ...item, password: "" } : item));
      alert(`Password reset for ${user.name}`);
    } catch (error) {
      alert(error.response?.data?.message || "Password could not be reset in MongoDB.");
    }
  }

  async function toggleStatus(user) {
    await saveUser({ ...user, status: user.status === "Active" ? "Disabled" : "Active" });
  }

  async function handleDeleteUser(userToDelete) {
    const currentUser = getStoredUser();
    if (userToDelete.id === currentUser?.id || userToDelete.id === currentUser?._id) {
      alert("You cannot delete your own account from the user list. Please use the self-deletion option in your Profile page.");
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete the user account for ${userToDelete.name}?`)) {
      try {
        await deleteUserRecord(userToDelete.id);
        setUsers(users.filter((item) => item.id !== userToDelete.id));
        alert("User account deleted successfully.");
      } catch (error) {
        alert(error.response?.data?.message || "User could not be deleted.");
      }
    }
  }

  return (
    <section className="table-card page-panel">
      <div className="table-head"><h2>Users</h2><button className="primary" onClick={() => setEditing({ id: `new-user-${Date.now()}`, name: "", email: "", mobile: "", address: "", role: "Officer - Public Roads", departmentId: "dept-roads", scope: "Public Roads", status: "Active", password: "password" })}>Create User</button></div>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Scope</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {loading && <tr><td colSpan="6">Loading users...</td></tr>}
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.scope}</td>
              <td>{user.status}</td>
              <td>
                <div className="table-actions">
                  <button className="soft small" onClick={() => setEditing(user)}>Edit</button>
                  <button className="outline small" onClick={() => resetPassword(user)}>Reset Password</button>
                  <button className="soft small" onClick={() => toggleStatus(user)}>{user.status === "Active" ? "Disable" : "Activate"}</button>
                  <button className="outline small danger-btn" onClick={() => handleDeleteUser(user)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <UserEditModal user={editing} onClose={() => setEditing(null)} onSave={saveUser} />}
    </section>
  );
}
