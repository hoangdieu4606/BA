import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PersonnelTable from './components/PersonnelTable';
import FilterSidebar from './components/FilterSidebar';
import EmployeeForm from './components/EmployeeForm';
import DashboardHome from './components/DashboardHome';
import GenericListView from './components/GenericListView';
import EmployeeDashboard from './components/EmployeeDashboard';
import { initialPersonnelData } from './utils/mockData';
import { personnelData, traceabilityData } from './utils/traceabilityData';
import './App.css';

const API_BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

function App() {
  const [role, setRole] = useState('admin'); // 'admin' or 'employee'
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // Mặc định mở Trang chủ
  const [isCreating, setIsCreating] = useState(false);

  const [personnel, setPersonnel] = useState([]);
  const [traceabilityList, setTraceabilityList] = useState([]);

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
                position: 'Giám sát đóng gói/kiểm định',
                department: 'Phòng Quản lý Chất lượng'
              }
            ]
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
                  dangTapHuan: p.dang_tap_huan || 'Không',
                  assignments: [
                    {
                      position: 'Giám sát đóng gói/kiểm định',
                      department: 'Phòng Quản lý Chất lượng'
                    }
                  ]
                }))
              : initialPersonnelData.map(p => ({
                  ...p,
                  tuoi: p.tuoi || 30,
                  sucKhoe: p.sucKhoe || 'Tốt',
                  dangTapHuan: p.dangTapHuan || 'Không'
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
                dangTapHuan: p.dang_tap_huan || 'Không',
                assignments: [
                  {
                    position: 'Giám sát đóng gói/kiểm định',
                    department: 'Phòng Quản lý Chất lượng'
                  }
                ]
              }))
            : initialPersonnelData.map(p => ({
                ...p,
                tuoi: p.tuoi || 30,
                sucKhoe: p.sucKhoe || 'Tốt',
                dangTapHuan: p.dangTapHuan || 'Không'
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
        dangTapHuan: newEmp.dangTapHuan
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
      />
    );
  };

  // Chỉ hiển thị bộ lọc ở bên phải khi ở tab Quản lý nhân sự và không trong trạng thái tạo mới nhân sự
  const shouldShowFilterSidebar = role === 'admin' && activeTab === 'personnel' && !isCreating;

  return (
    <div className="app-container">
      {role === 'admin' && <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />}
      <div className="main-content">
        <Header role={role} setRole={setRole} />
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
