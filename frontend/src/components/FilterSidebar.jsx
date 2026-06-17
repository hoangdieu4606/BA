import React from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ onClose }) => {
  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3 className="filter-title">
          <span className="icon">🍸</span> Bộ lọc (7)
        </h3>
        {onClose && (
          <button className="close-sidebar-btn" onClick={onClose} title="Đóng bộ lọc">
            ×
          </button>
        )}
      </div>
      
      <div className="filter-body">
        <div className="filter-tags">
          <div className="tag">Cấp phòng ban <span className="close">×</span></div>
          <div className="tag count">+6</div>
          <button className="btn-reset">Đặt lại bộ lọc</button>
        </div>
        
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Tên phòng ban" />
        </div>
        
        <div className="filter-group">
          <label>Cấp phòng ban ⓘ</label>
          <div className="select-box">Chọn cấp phòng ban</div>
        </div>
        
        <div className="filter-group">
          <label>Trạng thái hoạt động</label>
          <div className="select-box">Trạng thái</div>
        </div>
        
        <div className="filter-group">
          <label>Nhân sự quản lý</label>
          <div className="select-box">Quản lý</div>
        </div>
        
        <div className="filter-group">
          <label>Phòng ban và cấp con ⓘ</label>
          <div className="select-box">Chọn cấp phòng ban</div>
        </div>
        
        <div className="filter-group row">
          <label>Số lượng nhân sự</label>
          <div className="range-inputs">
            <div className="input-with-symbol"><span>≥</span><input type="text" /></div>
            <span className="separator">và</span>
            <div className="input-with-symbol"><span>≤</span><input type="text" /></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
