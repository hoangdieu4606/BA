import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { initialPersonnelData } from '../utils/mockData';
import { personnelData } from '../utils/traceabilityData';
import './PersonnelTable.css';

const API_BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

const PersonnelTable = ({ toggleFilter, isFilterOpen, onCreate, personnel, setPersonnel }) => {
  const fileInputRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [vungTrongList, setVungTrongList] = useState([]);

  // Fetch growing areas to populate assignment dropdowns
  useEffect(() => {
    fetch(`${API_BASE_URL}/vung-trong`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setVungTrongList(data);
      })
      .catch(err => console.error('Error fetching vung trong for assignments:', err));
  }, []);

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
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

  const handleDeleteRow = (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên có mã ${id}?`)) {
      fetch(`${API_BASE_URL}/personnel/${id}`, { method: 'DELETE' })
        .then(() => {
          setPersonnel(prev => prev.filter(p => p.id !== id));
          setSelectedIds(prev => prev.filter(x => x !== id));
          if (selectedEmployee?.id === id) {
            setSelectedEmployee(null);
          }
        })
        .catch(err => {
          console.error(err);
          setPersonnel(prev => prev.filter(p => p.id !== id));
          setSelectedIds(prev => prev.filter(x => x !== id));
          if (selectedEmployee?.id === id) {
            setSelectedEmployee(null);
          }
        });
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} nhân viên đã chọn?`)) {
      Promise.all(selectedIds.map(id => fetch(`${API_BASE_URL}/personnel/${id}`, { method: 'DELETE' })))
        .then(() => {
          setPersonnel(prev => prev.filter(p => !selectedIds.includes(p.id)));
          setSelectedIds([]);
        })
        .catch(err => {
          console.error(err);
          setPersonnel(prev => prev.filter(p => !selectedIds.includes(p.id)));
          setSelectedIds([]);
        });
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(personnel.map(p => ({
      'ID Nhân viên': p.id,
      'Họ và tên': `${p.lastName || ''} ${p.firstName || ''}`.trim(),
      'Độ tuổi': p.tuoi || '',
      'Sức khỏe': p.sucKhoe || '',
      'Đang tập huấn': p.dangTapHuan || 'Không',
      'Chức vụ': p.assignments?.[0]?.position || '',
      'Phòng ban': p.assignments?.[0]?.department || '',
      'Số điện thoại': p.sdt || '',
      'Email': p.email || '',
      'Vùng trồng phụ trách': p.vungTrongPhuTrach || '',
      'Kho hàng phụ trách': p.khoPhuTrach || '',
      'Đánh giá chất lượng': p.kiemDinhChatLuong || '',
      'Kết quả công việc': p.ketQuaCongViec || ''
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
      
      const importedData = data.map(row => {
        const fullName = row['Họ và tên'] || row.name || '';
        return {
          id: row['ID Nhân viên'] || row.id || '',
          lastName: '',
          firstName: fullName,
          tuoi: row['Độ tuổi'] || row.tuoi || '',
          sucKhoe: row['Sức khỏe'] || row.sucKhoe || '',
          dangTapHuan: row['Đang tập huấn'] || row.dangTapHuan || 'Không',
          sdt: row['Số điện thoại'] || row.sdt || '',
          email: row['Email'] || row.email || '',
          vungTrongPhuTrach: row['Vùng trồng phụ trách'] || row.vungTrongPhuTrach || '',
          khoPhuTrach: row['Kho hàng phụ trách'] || row.khoPhuTrach || '',
          kiemDinhChatLuong: row['Đánh giá chất lượng'] || row.kiemDinhChatLuong || '',
          ketQuaCongViec: row['Kết quả công việc'] || row.ketQuaCongViec || '',
          assignments: [
            {
              position: row['Chức vụ'] || row.position || 'Chưa phân bổ',
              department: row['Phòng ban'] || row.department || 'Chưa phân bổ'
            }
          ]
        };
      }).filter(p => p.id || p.firstName);

      setPersonnel(importedData);
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // Reset for same file
  };

  const handleRowDoubleClick = (person) => {
    setSelectedEmployee(person);
    setIsEditing(false);
  };

  const handleEditClick = (person, e) => {
    if (e) e.stopPropagation();
    setSelectedEmployee(person);
    setEditData({
      id: person.id,
      firstName: person.firstName || '',
      lastName: person.lastName || '',
      tuoi: person.tuoi || '',
      sucKhoe: person.sucKhoe || '',
      dangTapHuan: person.dangTapHuan || 'Không',
      bo_phan: person.assignments?.[0]?.department || '',
      chuc_vu: person.assignments?.[0]?.position || '',
      sdt: person.sdt || '',
      email: person.email || '',
      vungTrongPhuTrach: person.vungTrongPhuTrach || '',
      khoPhuTrach: person.khoPhuTrach || '',
      kiemDinhChatLuong: person.kiemDinhChatLuong || '',
      ketQuaCongViec: person.ketQuaCongViec || ''
    });
    setIsEditing(true);
    setActiveMenuId(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = (e) => {
    if (e) e.preventDefault();
    const payload = {
      ten_nv: `${editData.lastName} ${editData.firstName}`.trim(),
      tuoi: editData.tuoi,
      suc_khoe: editData.sucKhoe,
      dang_tap_huan: editData.dangTapHuan,
      bo_phan: editData.bo_phan,
      chuc_vu: editData.chuc_vu,
      sdt: editData.sdt,
      email: editData.email,
      vung_trong_phu_trach: editData.vungTrongPhuTrach,
      kho_phu_trach: editData.khoPhuTrach,
      kiem_dinh_chat_luong: editData.kiemDinhChatLuong,
      ket_qua_cong_viec: editData.ketQuaCongViec
    };

    fetch(`${API_BASE_URL}/personnel/${editData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        const updatedEmp = {
          id: editData.id,
          firstName: editData.firstName,
          lastName: editData.lastName,
          tuoi: editData.tuoi,
          sucKhoe: editData.sucKhoe,
          dangTapHuan: editData.dangTapHuan,
          assignments: [
            {
              department: editData.bo_phan,
              position: editData.chuc_vu
            }
          ],
          sdt: editData.sdt,
          email: editData.email,
          vungTrongPhuTrach: editData.vungTrongPhuTrach,
          khoPhuTrach: editData.khoPhuTrach,
          kiemDinhChatLuong: editData.kiemDinhChatLuong,
          ketQuaCongViec: editData.ketQuaCongViec
        };

        setPersonnel(prev => prev.map(p => p.id === editData.id ? updatedEmp : p));
        setSelectedEmployee(updatedEmp);
        setIsEditing(false);
      })
      .catch(err => {
        console.error(err);
        const updatedEmp = {
          id: editData.id,
          firstName: editData.firstName,
          lastName: editData.lastName,
          tuoi: editData.tuoi,
          sucKhoe: editData.sucKhoe,
          dangTapHuan: editData.dangTapHuan,
          assignments: [
            {
              department: editData.bo_phan,
              position: editData.chuc_vu
            }
          ],
          sdt: editData.sdt,
          email: editData.email,
          vungTrongPhuTrach: editData.vungTrongPhuTrach,
          khoPhuTrach: editData.khoPhuTrach,
          kiemDinhChatLuong: editData.kiemDinhChatLuong,
          ketQuaCongViec: editData.ketQuaCongViec
        };
        setPersonnel(prev => prev.map(p => p.id === editData.id ? updatedEmp : p));
        setSelectedEmployee(updatedEmp);
        setIsEditing(false);
      });
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
              <th>Vùng trồng phụ trách (FR31)</th>
              <th>Kho phụ trách (FR31)</th>
              <th>Đánh giá kiểm định</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {personnel.map((person, index) => (
              <tr 
                key={index} 
                className="table-row"
                onDoubleClick={() => handleRowDoubleClick(person)}
                style={{ cursor: 'pointer' }}
              >
                <td className="col-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(person.id)}
                    onChange={(e) => handleSelectRow(person.id, e)}
                  />
                </td>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{person.id}</td>
                <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{person.lastName} {person.firstName}</td>
                <td>{person.assignments && person.assignments[0] ? person.assignments[0].position : ''}</td>
                <td>{person.assignments && person.assignments[0] ? person.assignments[0].department : ''}</td>
                <td style={{ fontWeight: '500', color: person.vungTrongPhuTrach ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {person.vungTrongPhuTrach || 'Chưa phân công'}
                </td>
                <td style={{ fontWeight: '500', color: person.khoPhuTrach ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {person.khoPhuTrach || 'Chưa phân công'}
                </td>
                <td style={{ fontStyle: 'italic', fontSize: '13px' }}>
                  {person.kiemDinhChatLuong || <span style={{ color: 'var(--text-muted)' }}>Chưa giao</span>}
                </td>
                <td className="col-actions" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="action-btn"
                    onClick={() => setActiveMenuId(activeMenuId === person.id ? null : person.id)}
                  >
                    ⋮
                  </button>
                  {activeMenuId === person.id && (
                    <div className="action-menu-dropdown" style={{
                      position: 'absolute',
                      right: '10px',
                      top: '30px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 10,
                      minWidth: '130px',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}>
                      <button 
                        onClick={() => { setSelectedEmployee(person); setIsEditing(false); setActiveMenuId(null); }}
                        style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-main)' }}
                      >
                        👁️ Xem chi tiết
                      </button>
                      <button 
                        onClick={(e) => handleEditClick(person, e)}
                        style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-main)' }}
                      >
                        ✏️ Chỉnh sửa
                      </button>
                      <button 
                        onClick={(e) => handleDeleteRow(person.id, e)}
                        style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#ef4444' }}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {personnel.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px' }}>Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Xem chi tiết & Chỉnh sửa thông tin nhân viên (FR28, FR29, FR31, FR32) */}
      {selectedEmployee && (
        <div className="modal-backdrop" onClick={() => setSelectedEmployee(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h3>{isEditing ? 'Chỉnh sửa thông tin nhân sự' : 'Thông tin chi tiết nhân sự'}</h3>
              <button className="close-btn" onClick={() => setSelectedEmployee(null)}>&times;</button>
            </div>
            
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              {isEditing ? (
                <form onSubmit={handleEditSubmit}>
                  <div className="other-info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                    <div className="form-group">
                      <label>ID Nhân viên (Mã định danh)*</label>
                      <input 
                        type="text" 
                        name="id" 
                        value={editData.id} 
                        disabled 
                        style={{ backgroundColor: 'var(--border-color)', cursor: 'not-allowed' }}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Họ đệm</label>
                      <input 
                        type="text" 
                        name="lastName" 
                        value={editData.lastName} 
                        onChange={handleEditChange} 
                        placeholder="VD: Nguyễn Văn"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Tên nhân sự*</label>
                      <input 
                        type="text" 
                        name="firstName" 
                        value={editData.firstName} 
                        onChange={handleEditChange} 
                        placeholder="VD: An"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Độ tuổi</label>
                      <input 
                        type="number" 
                        name="tuoi" 
                        value={editData.tuoi} 
                        onChange={handleEditChange} 
                        placeholder="VD: 34"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Phòng ban / Bộ phận</label>
                      <input 
                        type="text" 
                        name="bo_phan" 
                        value={editData.bo_phan} 
                        onChange={handleEditChange} 
                        placeholder="VD: Phòng Kỹ thuật"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Chức vụ / Vị trí</label>
                      <input 
                        type="text" 
                        name="chuc_vu" 
                        value={editData.chuc_vu} 
                        onChange={handleEditChange} 
                        placeholder="VD: Giám sát viên"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Số điện thoại</label>
                      <input 
                        type="text" 
                        name="sdt" 
                        value={editData.sdt} 
                        onChange={handleEditChange} 
                        placeholder="VD: 0981234501"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Email liên hệ</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={editData.email} 
                        onChange={handleEditChange} 
                        placeholder="VD: an.nguyen@namdogroup.vn"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Tình trạng sức khỏe</label>
                      <input 
                        type="text" 
                        name="sucKhoe" 
                        value={editData.sucKhoe} 
                        onChange={handleEditChange} 
                        placeholder="VD: Tốt"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Đang trong danh sách tập huấn?</label>
                      <select 
                        name="dangTapHuan" 
                        value={editData.dangTapHuan} 
                        onChange={handleEditChange}
                      >
                        <option value="Không">Không</option>
                        <option value="Có">Có</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>Phân công công việc (FR31)</span>
                    </div>

                    <div className="form-group">
                      <label>Vùng trồng phụ trách</label>
                      <select 
                        name="vungTrongPhuTrach" 
                        value={editData.vungTrongPhuTrach} 
                        onChange={handleEditChange}
                      >
                        <option value="">-- Chưa phân công --</option>
                        {vungTrongList.map((vt) => (
                          <option key={vt.ma_puc} value={vt.ma_puc}>
                            {vt.ma_puc} ({vt.ten_vuon})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Kho hàng phụ trách</label>
                      <select 
                        name="khoPhuTrach" 
                        value={editData.khoPhuTrach} 
                        onChange={handleEditChange}
                      >
                        <option value="">-- Chưa phân công --</option>
                        <option value="KHO-01">KHO-01 (Kho lạnh Cái Bè)</option>
                        <option value="KHO-02">KHO-02 (Kho trung chuyển Cát Lái)</option>
                        <option value="KHO-03">KHO-03 (Kho bao bì Cao Lãnh)</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Nhiệm vụ kiểm định chất lượng (QA/QC)</label>
                      <input 
                        type="text" 
                        name="kiemDinhChatLuong" 
                        value={editData.kiemDinhChatLuong} 
                        onChange={handleEditChange} 
                        placeholder="Nhập tiêu chuẩn kiểm định phụ trách..."
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>Theo dõi kết quả công việc (FR32)</span>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Kết quả công việc / Đánh giá</label>
                      <textarea 
                        name="ketQuaCongViec" 
                        value={editData.ketQuaCongViec} 
                        onChange={handleEditChange} 
                        placeholder="Ghi nhận đánh giá năng lực thực hiện công việc..."
                        style={{ width: '100%', minHeight: '80px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none' }}
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <table className="detail-table">
                  <tbody>
                    <tr>
                      <th>Mã số định danh (ID)</th>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{selectedEmployee.id}</td>
                    </tr>
                    <tr>
                      <th>Họ và tên</th>
                      <td style={{ fontWeight: '600' }}>{selectedEmployee.lastName} {selectedEmployee.firstName}</td>
                    </tr>
                    <tr>
                      <th>Phòng ban / Bộ phận</th>
                      <td>{selectedEmployee.assignments?.[0]?.department || <span className="empty-value">Chưa phân bổ</span>}</td>
                    </tr>
                    <tr>
                      <th>Chức vụ / Vị trí</th>
                      <td>{selectedEmployee.assignments?.[0]?.position || <span className="empty-value">Chưa phân bổ</span>}</td>
                    </tr>
                    <tr>
                      <th>Số điện thoại</th>
                      <td>{selectedEmployee.sdt || <span className="empty-value">Chưa rõ</span>}</td>
                    </tr>
                    <tr>
                      <th>Email liên hệ</th>
                      <td>{selectedEmployee.email || <span className="empty-value">Chưa rõ</span>}</td>
                    </tr>
                    <tr>
                      <th>Độ tuổi</th>
                      <td>{selectedEmployee.tuoi || <span className="empty-value">Chưa rõ</span>}</td>
                    </tr>
                    <tr>
                      <th>Tình trạng sức khỏe</th>
                      <td>{selectedEmployee.sucKhoe || <span className="empty-value">Chưa rõ</span>}</td>
                    </tr>
                    <tr>
                      <th>Trạng thái tập huấn</th>
                      <td>
                        <span className={`badge-class ${selectedEmployee.dangTapHuan === 'Có' ? 'success' : 'warning'}`}>
                          {selectedEmployee.dangTapHuan || 'Không'}
                        </span>
                      </td>
                    </tr>
                    
                    {/* FR31 phân công */}
                    <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                      <th style={{ color: 'var(--primary)', fontWeight: '700' }}>Vùng trồng phụ trách (FR31)</th>
                      <td style={{ fontWeight: '500' }}>{selectedEmployee.vungTrongPhuTrach || <span className="empty-value">Chưa phân công</span>}</td>
                    </tr>
                    <tr>
                      <th style={{ color: 'var(--primary)', fontWeight: '700' }}>Kho hàng phụ trách (FR31)</th>
                      <td style={{ fontWeight: '500' }}>{selectedEmployee.khoPhuTrach || <span className="empty-value">Chưa phân công</span>}</td>
                    </tr>
                    <tr>
                      <th style={{ color: 'var(--primary)', fontWeight: '700' }}>Kiểm định chất lượng phụ trách</th>
                      <td>{selectedEmployee.kiemDinhChatLuong || <span className="empty-value">Chưa giao nhiệm vụ</span>}</td>
                    </tr>

                    {/* FR32 theo dõi kết quả */}
                    <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                      <th style={{ color: 'var(--primary)', fontWeight: '700' }}>Kết quả công việc (FR32)</th>
                      <td style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', color: 'var(--text-main)', fontStyle: 'italic' }}>
                        {selectedEmployee.ketQuaCongViec || <span className="empty-value">Chưa ghi nhận đánh giá</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-footer">
              {isEditing ? (
                <>
                  <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ marginRight: '12px' }}>Hủy</button>
                  <button className="btn-primary" onClick={handleEditSubmit}>Lưu thay đổi</button>
                </>
              ) : (
                <>
                  <button className="btn-primary" onClick={() => handleEditClick(selectedEmployee)} style={{ marginRight: '12px' }}>Chỉnh sửa</button>
                  <button className="btn-secondary" onClick={() => setSelectedEmployee(null)}>Đóng</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelTable;
