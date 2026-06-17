import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [expanded, setExpanded] = useState({
    loHang: true,
    nguoiDung: true,
    baoBi: false
  });

  const toggleExpand = (menu) => {
    setExpanded(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Helper to check if a group has an active child
  const isGroupActive = (childPrefix) => {
    return activeTab.startsWith(childPrefix);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="https://namdogroup.vn/uploads/files/logo.png" alt="Nam Đô Group" style={{ width: '100%', maxHeight: '40px', objectFit: 'contain' }} />
      </div>
      
      <nav className="sidebar-nav">
        {/* TRANG CHỦ */}
        <div 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-text">Trang chủ</span>
        </div>

        {/* DANH MỤC */}
        <div className="sidebar-category">DANH MỤC</div>
        
        {/* Lô hàng */}
        <div className="menu-group">
          <div 
            className={`nav-item parent ${isGroupActive('lo-hang-') ? 'active' : ''}`}
            onClick={() => toggleExpand('loHang')}
          >
            <div className="nav-item-left">
              <span className="nav-icon">📦</span>
              <span className="nav-text">Lô hàng</span>
            </div>
            <span className={`chevron ${expanded.loHang ? 'expanded' : ''}`}>›</span>
          </div>
          
          {expanded.loHang && (
            <ul className="sub-menu">
              <li 
                className={`sub-item ${activeTab === 'lo-hang-tiep-nhan' ? 'active' : ''}`}
                onClick={() => setActiveTab('lo-hang-tiep-nhan')}
              >
                Tiếp nhận
              </li>
              <li 
                className={`sub-item ${activeTab === 'lo-hang-xu-ly' ? 'active' : ''}`}
                onClick={() => setActiveTab('lo-hang-xu-ly')}
              >
                Đang xử lý
              </li>
              <li 
                className={`sub-item ${activeTab === 'lo-hang-bao-quan' ? 'active' : ''}`}
                onClick={() => setActiveTab('lo-hang-bao-quan')}
              >
                Bảo quản
              </li>
              <li 
                className={`sub-item ${activeTab === 'lo-hang-loi' ? 'active' : ''}`}
                onClick={() => setActiveTab('lo-hang-loi')}
              >
                Lô hàng lỗi ⚠️
              </li>
              <li 
                className={`sub-item ${activeTab === 'lo-hang-tra-cuu' ? 'active' : ''}`}
                onClick={() => setActiveTab('lo-hang-tra-cuu')}
              >
                Tra cứu
              </li>
            </ul>
          )}
        </div>

        {/* Người dùng */}
        <div className="menu-group">
          <div 
            className={`nav-item parent ${isGroupActive('nguoi-dung-') || activeTab === 'personnel' ? 'active' : ''}`}
            onClick={() => toggleExpand('nguoiDung')}
          >
            <div className="nav-item-left">
              <span className="nav-icon">👥</span>
              <span className="nav-text">Người dùng</span>
            </div>
            <span className={`chevron ${expanded.nguoiDung ? 'expanded' : ''}`}>›</span>
          </div>
          
          {expanded.nguoiDung && (
            <ul className="sub-menu">
              <li 
                className={`sub-item ${activeTab === 'nguoi-dung-tai-khoan' ? 'active' : ''}`}
                onClick={() => setActiveTab('nguoi-dung-tai-khoan')}
              >
                Tài khoản
              </li>
              <li 
                className={`sub-item ${activeTab === 'personnel' ? 'active' : ''}`}
                onClick={() => setActiveTab('personnel')}
              >
                Nhân viên
              </li>
              <li 
                className={`sub-item ${activeTab === 'nguoi-dung-khach-hang' ? 'active' : ''}`}
                onClick={() => setActiveTab('nguoi-dung-khach-hang')}
              >
                Khách hàng
              </li>
              <li 
                className={`sub-item ${activeTab === 'nguoi-dung-doi-tac' ? 'active' : ''}`}
                onClick={() => setActiveTab('nguoi-dung-doi-tac')}
              >
                Đối tác
              </li>
            </ul>
          )}
        </div>

        {/* Bao bì đóng gói */}
        <div className="menu-group">
          <div 
            className={`nav-item parent ${isGroupActive('bao-bi-') ? 'active' : ''}`}
            onClick={() => toggleExpand('baoBi')}
          >
            <div className="nav-item-left">
              <span className="nav-icon">🏷️</span>
              <span className="nav-text">Bao bì đóng gói</span>
            </div>
            <span className={`chevron ${expanded.baoBi ? 'expanded' : ''}`}>›</span>
          </div>
          
          {expanded.baoBi && (
            <ul className="sub-menu">
              <li 
                className={`sub-item ${activeTab === 'bao-bi-tuoi-xuat-khau' ? 'active' : ''}`}
                onClick={() => setActiveTab('bao-bi-tuoi-xuat-khau')}
              >
                Trái tươi xuất khẩu
              </li>
              <li 
                className={`sub-item ${activeTab === 'bao-bi-dong-lanh' ? 'active' : ''}`}
                onClick={() => setActiveTab('bao-bi-dong-lanh')}
              >
                Nguyên trái đông lạnh
              </li>
              <li 
                className={`sub-item ${activeTab === 'bao-bi-mui-com' ? 'active' : ''}`}
                onClick={() => setActiveTab('bao-bi-mui-com')}
              >
                Múi cơm
              </li>
              <li 
                className={`sub-item ${activeTab === 'bao-bi-say-kho' ? 'active' : ''}`}
                onClick={() => setActiveTab('bao-bi-say-kho')}
              >
                Sấy khô
              </li>
            </ul>
          )}
        </div>

        {/* Vận chuyển */}
        <div 
          className={`nav-item ${activeTab === 'van-chuyen' ? 'active' : ''}`}
          onClick={() => setActiveTab('van-chuyen')}
        >
          <span className="nav-icon">🚚</span>
          <span className="nav-text">Vận chuyển</span>
        </div>

        {/* QUẢN LÝ */}
        <div className="sidebar-category">QUẢN LÝ</div>

        <div 
          className={`nav-item ${activeTab === 'quan-ly-hop-dong' ? 'active' : ''}`}
          onClick={() => setActiveTab('quan-ly-hop-dong')}
        >
          <span className="nav-icon">📄</span>
          <span className="nav-text">Quản lý hợp đồng</span>
        </div>

        <div 
          className={`nav-item ${activeTab === 'quan-ly-vung-trong' ? 'active' : ''}`}
          onClick={() => setActiveTab('quan-ly-vung-trong')}
        >
          <span className="nav-icon">🚜</span>
          <span className="nav-text">Quản lý vùng trồng</span>
        </div>

        <div 
          className={`nav-item ${activeTab === 'quan-ly-kho' ? 'active' : ''}`}
          onClick={() => setActiveTab('quan-ly-kho')}
        >
          <span className="nav-icon">🏢</span>
          <span className="nav-text">Quản lý kho</span>
        </div>

      </nav>
    </aside>
  );
};

export default Sidebar;
