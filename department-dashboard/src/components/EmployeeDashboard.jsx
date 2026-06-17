import React, { useState } from 'react';
import GS1QRCode from './GS1QRCode';
import './EmployeeDashboard.css';
import './DepartmentTable.css'; // Reuse existing table and modal styles

const EmployeeDashboard = ({ traceabilityList = [], setTraceabilityList }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState([
    { id: 'LH-101', type: 'search', time: 'Hôm nay 22:15', origin: 'Vườn Cái Bè', date: '16/06/2026' }
  ]);
  
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerSelectedId, setScannerSelectedId] = useState('');

  const [newShipment, setNewShipment] = useState({
    id: '',
    ma_puc: '',
    dia_chi_vuon: '',
    ten_vuon: '',
    ngay_thu_hoach: '',
    lan_phun_thuoc_gan_nhat: '',
    cach_ly: '',
    loai: '',
    khoi_luong_lo_hang: '',
    khoi_luong_dong_goi: '',
    noi_xuat_khau: '',
    ten_co_so_dong_goi: '',
    ma_phc: '',
    ket_qua_kiem_dich: ''
  });

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toUpperCase();
    const match = traceabilityList.find(item => item.id.toUpperCase() === query || item.ma_puc.toUpperCase() === query);

    if (match) {
      // Add to search history if not already present
      addToHistory(match.id, 'search', match.ten_vuon, match.ngay_thu_hoach);
      // Open details modal
      setSelectedRecord(match);
      setSearchQuery('');
    } else {
      alert(`Không tìm thấy lô hàng nào có mã "${searchQuery}". Vui lòng thử lại!`);
    }
  };

  const addToHistory = (id, type, origin, date) => {
    const timeStr = `Hôm nay ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    
    setHistory(prev => {
      // Filter out duplicate ID if it exists to bring it to the top
      const cleanPrev = prev.filter(item => item.id !== id);
      return [
        { id, type, time: timeStr, origin, date },
        ...cleanPrev
      ];
    });
  };

  const handleCreateClick = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setNewShipment({
      id: `LH-${randomNum}`,
      ma_puc: '',
      dia_chi_vuon: '',
      ten_vuon: '',
      ngay_thu_hoach: new Date().toISOString().split('T')[0],
      lan_phun_thuoc_gan_nhat: '',
      cach_ly: '',
      loai: '',
      khoi_luong_lo_hang: '',
      khoi_luong_dong_goi: '',
      noi_xuat_khau: '',
      ten_co_so_dong_goi: '',
      ma_phc: '',
      ket_qua_kiem_dich: ''
    });
    setIsCreatingShipment(true);
  };

  const handleShipmentChange = (e) => {
    const { name, value } = e.target;
    setNewShipment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShipmentSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newShipment.id || !newShipment.ma_puc || !newShipment.ten_vuon || !newShipment.dia_chi_vuon || !newShipment.ngay_thu_hoach) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }
    
    const formattedShipment = {
      ...newShipment,
      khoi_luong_lo_hang: newShipment.khoi_luong_lo_hang !== '' ? parseFloat(newShipment.khoi_luong_lo_hang) : null,
      khoi_luong_dong_goi: newShipment.khoi_luong_dong_goi !== '' ? parseFloat(newShipment.khoi_luong_dong_goi) : null,
      cach_ly: newShipment.cach_ly || null,
      loai: newShipment.loai || null,
      noi_xuat_khau: newShipment.noi_xuat_khau || null,
      ten_co_so_dong_goi: newShipment.ten_co_so_dong_goi || null,
      ma_phc: newShipment.ma_phc || null,
      ket_qua_kiem_dich: newShipment.ket_qua_kiem_dich || null
    };

    if (setTraceabilityList) {
      setTraceabilityList(prev => [formattedShipment, ...prev]);
    }

    addToHistory(formattedShipment.id, 'create', formattedShipment.ten_vuon, formattedShipment.ngay_thu_hoach);
    setIsCreatingShipment(false);
    
    // Open the created shipment details immediately so they can see the QR Code
    setSelectedRecord(formattedShipment);
  };

  // Mock QR Scanner scan action
  const handleScanSimulate = () => {
    if (!scannerSelectedId) {
      alert("Vui lòng chọn một lô hàng mẫu để giả lập quét mã!");
      return;
    }
    const match = traceabilityList.find(item => item.id === scannerSelectedId);
    if (match) {
      addToHistory(match.id, 'search', match.ten_vuon, match.ngay_thu_hoach);
      setIsScannerOpen(false);
      setSelectedRecord(match);
      setScannerSelectedId('');
    }
  };

  const handleRowClick = (item) => {
    const match = traceabilityList.find(x => x.id === item.id);
    if (match) {
      setSelectedRecord(match);
    } else {
      alert("Thông tin lô hàng này không còn tồn tại trong cơ sở dữ liệu!");
    }
  };

  return (
    <div className="employee-dashboard">
      <div className="employee-center-panel">
        <h3 className="employee-title">Hệ thống Truy xuất nguồn gốc</h3>
        <p className="employee-subtitle">
          Cổng thông tin nội bộ dành cho Nhân viên giám sát & Đóng gói. Nhập mã số lô hàng hoặc quét mã QR chuẩn GS1 để tra cứu tức thì thông tin chuỗi cung ứng.
        </p>

        <form onSubmit={handleSearch} className="employee-actions-row">
          <div className="employee-search-box">
            <span style={{ marginRight: '8px', fontSize: '16px' }}>🔍</span>
            <input 
              type="text" 
              className="employee-search-input"
              placeholder="Nhập mã lô hàng (VD: LH-101, LH-312) hoặc mã vùng trồng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="employee-search-btn">Tìm kiếm</button>
          
          <button 
            type="button" 
            className="employee-qr-scan-btn"
            onClick={() => setIsScannerOpen(true)}
          >
            📷 Quét mã QR
          </button>
          
          <button 
            type="button" 
            className="employee-create-btn"
            onClick={handleCreateClick}
          >
            + Tạo mới lô hàng
          </button>
        </form>
      </div>

      <div className="history-section">
        <div className="history-header">
          <h4 className="history-title">Lịch sử hoạt động gần đây</h4>
          {history.length > 0 && (
            <button className="history-clear-btn" onClick={() => setHistory([])}>
              Xóa lịch sử
            </button>
          )}
        </div>
        
        <div className="history-list">
          {history.map((item, idx) => (
            <div 
              key={idx} 
              className="history-row"
              onClick={() => handleRowClick(item)}
              title="Nhấp đúp hoặc click để xem chi tiết lô hàng"
            >
              <span className={`history-log-type ${item.type}`}>
                {item.type === 'search' ? '🔍 Đã tra cứu' : '📦 Đã tạo mới'}
              </span>
              <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{item.id}</span>
              <span style={{ color: 'var(--text-muted)' }}>{item.origin}</span>
              <span>{item.date}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'right' }}>{item.time}</span>
            </div>
          ))}
          
          {history.length === 0 && (
            <div className="history-empty">
              Chưa có hoạt động tra cứu hay tạo mới nào trong phiên làm việc này.
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="modal-backdrop" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết lô hàng: {selectedRecord.id}</h3>
              <button className="close-btn" onClick={() => setSelectedRecord(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <table className="detail-table">
                <tbody>
                  <tr>
                    <th>Mã lô hàng (ID)</th>
                    <td>{selectedRecord.id || <span className="empty-value">Trống</span>}</td>
                  </tr>
                  <tr>
                    <th>Mã số vùng trồng (PUC)</th>
                    <td>{selectedRecord.ma_puc || <span className="empty-value">Trống</span>}</td>
                  </tr>
                  <tr>
                    <th>Địa chỉ vườn</th>
                    <td>{selectedRecord.dia_chi_vuon || <span className="empty-value">Trống</span>}</td>
                  </tr>
                  <tr>
                    <th>Tên vườn</th>
                    <td>{selectedRecord.ten_vuon || <span className="empty-value">Trống</span>}</td>
                  </tr>
                  <tr>
                    <th>Ngày thu hoạch</th>
                    <td>{selectedRecord.ngay_thu_hoach || <span className="empty-value">Trống</span>}</td>
                  </tr>
                  <tr>
                    <th>Lần phun thuốc gần nhất</th>
                    <td>{selectedRecord.lan_phun_thuoc_gan_nhat || <span className="empty-value">Trống</span>}</td>
                  </tr>
                  <tr>
                    <th>Cách ly</th>
                    <td>{selectedRecord.cach_ly || <span className="empty-value">Trống</span>}</td>
                  </tr>
                  <tr>
                    <th>Loại</th>
                    <td>{selectedRecord.loai || <span className="empty-value">Trống</span>}</td>
                  </tr>
                  <tr>
                    <th>Khối lượng lô hàng (tấn)</th>
                    <td>{selectedRecord.khoi_luong_lo_hang !== null && selectedRecord.khoi_luong_lo_hang !== '' ? `${selectedRecord.khoi_luong_lo_hang} tấn` : <span className="empty-value">Trống</span>}</td>
                  </tr>
                  <tr>
                    <th>Khối lượng đóng gói (tấn)</th>
                    <td>{selectedRecord.khoi_luong_dong_goi !== null && selectedRecord.khoi_luong_dong_goi !== '' ? `${selectedRecord.khoi_luong_dong_goi} tấn` : <span className="empty-value">Trống</span>}</td>
                  </tr>
                  <tr>
                    <th>Nơi xuất khẩu</th>
                    <td>{selectedRecord.noi_xuat_khau || <span className="empty-value">Trống</span>}</td>
                  </tr>
                  <tr>
                    <th>Tên cơ sở đóng gói</th>
                    <td>{selectedRecord.ten_co_so_dong_goi || <span className="empty-value">Trống</span>}</td>
                  </tr>
                  <tr>
                    <th>Mã số cơ sở đóng gói (PHC)</th>
                    <td>{selectedRecord.ma_phc || <span className="empty-value">Trống</span>}</td>
                  </tr>
                  <tr>
                    <th>Kết quả kiểm dịch</th>
                    <td>
                      {selectedRecord.ket_qua_kiem_dich ? (
                        <span className={`quarantine-badge ${selectedRecord.ket_qua_kiem_dich === 'Đạt' ? 'passed' : 'failed'}`}>
                          {selectedRecord.ket_qua_kiem_dich}
                        </span>
                      ) : (
                        <span className="empty-value">Trống</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              
              {/* Show GS1 QR code at the bottom of Details modal */}
              <GS1QRCode shipment={selectedRecord} />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedRecord(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Scanner Modal */}
      {isScannerOpen && (
        <div className="modal-backdrop" onClick={() => setIsScannerOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Quét mã QR (Giả lập camera)</h3>
              <button className="close-btn" onClick={() => setIsScannerOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="scanner-viewport">
                <div className="scanner-camera-feed">
                  <div className="scanner-laser"></div>
                  <div className="scanner-corner tl"></div>
                  <div className="scanner-corner tr"></div>
                  <div className="scanner-corner bl"></div>
                  <div className="scanner-corner br"></div>
                  <span style={{ fontSize: '28px', marginBottom: '8px' }}>📷</span>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Đang tìm mã vạch/mã QR...</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Chọn lô hàng mẫu để giả lập quét mã QR:</label>
                <select 
                  value={scannerSelectedId} 
                  onChange={(e) => setScannerSelectedId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                >
                  <option value="">-- Chọn lô hàng trong kho --</option>
                  {traceabilityList.slice(0, 10).map((item, index) => (
                    <option key={index} value={item.id}>{item.id} - Vườn: {item.ten_vuon} ({item.loai || 'Chưa phân loại'})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsScannerOpen(false)} style={{ marginRight: '12px' }}>Hủy bỏ</button>
              <button className="btn-primary" onClick={handleScanSimulate}>Xác nhận quét</button>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isCreatingShipment && (
        <div className="modal-backdrop" onClick={() => setIsCreatingShipment(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h3>Nhân viên: Tạo mới lô hàng truy xuất</h3>
              <button className="close-btn" onClick={() => setIsCreatingShipment(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <form onSubmit={handleShipmentSubmit}>
                <div className="other-info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                  <div className="form-group">
                    <label>Mã lô hàng (ID)*</label>
                    <input 
                      type="text" 
                      name="id" 
                      value={newShipment.id} 
                      onChange={handleShipmentChange} 
                      placeholder="VD: LH-001" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Mã số vùng trồng (PUC)*</label>
                    <input 
                      type="text" 
                      name="ma_puc" 
                      value={newShipment.ma_puc} 
                      onChange={handleShipmentChange} 
                      placeholder="VD: TG-PUC-0001" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Tên vườn trồng*</label>
                    <input 
                      type="text" 
                      name="ten_vuon" 
                      value={newShipment.ten_vuon} 
                      onChange={handleShipmentChange} 
                      placeholder="VD: Vườn Anh Hùng" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Địa chỉ vườn*</label>
                    <input 
                      type="text" 
                      name="dia_chi_vuon" 
                      value={newShipment.dia_chi_vuon} 
                      onChange={handleShipmentChange} 
                      placeholder="VD: Xã Tam Bình, H. Cai Lậy, Tiền Giang" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Ngày thu hoạch*</label>
                    <input 
                      type="date" 
                      name="ngay_thu_hoach" 
                      value={newShipment.ngay_thu_hoach} 
                      onChange={handleShipmentChange} 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Lần phun thuốc gần nhất</label>
                    <input 
                      type="date" 
                      name="lan_phun_thuoc_gan_nhat" 
                      value={newShipment.lan_phun_thuoc_gan_nhat} 
                      onChange={handleShipmentChange} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Cách ly (Có/Không)</label>
                    <select 
                      name="cach_ly" 
                      value={newShipment.cach_ly} 
                      onChange={handleShipmentChange}
                    >
                      <option value="">Chưa rõ (Đang phân loại)</option>
                      <option value="Có">Có</option>
                      <option value="Không">Không</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Loại chế biến/đóng gói</label>
                    <select 
                      name="loai" 
                      value={newShipment.loai} 
                      onChange={handleShipmentChange}
                    >
                      <option value="">Chưa rõ (Đang phân loại)</option>
                      <option value="Trái tươi xuất khẩu">Trái tươi xuất khẩu</option>
                      <option value="Nguyên trái đông lạnh">Nguyên trái đông lạnh</option>
                      <option value="Lột múi cơm">Lột múi cơm</option>
                      <option value="Sấy khô">Sấy khô</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Khối lượng lô hàng (tấn)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      name="khoi_luong_lo_hang" 
                      value={newShipment.khoi_luong_lo_hang} 
                      onChange={handleShipmentChange} 
                      placeholder="VD: 12.5" 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Khối lượng đóng gói (tấn)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      name="khoi_luong_dong_goi" 
                      value={newShipment.khoi_luong_dong_goi} 
                      onChange={handleShipmentChange} 
                      placeholder="VD: 11.8" 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Nơi xuất khẩu</label>
                    <input 
                      type="text" 
                      name="noi_xuat_khau" 
                      value={newShipment.noi_xuat_khau} 
                      onChange={handleShipmentChange} 
                      placeholder="VD: Trung Quốc, Hoa Kỳ" 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Tên cơ sở đóng gói</label>
                    <input 
                      type="text" 
                      name="ten_co_so_dong_goi" 
                      value={newShipment.ten_co_so_dong_goi} 
                      onChange={handleShipmentChange} 
                      placeholder="VD: Cơ sở đóng gói Thanh Bình" 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Mã số cơ sở đóng gói (PHC)</label>
                    <input 
                      type="text" 
                      name="ma_phc" 
                      value={newShipment.ma_phc} 
                      onChange={handleShipmentChange} 
                      placeholder="VD: VN-PHC-0002" 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Kết quả kiểm dịch</label>
                    <select 
                      name="ket_qua_kiem_dich" 
                      value={newShipment.ket_qua_kiem_dich} 
                      onChange={handleShipmentChange}
                    >
                      <option value="">Chưa có kết quả</option>
                      <option value="Đạt">Đạt</option>
                      <option value="Không đạt">Không đạt</option>
                    </select>
                  </div>
                </div>
              </form>
              
              {/* Show live updating GS1 QR code at the bottom of creation modal */}
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '10px' }}>
                <GS1QRCode shipment={newShipment} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreatingShipment(false)} style={{ marginRight: '12px' }}>Hủy</button>
              <button className="btn-primary" onClick={handleShipmentSubmit}>Tạo mới</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
