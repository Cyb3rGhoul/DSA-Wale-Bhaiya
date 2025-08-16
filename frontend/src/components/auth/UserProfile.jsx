import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = ({ showDropdown = true }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, logoutAll } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate('/', { replace: true });
  };

  const handleLogoutAll = async () => {
    await logoutAll();
    setIsDropdownOpen(false);
    navigate('/', { replace: true });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!showDropdown) {
    // Simple user display without dropdown
    return (
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-gray-600/30"
              src={user.avatar}
              alt={user.name}
            />
          ) : (
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white/20 shadow-lg">
              <span className="text-xs sm:text-sm font-medium text-white">
                {getInitials(user.name)}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 hidden sm:block">
          <p className="text-sm font-medium text-gray-100 truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {user.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-xl hover:bg-gray-800/60 backdrop-blur-sm transition-all duration-200 border border-transparent hover:border-gray-700/40 group"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-gray-600/30 group-hover:border-gray-500/50 transition-colors duration-200"
              src={user.avatar}
              alt={user.name}
            />
          ) : (
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white/20 group-hover:border-white/30 shadow-lg transition-all duration-200">
              <span className="text-xs sm:text-sm font-medium text-white">
                {getInitials(user.name)}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 hidden sm:block">
          <p className="text-sm font-medium text-gray-100 truncate group-hover:text-white transition-colors duration-200">
            {user.name}
          </p>
          <p className="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors duration-200">
            {user.email}
          </p>
        </div>
        <ChevronDown
          className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-300 transition-all duration-200 hidden sm:block ${isDropdownOpen ? 'transform rotate-180' : ''
            }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop with highest z-index */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown Content with highest z-index */}
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-72 sm:w-80 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 z-[9999] transform opacity-0 scale-95 animate-in duration-200"
            style={{
              animation: 'dropdownIn 0.2s ease-out forwards',
              maxHeight: 'calc(100vh - 100px)',
              overflow: 'hidden'
            }}
          >
            {/* User Info Header */}
            <div className="p-4 sm:p-5 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img
                      className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 border-gray-600/50"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white/20 shadow-lg">
                      <span className="text-lg sm:text-xl font-medium text-white">
                        {getInitials(user.name)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base sm:text-lg font-semibold text-gray-100 truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-300 truncate">
                    {user.email}
                  </p>
                  {user.lastLogin && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last login: {formatDate(user.lastLogin)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2 max-h-40 overflow-y-auto">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // TODO: Implement profile settings
                }}
                className="flex items-center w-full px-4 sm:px-5 py-3 text-sm text-gray-200 hover:bg-gray-700/50 hover:text-white transition-all duration-200 group"
              >
                <Settings className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
                <span className="font-medium">Profile Settings</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // TODO: Implement sessions management
                }}
                className="flex items-center w-full px-4 sm:px-5 py-3 text-sm text-gray-200 hover:bg-gray-700/50 hover:text-white transition-all duration-200 group"
              >
                <Shield className="h-4 w-4 mr-3 text-gray-400 group-hover:text-purple-400 transition-colors duration-200" />
                <span className="font-medium">Manage Sessions</span>
              </button>
            </div>

            {/* Logout Section */}
            <div className="border-t border-gray-700/50 py-2">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 sm:px-5 py-3 text-sm text-gray-200 hover:bg-gray-700/50 hover:text-white transition-all duration-200 group"
              >
                <LogOut className="h-4 w-4 mr-3 text-gray-400 group-hover:text-green-400 transition-colors duration-200" />
                <span className="font-medium">Sign Out</span>
              </button>

              <button
                onClick={handleLogoutAll}
                className="flex items-center w-full px-4 sm:px-5 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
              >
                <LogOut className="h-4 w-4 mr-3 text-red-500 group-hover:text-red-400 transition-colors duration-200" />
                <span className="font-medium">Sign Out All Devices</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* CSS Animation Keyframes */}
      <style jsx>{`
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-in {
          animation: dropdownIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default UserProfile;