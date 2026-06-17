import React from 'react';
import './DashboardHome.css';

const DashboardHome = () => {
  return (
    <div className="dashboard-home">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-text">
          <h1>Chào mừng bạn đến với trang quản lý.</h1>
          <p>Hệ thống quản lý chuỗi cung ứng nông sản xuất khẩu Nam Đô Group. Theo dõi lô hàng, đối tác, vùng trồng và kho hàng theo thời gian thực.</p>
        </div>
        <div className="banner-illustration">
          <div className="illustration-wrapper">
            <svg viewBox="0 0 200 150" className="banner-svg">
              {/* Clock on Wall */}
              <circle cx="160" cy="40" r="15" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
              <line x1="160" y1="40" x2="160" y2="32" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
              <line x1="160" y1="40" x2="168" y2="40" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
              
              {/* Table */}
              <rect x="20" y="110" width="160" height="8" rx="4" fill="#64748b" />
              <line x1="40" y1="118" x2="40" y2="140" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
              <line x1="160" y1="118" x2="160" y2="140" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
              
              {/* Plant */}
              <path d="M165,95 Q175,85 170,75 Q160,85 165,95 Z" fill="#10b981" />
              <path d="M175,100 Q185,95 180,88 Q170,95 175,100 Z" fill="#059669" />
              <rect x="166" y="95" width="8" height="15" fill="#d97706" rx="2" />
              
              {/* Laptop */}
              <rect x="80" y="85" width="45" height="25" rx="3" fill="#94a3b8" />
              <polygon points="70,110 135,110 125,112 80,112" fill="#cbd5e1" />
              <rect x="85" y="89" width="35" height="18" fill="#38bdf8" opacity="0.8" />
              
              {/* Man Sitting */}
              {/* Body */}
              <path d="M110,120 L130,120 L135,140 L105,140 Z" fill="#1e3a8a" />
              {/* Shirt/Torso */}
              <path d="M110,120 Q120,95 130,95 L145,120 Z" fill="#4f46e5" />
              {/* Arm/Hand */}
              <path d="M125,105 Q100,105 95,107" stroke="#fbcfe8" strokeWidth="6" strokeLinecap="round" fill="none" />
              {/* Head */}
              <circle cx="130" cy="80" r="12" fill="#fbcfe8" />
              {/* Hair */}
              <path d="M118,78 Q125,65 138,72 C142,78 135,80 130,80 Z" fill="#1e293b" />
              {/* Beard */}
              <path d="M122,85 Q130,95 136,87" fill="#1e293b" />
            </svg>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {/* Card 1 */}
        <div className="stat-card">
          <div className="stat-card-content">
            <span className="stat-number">140</span>
            <span className="stat-label">Tổng số hàng tồn</span>
          </div>
          <div className="stat-icon-wrapper blue-bg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="stat-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="stat-card">
          <div className="stat-card-content">
            <span className="stat-number">10</span>
            <span className="stat-label">Số lượng hàng bán ra</span>
          </div>
          <div className="stat-icon-wrapper green-bg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="stat-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>

        {/* Card 3 */}
        <div className="stat-card">
          <div className="stat-card-content">
            <span className="stat-number">62,625,000đ</span>
            <span className="stat-label">Tổng tiền đã thanh toán</span>
          </div>
          <div className="stat-icon-wrapper purple-bg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="stat-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
