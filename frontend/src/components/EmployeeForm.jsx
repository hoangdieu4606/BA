import React, { useState } from 'react';
import './EmployeeForm.css';
import { initialPersonnelData } from '../utils/mockData';

const EmployeeForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    accountEmail: '',
    license: '',
    role: '',
    lastName: '',
    firstName: '',
    assignments: [{ department: '', position: '', rank: '' }],
    personalEmail: '',
    phone: '',
    dob: '',
    gender: '',
    tuoi: '',
    sucKhoe: '',
    dangTapHuan: 'Không',
    workEmail: '',
    address: '',
    workStatus: '',
    type: '',
    startDate: '',
    grossSalary: '',
    tax: '',
    socialInsurance: '',
    unemploymentInsurance: '',
    healthInsurance: ''
  });

  // Tự động quét danh sách để lấy tất cả phòng ban, vị trí công việc, vai trò, giấy phép
  const allDepartments = [...new Set(initialPersonnelData.flatMap(p => p.assignments.map(a => a.department)))].filter(Boolean);
  const allPositions = [...new Set(initialPersonnelData.flatMap(p => p.assignments.map(a => a.position)))].filter(Boolean);
  const allRoles = [...new Set(initialPersonnelData.map(p => p.role))].filter(Boolean);
  const allLicenses = [...new Set(initialPersonnelData.map(p => p.license))].filter(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAssignment = () => {
    setFormData({
      ...formData,
      assignments: [...formData.assignments, { department: '', position: '', rank: '' }]
    });
  };

  const handleRemoveAssignment = (index) => {
    const updated = formData.assignments.filter((_, i) => i !== index);
    setFormData({ ...formData, assignments: updated });
  };

  const handleAssignmentChange = (index, field, value) => {
    const updated = [...formData.assignments];
    updated[index][field] = value;
    setFormData({ ...formData, assignments: updated });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!formData.firstName || !formData.accountEmail) {
      alert("Vui lòng nhập Email tài khoản và Tên nhân sự!");
      return;
    }

    const randomId = 'NV' + String(Math.floor(100 + Math.random() * 900));
    const newEmp = {
      ...formData,
      id: randomId,
      assignments: formData.assignments.map(a => ({
        department: a.department || 'Chưa phân bổ',
        position: a.position || 'Chưa phân bổ',
        rank: Number(a.rank) || 3
      }))
    };

    onSave(newEmp);
    onClose();
  };

  return (
    <div className="employee-form-container">
      <div className="form-header">
        <h2>Tạo mới nhân sự</h2>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>

      <div className="form-content">
        <div className="info-banner">
          Nếu bạn muốn mời nhân sự tham gia sử dụng Workspace, vui lòng chọn Giấy phép và Vai trò cho người dùng
        </div>

        <div className="form-section">
          <div className="form-group full-width">
            <label>Email tài khoản*</label>
            <input 
              type="email" 
              name="accountEmail" 
              value={formData.accountEmail} 
              onChange={handleChange} 
              placeholder="Nhập email" 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Giấy phép*</label>
              <select 
                name="license" 
                value={formData.license} 
                onChange={handleChange}
              >
                <option value="">Chọn giấy phép</option>
                {allLicenses.map((l, i) => <option key={i} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Vai trò*</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
              >
                <option value="">Chọn vai trò</option>
                {allRoles.map((r, i) => <option key={i} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>Họ</label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
                placeholder="Nhập họ cho nhân sự" 
              />
            </div>
            <div className="form-group">
              <label>Tên*</label>
              <input 
                type="text" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                placeholder="Nhập tên cho nhân sự" 
              />
            </div>
          </div>

          <div className="form-group full-width assignments-group">
            <label>Phòng ban - Vị trí công việc</label>
            <div className="assignments-table-header">
              <div className="col-dept">Phòng ban</div>
              <div className="col-pos">Vị trí công việc</div>
              <div className="col-rank">Thứ tự cấp bậc <span style={{fontSize:'10px', color:'#94a3b8'}}>ⓘ</span></div>
              <div className="col-action"></div>
            </div>
            {formData.assignments.map((assignment, index) => (
              <div className="assignment-row" key={index}>
                <div className="col-dept">
                  <select 
                    value={assignment.department}
                    onChange={(e) => handleAssignmentChange(index, 'department', e.target.value)}
                  >
                    <option value="">Chọn phòng ban</option>
                    {allDepartments.map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-pos">
                  <select
                    value={assignment.position}
                    onChange={(e) => handleAssignmentChange(index, 'position', e.target.value)}
                  >
                    <option value="">Chọn vị trí</option>
                    {allPositions.map((p, i) => <option key={i} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-rank">
                  <input 
                    type="number" 
                    value={assignment.rank}
                    onChange={(e) => handleAssignmentChange(index, 'rank', e.target.value)}
                  />
                </div>
                <div className="col-action">
                  <button className="delete-btn" onClick={() => handleRemoveAssignment(index)}>
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            <button className="add-btn" onClick={handleAddAssignment}>+ Thêm</button>
          </div>
        </div>

        <div className="form-section expandable">
          <div className="section-title">
            <span className="icon">⌄</span> Thông tin khác
          </div>
          <div className="other-info-grid">
            <div className="form-group">
              <label>Email cá nhân</label>
              <div className="input-with-icon">
                <input 
                  type="email" 
                  name="personalEmail" 
                  value={formData.personalEmail} 
                  onChange={handleChange} 
                  placeholder="Nhập email cá nhân" 
                />
                <span className="end-icon">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <div className="phone-input">
                <span className="flag" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginRight: '6px' }}>+84</span>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="Nhập số điện thoại" 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Ngày sinh</label>
              <input 
                type="date" 
                name="dob" 
                value={formData.dob} 
                onChange={handleChange} 
                placeholder="Nhập hoặc chọn ngày sinh" 
              />
            </div>
            <div className="form-group">
              <label>Giới tính</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label>Độ tuổi</label>
              <input 
                type="number" 
                name="tuoi" 
                value={formData.tuoi} 
                onChange={handleChange} 
                placeholder="Nhập độ tuổi" 
              />
            </div>
            <div className="form-group">
              <label>Tình trạng sức khỏe</label>
              <input 
                type="text" 
                name="sucKhoe" 
                value={formData.sucKhoe} 
                onChange={handleChange} 
                placeholder="Nhập tình trạng sức khỏe (VD: Tốt)" 
              />
            </div>
            <div className="form-group">
              <label>Đang trong danh sách tập huấn?</label>
              <select 
                name="dangTapHuan" 
                value={formData.dangTapHuan} 
                onChange={handleChange}
              >
                <option value="Không">Không</option>
                <option value="Có">Có</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email công việc</label>
              <div className="input-with-icon">
                <input 
                  type="email" 
                  name="workEmail" 
                  value={formData.workEmail} 
                  onChange={handleChange} 
                  placeholder="Nhập email công việc" 
                />
                <span className="end-icon">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="form-group">
              <label>Địa chỉ</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                placeholder="Nhập địa chỉ" 
              />
            </div>

            <div className="form-group">
              <label>Trạng thái làm việc</label>
              <select 
                name="workStatus" 
                value={formData.workStatus} 
                onChange={handleChange}
              >
                <option value="">Chọn trạng thái làm việc</option>
                <option value="Đang làm việc">Đang làm việc</option>
                <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                <option value="Thử việc">Thử việc</option>
              </select>
            </div>
            <div className="form-group">
              <label>Kiểu nhân sự</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
              >
                <option value="">Chọn kiểu nhân sự</option>
                <option value="Chính thức">Chính thức</option>
                <option value="Thử việc">Thử việc</option>
                <option value="Thực tập sinh">Thực tập sinh</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ngày bắt đầu làm việc</label>
              <input 
                type="date" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label>Lương gross</label>
              <div className="currency-input">
                <input 
                  type="number" 
                  name="grossSalary" 
                  value={formData.grossSalary} 
                  onChange={handleChange} 
                  placeholder="Nhập lương gross" 
                />
                <span>VND</span>
              </div>
            </div>

            <div className="form-group">
              <label>Thuế thu nhập cá nhân</label>
              <div className="percent-input">
                <input 
                  type="number" 
                  name="tax" 
                  value={formData.tax} 
                  onChange={handleChange} 
                  placeholder="Nhập tỉ lệ thuế TNCN" 
                />
                <span>%</span>
              </div>
            </div>
            <div className="form-group">
              <label>Bảo hiểm xã hội</label>
              <div className="percent-input">
                <input 
                  type="number" 
                  name="socialInsurance" 
                  value={formData.socialInsurance} 
                  onChange={handleChange} 
                  placeholder="Nhập tỉ lệ đóng BHXH" 
                />
                <span>%</span>
              </div>
            </div>

            <div className="form-group">
              <label>Bảo hiểm thất nghiệp</label>
              <div className="percent-input">
                <input 
                  type="number" 
                  name="unemploymentInsurance" 
                  value={formData.unemploymentInsurance} 
                  onChange={handleChange} 
                  placeholder="Nhập tỉ lệ đóng BHTN" 
                />
                <span>%</span>
              </div>
            </div>
            <div className="form-group">
              <label>Bảo hiểm y tế</label>
              <div className="percent-input">
                <input 
                  type="number" 
                  name="healthInsurance" 
                  value={formData.healthInsurance} 
                  onChange={handleChange} 
                  placeholder="Nhập tỉ lệ đóng BHYT" 
                />
                <span>%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="form-footer">
        <button className="btn-cancel" onClick={onClose}>Hủy</button>
        <button className="btn-submit" onClick={handleSubmit}>Thêm mới</button>
      </div>
    </div>
  );
};

export default EmployeeForm;
