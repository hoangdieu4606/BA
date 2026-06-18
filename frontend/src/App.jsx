import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PersonnelTable from './components/PersonnelTable';
import FilterSidebar from './components/FilterSidebar';
import EmployeeForm from './components/EmployeeForm';
import DashboardHome from './components/DashboardHome';
import GenericListView from './components/GenericListView';
import EmployeeDashboard from './components/EmployeeDashboard';
import Login from './components/Login';
import { initialPersonnelData } from './utils/mockData';
import { personnelData, traceabilityData } from './utils/traceabilityData';
import './App.css';

const API_BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

function App() {
  const [role, setRole] = useState(() => {
    try {
      const session = localStorage.getItem('authSession');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.expiry > Date.now()) {
          return parsed.role;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null; // not logged in
  });

  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // Mặc định mở Trang chủ
  const [isCreating, setIsCreating] = useState(false);

  const [personnel, setPersonnel] = useState([]);
  const [traceabilityList, setTraceabilityList] = useState([]);

  // Login handler
  const handleLogin = (selectedRole) => {
    const session = {
      role: selectedRole,
      expiry: Date.now() + 24 * 60 * 60 * 1000 // 1 day
    };
    localStorage.setItem('authSession', JSON.stringify(session));
    setRole(selectedRole);
  };

  // Role change synced to session
  const handleRoleChange = (newRole) => {
    const session = {
      role: newRole,
      expiry: Date.now() + 24 * 60 * 60 * 1000
    };
    localStorage.setItem('authSession', JSON.stringify(session));
    setRole(newRole);
  };

  // Instant tab change (cross-fade animation is handled in CSS)
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };



  // Fetch data on load
  useEffect(() => {
    // 1. Fetch personnel
    fetch(`${API_BASE_URL}/personnel`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(p => ({
            id: p.ma_nv,
            lastName: '',
            firstName: p.ten_nv,
            tuoi: p.tuoi,
            sucKhoe: p.suc_khoe,
            dangTapHuan: p.dang_tap_huan,
            assignments: [
              {
                position: p.chuc_vu || 'Chưa phân bổ',
                department: p.bo_phan || 'Chưa phân bổ'
              }
            ],
            sdt: p.sdt || '',
            email: p.email || '',
            vungTrongPhuTrach: p.vung_trong_phu_trach || '',
            khoPhuTrach: p.kho_phu_trach || '',
            kiemDinhChatLuong: p.kiem_dinh_chat_luong || '',
            ketQuaCongViec: p.ket_qua_cong_viec || ''
          }));
          setPersonnel(mapped);
        } else {
          setPersonnel(
            personnelData && personnelData.length > 0
              ? personnelData.map(p => ({
                  id: p.ma_nv,
                  lastName: '',
                  firstName: p.ten_nv,
                  tuoi: p.tuoi || 30,
                  sucKhoe: p.suc_khoe || 'Tốt',
                  dang_tap_huan: p.dang_tap_huan || 'Không',
                  assignments: [
                    {
                      position: p.chuc_vu || 'Giám sát đóng gói/kiểm định',
                      department: p.bo_phan || 'Phòng Quản lý Chất lượng'
                    }
                  ],
                  sdt: p.sdt || '',
                  email: p.email || '',
                  vungTrongPhuTrach: p.vung_trong_phu_trach || '',
                  khoPhuTrach: p.kho_phu_trach || '',
                  kiemDinhChatLuong: p.kiem_dinh_chat_luong || '',
                  ketQuaCongViec: p.ket_qua_cong_viec || ''
                }))
              : initialPersonnelData.map(p => ({
                  ...p,
                  tuoi: p.tuoi || 30,
                  sucKhoe: p.sucKhoe || 'Tốt',
                  dangTapHuan: p.dangTapHuan || 'Không',
                  sdt: p.sdt || '',
                  email: p.email || '',
                  vungTrongPhuTrach: p.vungTrongPhuTrach || '',
                  khoPhuTrach: p.khoPhuTrach || '',
                  kiemDinhChatLuong: p.kiemDinhChatLuong || '',
                  ketQuaCongViec: p.ketQuaCongViec || ''
                }))
          );
        }
      })
      .catch(err => {
        console.error('Error fetching personnel, falling back to local data:', err);
        setPersonnel(
          personnelData && personnelData.length > 0
            ? personnelData.map(p => ({
                id: p.ma_nv,
                lastName: '',
                firstName: p.ten_nv,
                tuoi: p.tuoi || 30,
                sucKhoe: p.suc_khoe || 'Tốt',
                dang_tap_huan: p.dang_tap_huan || 'Không',
                assignments: [
                  {
                    position: p.chuc_vu || 'Giám sát đóng gói/kiểm định',
                    department: p.bo_phan || 'Phòng Quản lý Chất lượng'
                  }
                ],
                sdt: p.sdt || '',
                email: p.email || '',
                vungTrongPhuTrach: p.vung_trong_phu_trach || '',
                khoPhuTrach: p.kho_phu_trach || '',
                kiemDinhChatLuong: p.kiem_dinh_chat_luong || '',
                ketQuaCongViec: p.ket_qua_cong_viec || ''
              }))
            : initialPersonnelData.map(p => ({
                ...p,
                tuoi: p.tuoi || 30,
                sucKhoe: p.sucKhoe || 'Tốt',
                dangTapHuan: p.dangTapHuan || 'Không',
                sdt: p.sdt || '',
                email: p.email || '',
                vungTrongPhuTrach: p.vungTrongPhuTrach || '',
                khoPhuTrach: p.khoPhuTrach || '',
                kiemDinhChatLuong: p.kiemDinhChatLuong || '',
                ketQuaCongViec: p.ketQuaCongViec || ''
              }))
        );
      });

    // 2. Fetch traceability list
    fetch(`${API_BASE_URL}/traceability`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTraceabilityList(data);
        } else {
          console.error('Traceability data is not an array, falling back to local data:', data);
          setTraceabilityList(traceabilityData || []);
        }
      })
      .catch(err => {
        console.error('Error fetching traceability logs, falling back to local data:', err);
        setTraceabilityList(traceabilityData || []);
      });
  }, []);


  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleSaveEmployee = (newEmp) => {
    // Save to database
    fetch(`${API_BASE_URL}/personnel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: newEmp.id,
        firstName: newEmp.firstName,
        lastName: newEmp.lastName,
        tuoi: newEmp.tuoi,
        sucKhoe: newEmp.sucKhoe,
        dangTapHuan: newEmp.dangTapHuan,
        bo_phan: newEmp.assignments?.[0]?.department || '',
        chuc_vu: newEmp.assignments?.[0]?.position || '',
        sdt: newEmp.phone || '',
        email: newEmp.accountEmail || '',
        vung_trong_phu_trach: newEmp.vungTrongPhuTrach || '',
        kho_phu_trach: newEmp.khoPhuTrach || '',
        kiem_dinh_chat_luong: newEmp.kiemDinhChatLuong || '',
        ket_qua_cong_viec: newEmp.ketQuaCongViec || ''
      })
    })
      .then(res => res.json())
      .then(saved => {
        setPersonnel(prev => [newEmp, ...prev]);
      })
      .catch(err => {
        console.error('Error saving employee to database:', err);
        // Fallback local update
        setPersonnel(prev => [newEmp, ...prev]);
      });
  };


  const renderContent = () => {
    if (activeTab === 'home') {
      return <DashboardHome />;
    }
    
    if (activeTab === 'personnel') {
      if (isCreating) {
        return (
          <EmployeeForm 
            onClose={() => setIsCreating(false)} 
            onSave={handleSaveEmployee}
          />
        );
      }
      return (
        <PersonnelTable 
          toggleFilter={toggleFilter} 
          isFilterOpen={isFilterOpen} 
          onCreate={() => setIsCreating(true)} 
          personnel={personnel}
          setPersonnel={setPersonnel}
        />
      );
    }
    
    // Tất cả các tab khác chạy danh sách mẫu tương ứng
    return (
      <GenericListView 
        activeTab={activeTab} 
        traceabilityList={traceabilityList}
        setTraceabilityList={setTraceabilityList}
        role={role}
      />
    );
  };

  // Chỉ hiển thị bộ lọc ở bên phải khi ở tab Quản lý nhân sự và không trong trạng thái tạo mới nhân sự
  const shouldShowFilterSidebar = role === 'admin' && activeTab === 'personnel' && !isCreating;

  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {role === 'admin' && <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />}
      <div className="main-content">
        <Header role={role} setRole={handleRoleChange} />
        <div className="content-body">
          {role === 'admin' ? (
            <>
              <div className="center-area">
                <div key={activeTab + (activeTab === 'personnel' ? '-' + isCreating : '')} className="page-transition">
                  {renderContent()}
                </div>
              </div>
              {shouldShowFilterSidebar && (
                <div className={`right-sidebar ${!isFilterOpen ? 'closed' : ''}`}>
                  <FilterSidebar onClose={toggleFilter} />
                </div>
              )}
            </>
          ) : (
            <div className="center-area" style={{ flex: 1, padding: 0 }}>
              <div key="employee-dashboard" className="page-transition">
                <EmployeeDashboard 
                  traceabilityList={traceabilityList}
                  setTraceabilityList={setTraceabilityList}
                  role={role}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
