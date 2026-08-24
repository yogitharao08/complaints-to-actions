import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Plus,
  UserRound,
  Users
} from "lucide-react";
import { getStoredUser, listNotifications, markNotificationRead } from "../../api.js";
import { ThemeToggle } from "./ThemeToggle.jsx";

export function Shell({ role, active, setActive, children, onExit, theme, onThemeChange }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const user = getStoredUser();
  const userName = user?.name || "User";
  const userInitials = userName.slice(0, 2).toUpperCase();

  const nav = role === "Citizen"
    ? [["Dashboard", LayoutDashboard], ["My Complaints", ClipboardList], ["File Complaint", Plus], ["Profile", UserRound]]
    : role === "Officer"
      ? [["Dashboard", LayoutDashboard], ["Assigned Complaints", ClipboardList], ["Profile", UserRound]]
      : [["Dashboard", LayoutDashboard], ["All Complaints", ClipboardList], ["Users", Users], ["Departments", Building2], ["Profile", UserRound]];
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const headerNav = nav.filter(([label]) => label !== "Profile");

  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    listNotifications().then(setNotifications).catch(() => setNotifications([]));
  }, [role]);

  async function readNotification(note) {
    if (!note.isRead) {
      await markNotificationRead(note._id || note.id).catch(() => null);
      setNotifications((items) => items.map((item) => (item._id || item.id) === (note._id || note.id) ? { ...item, isRead: true } : item));
    }
  }

  return (
    <div className="portal-container">
      <header className="portal-header">
        <div className="header-brand">
          <Building2 size={24} />
          <div>
            <h1>Complaint to Action</h1>
            <p>{role} Portal</p>
          </div>
        </div>

        <nav className="header-nav">
          {headerNav.map(([label, Icon]) => (
            <button
              className={active === label ? "active nav-link" : "nav-link"}
              key={label}
              onClick={() => setActive(label)}
              type="button"
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <div className="notification-wrapper" ref={notificationsRef}>
            <button
              className="action-btn notification-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              type="button"
              aria-label="View notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="header-notification-panel">
                <div className="panel-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      className="mark-all-read-btn"
                      onClick={async () => {
                        const unreadNotes = notifications.filter((n) => !n.isRead);
                        await Promise.all(
                          unreadNotes.map((n) => markNotificationRead(n._id || n.id).catch(() => null))
                        );
                        setNotifications((items) =>
                          items.map((item) => ({ ...item, isRead: true }))
                        );
                      }}
                      type="button"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="panel-content">
                  {notifications.length === 0 && <p className="empty-text">No notifications yet.</p>}
                  {notifications.map((note) => (
                    <button
                      className={note.isRead ? "notification-item" : "notification-item unread"}
                      key={note._id || note.id}
                      onClick={() => {
                        readNotification(note);
                        setShowNotifications(false);
                      }}
                      type="button"
                    >
                      <strong>{note.title}</strong>
                      <span>{note.message}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />

          <div className="profile-wrapper" ref={profileMenuRef}>
            <button
              className="profile-avatar-btn"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              type="button"
              aria-label="User profile menu"
            >
              {userInitials}
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-header">
                  <strong>{userName}</strong>
                  <span>{role}</span>
                </div>
                <div className="profile-dropdown-divider"></div>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setActive("Profile");
                    setShowProfileMenu(false);
                  }}
                  type="button"
                >
                  <UserRound size={14} />
                  <span>View Profile</span>
                </button>
                <div className="profile-dropdown-divider"></div>
                <button
                  className="dropdown-item logout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onExit();
                  }}
                  type="button"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="portal-body">
        <main className="content simple-content">{children}</main>
      </div>
    </div>
  );
}
