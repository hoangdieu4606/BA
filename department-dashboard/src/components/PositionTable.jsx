import React from 'react';
import { initialPersonnelData } from '../utils/mockData';
import './DepartmentTable.css'; // Sử dụng lại style của bảng phòng ban

const PositionTable = ({ toggleFilter, isFilterOpen }) => {
  // Lọc ra các chức vụ độc nhất và đếm số nhân sự
  const positionsMap = {};
  
  initialPersonnelData.forEach(p => {
    // Đếm nhân sự cho từng chức vụ (nếu một người có nhiều chức vụ thì đếm cho mỗi chức vụ)
    p.assignments.forEach(a => {
      if (a.position) {
        if (!positionsMap[a.position]) {
          positionsMap[a.position] = {
            name: a.position,
            employeeCount: 0
          };
        }
        positionsMap[a.position].employeeCount += 1;
      }
    });
  });
  
  const positionsList = Object.values(positionsMap);

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <h2 className="table-title">Quản lý Chức vụ ({positionsList.length})</h2>
        <div className="toolbar-actions">
          <button className={`text-btn ${isFilterOpen ? 'active' : ''}`} onClick={toggleFilter}>
            🍸 Bộ lọc
          </button>
          <button className="text-btn">📥 Xuất Excel</button>
          <button className="btn-primary">+ Tạo mới</button>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-checkbox"><input type="checkbox" /></th>
              <th>Tên chức vụ</th>
              <th>Số lượng nhân sự</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {positionsList.map((pos, index) => (
              <tr key={index} className="table-row">
                <td className="col-checkbox"><input type="checkbox" /></td>
                <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{pos.name}</td>
                <td>{pos.employeeCount} nhân sự</td>
                <td className="col-actions">
                  <button className="action-btn">⋮</button>
                </td>
              </tr>
            ))}
            {positionsList.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '32px' }}>Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionTable;
