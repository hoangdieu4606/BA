import React, { useState } from 'react';
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

function App() {
  const [role, setRole] = useState('admin'); // 'admin' or 'employee'
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // Mặc định mở Trang chủ
  const [isCreating, setIsCreating] = useState(false);

  // Khởi tạo state nhân sự từ dữ liệu SQLite
  const dbPersonnel = (personnelData && personnelData.length > 0)
    ? personnelData.map(p => ({
        id: p.ma_nv,
        lastName: '',
        firstName: p.ten_nv,
        assignments: [
          {
            position: 'Giám sát đóng gói/kiểm định',
            department: 'Phòng Quản lý Chất lượng'
          }
        ]
      }))
    : initialPersonnelData;

  const [personnel, setPersonnel] = useState(dbPersonnel);

  // Khởi tạo state lô hàng truy xuất nguồn gốc từ SQLite
  const [traceabilityList, setTraceabilityList] = useState(traceabilityData || []);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleSaveEmployee = (newEmp) => {
    setPersonnel(prev => [newEmp, ...prev]);
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
      {role === 'admin' && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
      <div className="main-content">
        <Header role={role} setRole={setRole} />
        <div className="content-body">
          {role === 'admin' ? (
            <>
              <div className="center-area">
                {renderContent()}
              </div>
              {shouldShowFilterSidebar && (
                <div className={`right-sidebar ${!isFilterOpen ? 'closed' : ''}`}>
                  <FilterSidebar onClose={toggleFilter} />
                </div>
              )}
            </>
          ) : (
            <div className="center-area" style={{ flex: 1, padding: 0 }}>
              <EmployeeDashboard 
                traceabilityList={traceabilityList}
                setTraceabilityList={setTraceabilityList}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
