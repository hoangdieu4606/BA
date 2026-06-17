import React, { useState, useEffect, useRef } from 'react';
import './Header.css';

const Header = ({ role, setRole }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        {role === 'employee' && (
          <div className="employee-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>NAM ĐÔ GROUP</span>
            <span className="badge-class info" style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '12px' }}>Cổng thông tin Nhân viên</span>
          </div>
        )}
      </div>
      <div className="header-right">
        <div className="user-actions" ref={dropdownRef}>
          <div className="notification-bell" title="Thông báo">
            🔔
            <span className="badge">2</span>
          </div>
          <div className="grid-icon" title="Ứng dụng">⋮⋮</div>
          <div 
            className="user-avatar-container" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ position: 'relative', cursor: 'pointer' }}
            title="Nhấp để chuyển đổi tài khoản"
          >
            <div className={`user-avatar ${role}`}>
              {role === 'admin' ? 'A' : 'N'}
            </div>
            {isDropdownOpen && (
              <div className="role-dropdown">
                <div className="dropdown-header">
                  <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>Chuyển đổi tài khoản</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vai trò truy cập hệ thống</div>
                </div>
                <div className="dropdown-divider"></div>
                <button 
                  className={`dropdown-item ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => {
                    setRole('admin');
                    setIsDropdownOpen(false);
                  }}
                >
                  <span className="item-avatar admin">A</span>
                  <div className="item-text">
                    <span className="role-title">Quản trị viên (Admin)</span>
                    <span className="role-desc">Toàn bộ quyền hệ thống</span>
                  </div>
                  {role === 'admin' && <span className="active-dot">✓</span>}
                </button>
                <button 
                  className={`dropdown-item ${role === 'employee' ? 'active' : ''}`}
                  onClick={() => {
                    setRole('employee');
                    setIsDropdownOpen(false);
                  }}
                >
                  <span className="item-avatar employee">N</span>
                  <div className="item-text">
                    <span className="role-title">Nhân viên (Employee)</span>
                    <span className="role-desc">Xem, tra cứu & tạo mới lô hàng</span>
                  </div>
                  {role === 'employee' && <span className="active-dot">✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
