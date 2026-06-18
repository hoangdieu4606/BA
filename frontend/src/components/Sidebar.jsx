import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
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
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </span>
          <span className="nav-text">Trang chủ</span>
        </div>

        {/* DANH MỤC */}
        <div className="sidebar-category">DANH MỤC</div>
        
        {/* Lô hàng */}
        <div className="menu-group">
          <div className={`nav-item parent ${isGroupActive('lo-hang-') ? 'active' : ''}`}>
            <div className="nav-item-left">
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="1" y="3" width="22" height="5" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
              </span>
              <span className="nav-text">Lô hàng</span>
            </div>
            <span className="chevron">›</span>
          </div>
          
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
              className={`sub-item ${activeTab === 'lo-hang-cach-ly' ? 'active' : ''}`}
              onClick={() => setActiveTab('lo-hang-cach-ly')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Cách ly
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
            </li>
            <li 
              className={`sub-item ${activeTab === 'lo-hang-loi' ? 'active' : ''}`}
              onClick={() => setActiveTab('lo-hang-loi')}
            >
              Lô hàng lỗi
            </li>
            <li 
              className={`sub-item ${activeTab === 'lo-hang-tra-cuu' ? 'active' : ''}`}
              onClick={() => setActiveTab('lo-hang-tra-cuu')}
            >
              Tra cứu
            </li>
          </ul>
        </div>

        {/* Người dùng */}
        <div className="menu-group">
          <div className={`nav-item parent ${isGroupActive('nguoi-dung-') || activeTab === 'personnel' ? 'active' : ''}`}>
            <div className="nav-item-left">
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span className="nav-text">Người dùng</span>
            </div>
            <span className="chevron">›</span>
          </div>
          
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
        </div>

        {/* Bao bì đóng gói */}
        <div className="menu-group">
          <div className={`nav-item parent ${isGroupActive('bao-bi-') ? 'active' : ''}`}>
            <div className="nav-item-left">
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </span>
              <span className="nav-text">Bao bì đóng gói</span>
            </div>
            <span className="chevron">›</span>
          </div>
          
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
        </div>


        {/* QUẢN LÝ */}
        <div className="sidebar-category">QUẢN LÝ</div>

        <div 
          className={`nav-item ${activeTab === 'quan-ly-hop-dong' ? 'active' : ''}`}
          onClick={() => setActiveTab('quan-ly-hop-dong')}
        >
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </span>
          <span className="nav-text">Quản lý hợp đồng</span>
        </div>

        <div 
          className={`nav-item ${activeTab === 'quan-ly-vung-trong' ? 'active' : ''}`}
          onClick={() => setActiveTab('quan-ly-vung-trong')}
        >
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <span className="nav-text">Quản lý vùng trồng</span>
        </div>

        <div 
          className={`nav-item ${activeTab === 'quan-ly-kho' ? 'active' : ''}`}
          onClick={() => setActiveTab('quan-ly-kho')}
        >
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="9" y1="22" x2="9" y2="16" />
              <line x1="15" y1="22" x2="15" y2="16" />
              <line x1="9" y1="16" x2="15" y2="16" />
              <path d="M9 8h6M9 12h6" />
            </svg>
          </span>
          <span className="nav-text">Quản lý kho</span>
        </div>

      </nav>
    </aside>
  );
};

export default Sidebar;
