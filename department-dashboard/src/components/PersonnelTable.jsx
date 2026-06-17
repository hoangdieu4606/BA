import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { initialPersonnelData } from '../utils/mockData';
import { personnelData } from '../utils/traceabilityData';
import './PersonnelTable.css';

const PersonnelTable = ({ toggleFilter, isFilterOpen, onCreate, personnel, setPersonnel }) => {
  const fileInputRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(personnel.map(p => p.id).filter(Boolean));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteRow = (id) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên có mã ${id}?`)) {
      setPersonnel(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} nhân viên đã chọn?`)) {
      setPersonnel(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(personnel.map(p => ({
      'ID Nhân viên': p.id,
      'Họ và tên': `${p.lastName || ''} ${p.firstName || ''}`.trim(),
      'Chức vụ': p.assignments?.[0]?.position || '',
      'Phòng ban': p.assignments?.[0]?.department || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "NhanVien");
    
    try {
      const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
      const dataUri = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + b64;
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = 'DanhSachNhanVien.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Data URI download failed, falling back to writeFile", err);
      XLSX.writeFile(wb, "DanhSachNhanVien.xlsx");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const importedData = data.map(row => ({
        id: row['ID Nhân viên'] || row.id || '',
        name: row['Họ và tên'] || row.name || '',
        position: row['Chức vụ'] || row.position || '',
        department: row['Phòng ban'] || row.department || '',
      })).filter(p => p.id || p.name);

      // Nếu muốn giữ lại data cũ và append vào, dùng: setPersonnel([...personnel, ...importedData])
      // Hiện tại ta replace luôn
      setPersonnel(importedData);
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // Reset for same file
  };

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <h2 className="table-title">Quản lý Nhân viên ({personnel.length})</h2>
        <div className="toolbar-actions">
          {selectedIds.length > 0 && (
            <button 
              className="btn-danger" 
              onClick={handleBulkDelete}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ef4444',
                color: 'white',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginRight: '12px',
                cursor: 'pointer',
                border: 'none',
                transition: 'var(--transition)'
              }}
            >
              🗑️ Xóa đã chọn ({selectedIds.length})
            </button>
          )}
          <button className={`text-btn ${isFilterOpen ? 'active' : ''}`} onClick={toggleFilter}>
            🍸 Bộ lọc
          </button>
          <button className="text-btn" onClick={handleExport}>📥 Xuất Excel</button>
          <button className="text-btn" onClick={handleImportClick}>📤 Nhập Excel</button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls" 
            style={{ display: 'none' }} 
          />
          <button className="btn-primary" onClick={onCreate}>+ Tạo</button>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-checkbox">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll} 
                  checked={personnel.length > 0 && selectedIds.length === personnel.length}
                />
              </th>
              <th>ID Nhân viên</th>
              <th>Họ và tên</th>
              <th>Chức vụ</th>
              <th>Phòng ban</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {personnel.map((person, index) => (
              <tr key={index} className="table-row">
                <td className="col-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(person.id)}
                    onChange={() => handleSelectRow(person.id)}
                  />
                </td>
                <td>{person.id}</td>
                <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{person.lastName} {person.firstName}</td>
                <td>{person.assignments && person.assignments[0] ? person.assignments[0].position : ''}</td>
                <td>{person.assignments && person.assignments[0] ? person.assignments[0].department : ''}</td>
                <td className="col-actions">
                  <button className="action-btn">⋮</button>
                </td>
              </tr>
            ))}
            {personnel.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PersonnelTable;
