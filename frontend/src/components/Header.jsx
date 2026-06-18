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
            <div className={`user-avatar ${role}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {role === 'admin' ? 'QL' : role === 'technical' ? 'KT' : role === 'production' ? 'SX' : role === 'logistics' ? 'KV' : 'QA'}
            </div>
            {isDropdownOpen && (
              <div className="role-dropdown">
                <div className="dropdown-header">
                  <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>Chuyển đổi vai trò</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Phân quyền chức năng theo bộ phận</div>
                </div>
                <div className="dropdown-divider"></div>
                <button 
                  className={`dropdown-item ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => {
                    setRole('admin');
                    setIsDropdownOpen(false);
                  }}
                >
                  <span className="item-avatar admin">QL</span>
                  <div className="item-text">
                    <span className="role-title">Bộ phận quản lý (Admin)</span>
                    <span className="role-desc">Tất cả quyền, cập nhật & xóa lô hàng</span>
                  </div>
                  {role === 'admin' && <span className="active-dot">✓</span>}
                </button>
                <button 
                  className={`dropdown-item ${role === 'technical' ? 'active' : ''}`}
                  onClick={() => {
                    setRole('technical');
                    setIsDropdownOpen(false);
                  }}
                >
                  <span className="item-avatar technical" style={{ backgroundColor: 'var(--info)' }}>KT</span>
                  <div className="item-text">
                    <span className="role-title">Bộ phận kỹ thuật</span>
                    <span className="role-desc">Tạo mã, cập nhật kỹ thuật & đóng gói</span>
                  </div>
                  {role === 'technical' && <span className="active-dot">✓</span>}
                </button>
                <button 
                  className={`dropdown-item ${role === 'production' ? 'active' : ''}`}
                  onClick={() => {
                    setRole('production');
                    setIsDropdownOpen(false);
                  }}
                >
                  <span className="item-avatar production" style={{ backgroundColor: 'var(--success)' }}>SX</span>
                  <div className="item-text">
                    <span className="role-title">Bộ phận sản xuất</span>
                    <span className="role-desc">Xem chi tiết, cập nhật khối lượng đầu vào</span>
                  </div>
                  {role === 'production' && <span className="active-dot">✓</span>}
                </button>
                <button 
                  className={`dropdown-item ${role === 'qaqc' ? 'active' : ''}`}
                  onClick={() => {
                    setRole('qaqc');
                    setIsDropdownOpen(false);
                  }}
                >
                  <span className="item-avatar qaqc" style={{ backgroundColor: 'var(--warning)' }}>QA</span>
                  <div className="item-text">
                    <span className="role-title">Bộ phận QA/QC</span>
                    <span className="role-desc">Cập nhật kết quả kiểm dịch & vệ sinh kho</span>
                  </div>
                  {role === 'qaqc' && <span className="active-dot">✓</span>}
                </button>
                <button 
                  className={`dropdown-item ${role === 'logistics' ? 'active' : ''}`}
                  onClick={() => {
                    setRole('logistics');
                    setIsDropdownOpen(false);
                  }}
                >
                  <span className="item-avatar logistics" style={{ backgroundColor: '#a855f7' }}>KV</span>
                  <div className="item-text">
                    <span className="role-title">Bộ phận kho vận</span>
                    <span className="role-desc">Quản lý phiếu nhập kho & sức chứa</span>
                  </div>
                  {role === 'logistics' && <span className="active-dot">✓</span>}
                </button>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    localStorage.removeItem('authSession');
                    window.location.reload();
                  }}
                  style={{ 
                    padding: '10px 16px', 
                    color: '#ef4444', 
                    fontWeight: '600', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🚪</span>
                  <span>Đăng xuất</span>
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
