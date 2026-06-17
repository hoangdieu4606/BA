import React from 'react';
import './DepartmentTable.css';

const DepartmentTable = ({ toggleFilter, isFilterOpen }) => {
  const departments = [
    { id: 1, name: 'Hội đồng quản trị', manager: 'N', count: 1, status: 'active' },
    { id: 2, name: 'Hội đồng quản trị / Ban Giám đốc điều hành', manager: 'N', count: 1, status: 'active' },
    { id: 3, name: 'Hội đồng quản trị / Ban Giám đốc điều hành / Tài chính - Kế toán', manager: null, count: 0, status: 'active' },
    { id: 4, name: 'Hội đồng quản trị / Ban Giám đốc điều hành / Nhân sự', manager: null, count: 0, status: 'active' },
    { id: 5, name: 'Hội đồng quản trị / Ban Giám đốc điều hành / Marketing', manager: null, count: 0, status: 'active' },
    { id: 6, name: 'Hội đồng quản trị / Ban Giám đốc điều hành / Kinh doanh', manager: null, count: 0, status: 'active' },
    { id: 7, name: 'Hội đồng quản trị / Ban Giám đốc điều hành / Công nghệ thông tin', manager: null, count: 0, status: 'active' },
    { id: 8, name: 'Hội đồng quản trị / Ban Giám đốc điều hành / Chăm sóc khách hàng', manager: null, count: 0, status: 'active' },
  ];

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <h2 className="table-title">Phòng ban (8)</h2>
        <div className="toolbar-actions">
          <button className="icon-btn">🔄</button>
          <button className="text-btn active">📄 Danh sách</button>
          <button className="text-btn">🗂️ Nhóm</button>
          <button className={`text-btn ${isFilterOpen ? 'active' : ''}`} onClick={toggleFilter}>
            🍸 Bộ lọc
          </button>
          <button className="text-btn">⚙️ Cài đặt</button>
          <button className="btn-primary">+ Tạo</button>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-checkbox"><input type="checkbox" /></th>
              <th className="col-status"></th>
              <th className="col-name">Tên phòng ban</th>
              <th className="col-manager">Nhân sự quản lý</th>
              <th className="col-count">Số lượng nhân sự</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept.id} className="table-row">
                <td className="col-checkbox"><input type="checkbox" /></td>
                <td className="col-status">
                  <span className={`status-dot ${dept.status}`}></span>
                </td>
                <td className="col-name">{dept.name}</td>
                <td className="col-manager">
                  {dept.manager && <div className="manager-avatar">{dept.manager}</div>}
                </td>
                <td className="col-count">{dept.count}</td>
                <td className="col-actions">
                  <button className="action-btn">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentTable;
