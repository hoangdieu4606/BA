import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './DepartmentTable.css'; // Reuse existing table styles
import './EmployeeForm.css'; // Reuse form styles
import { customerData } from '../utils/traceabilityData';
import GS1QRCode from './GS1QRCode';

const API_BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

const getShipmentStep = (item) => {
  if (item.ket_qua_kiem_dich === 'Không đạt') {
    return { index: 2, label: 'Lô hàng lỗi', color: 'danger' };
  }
  const isReceived = !item.cach_ly || !item.loai || item.khoi_luong_lo_hang === null || item.khoi_luong_lo_hang === '';
  if (isReceived) {
    return { index: 0, label: 'Tiếp nhận', color: 'warning' };
  }
  const isProcessing = item.khoi_luong_dong_goi === null || item.khoi_luong_dong_goi === '' || (item.ket_qua_kiem_dich !== 'Đạt');
  if (isProcessing) {
    return { index: 1, label: 'Đang xử lý', color: 'info' };
  }
  return { index: 2, label: 'Bảo quản', color: 'success' };
};

const GenericListView = ({ activeTab, traceabilityList = [], setTraceabilityList, role = 'admin' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vungTrongList, setVungTrongList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouseReceipts, setWarehouseReceipts] = useState([]);
  const [isEditingWarehouse, setIsEditingWarehouse] = useState(false);
  const [warehouseEditData, setWarehouseEditData] = useState(null);

  const [isCreatingReceipt, setIsCreatingReceipt] = useState(false);
  const [newReceipt, setNewReceipt] = useState({ ma_phieu: '', id_lo_hang: '', ma_kho: '', ngay_nhap: '', khoi_luong: '', vi_tri_luu_tru: '' });
  const [editingReceiptId, setEditingReceiptId] = useState(null);
  const [receiptEditData, setReceiptEditData] = useState(null);

  const handleCreateReceiptClick = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setNewReceipt({
      ma_phieu: `PNK-${randomNum}`,
      id_lo_hang: '',
      ma_kho: selectedWarehouse.ma_kho,
      ngay_nhap: new Date().toISOString().split('T')[0],
      khoi_luong: '',
      vi_tri_luu_tru: ''
    });
    setIsCreatingReceipt(true);
  };

  const handleReceiptChange = (e) => {
    const { name, value } = e.target;
    setNewReceipt(prev => ({ ...prev, [name]: value }));
  };

  const handleReceiptSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newReceipt.ma_phieu || !newReceipt.id_lo_hang || !newReceipt.khoi_luong || !newReceipt.ngay_nhap) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    fetch(`${API_BASE_URL}/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReceipt)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Lỗi khi tạo phiếu nhập kho');
        }
        return data;
      })
      .then(saved => {
        setWarehouseReceipts(prev => [...prev, { ...saved, loai_kho_lo_hang: selectedWarehouse.loai_kho, khoi_luong_dong_goi: saved.khoi_luong }]);
        setIsCreatingReceipt(false);
        alert("Tạo phiếu nhập kho thành công!");
      })
      .catch(err => {
        alert(err.message);
      });
  };

  const handleEditReceiptClick = (receipt) => {
    setEditingReceiptId(receipt.ma_phieu);
    setReceiptEditData({ ...receipt });
  };

  const handleReceiptEditChange = (e) => {
    const { name, value } = e.target;
    setReceiptEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleReceiptEditSubmit = (e) => {
    if (e) e.preventDefault();
    fetch(`${API_BASE_URL}/receipts/${receiptEditData.ma_phieu}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptEditData)
    })
      .then(res => res.json())
      .then(() => {
        setWarehouseReceipts(prev => prev.map(r => r.ma_phieu === receiptEditData.ma_phieu ? { ...r, ...receiptEditData } : r));
        setEditingReceiptId(null);
      })
      .catch(console.error);
  };

  const handleDeleteReceipt = (maPhieu) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phiếu nhập kho ${maPhieu}?`)) {
      fetch(`${API_BASE_URL}/receipts/${maPhieu}`, { method: 'DELETE' })
        .then(() => {
          setWarehouseReceipts(prev => prev.filter(r => r.ma_phieu !== maPhieu));
        })
        .catch(console.error);
    }
  };

  const [contractsList, setContractsList] = useState([]);
  const [faultyList, setFaultyList] = useState([]);

  useEffect(() => {
    if (activeTab === 'quan-ly-vung-trong') {
      fetch(`${API_BASE_URL}/vung-trong`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setVungTrongList(data);
        })
        .catch(err => console.error('Error fetching vung trong:', err));
    } else if (activeTab === 'nguoi-dung-khach-hang') {
      fetch(`${API_BASE_URL}/customers`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setCustomersList(data);
        })
        .catch(err => console.error('Error fetching customers:', err));
    } else if (activeTab === 'quan-ly-kho') {
      fetch(`${API_BASE_URL}/warehouses`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setWarehousesList(data);
        })
        .catch(err => console.error('Error fetching warehouses:', err));
    } else if (activeTab === 'quan-ly-hop-dong') {
      fetch(`${API_BASE_URL}/contracts`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setContractsList(data);
        })
        .catch(err => console.error('Error fetching contracts:', err));
      // Also fetch customers so contract form can show customer dropdown
      fetch(`${API_BASE_URL}/customers`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setCustomersList(data);
        })
        .catch(err => console.error('Error fetching customers for contracts:', err));
    } else if (activeTab === 'lo-hang-loi') {
      fetch(`${API_BASE_URL}/faulty-shipments`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setFaultyList(data);
        })
        .catch(err => console.error('Error fetching faulty shipments:', err));
    }
  }, [activeTab, traceabilityList]);

  // 1. Define custom data sets for each tab
  const getDataForTab = () => {
    switch (activeTab) {
      case 'lo-hang-tiep-nhan': {
        const filtered = traceabilityList.filter(item => 
          !item.cach_ly || !item.loai || item.khoi_luong_lo_hang === null || item.khoi_luong_lo_hang === ''
        );
        return {
          title: 'Tiếp nhận lô hàng',
          headers: ['Mã lô', 'Mã vùng trồng (PUC)', 'Địa chỉ vườn', 'Tên vườn', 'Ngày thu hoạch', 'Phun thuốc gần nhất', 'Cách ly', 'Loại', 'Khối lượng lô (tấn)'],
          rows: filtered.map(item => ({
            displayValues: [
              item.id,
              item.ma_puc,
              item.dia_chi_vuon,
              item.ten_vuon,
              item.ngay_thu_hoach,
              item.lan_phun_thuoc_gan_nhat,
              item.cach_ly || 'đang phân loại',
              item.loai || 'đang phân loại',
              item.khoi_luong_lo_hang !== null && item.khoi_luong_lo_hang !== '' ? item.khoi_luong_lo_hang : 'đang phân loại'
            ],
            original: item
          })),
          badgeColor: 'warning'
        };
      }
      case 'lo-hang-xu-ly': {
        const filtered = traceabilityList.filter(item => {
          const hasCore = item.cach_ly && item.loai && item.khoi_luong_lo_hang !== null && item.khoi_luong_lo_hang !== '';
          const notApproved = item.khoi_luong_dong_goi === null || item.khoi_luong_dong_goi === '' || (item.ket_qua_kiem_dich !== 'Đạt' && item.ket_qua_kiem_dich !== 'Không đạt');
          return hasCore && notApproved;
        });
        return {
          title: 'Lô hàng đang xử lý',
          headers: ['Mã lô', 'Mã vùng trồng (PUC)', 'Địa chỉ vườn', 'Tên vườn', 'Ngày thu hoạch', 'Phun thuốc gần nhất', 'Cách ly', 'Loại', 'Khối lượng lô (tấn)', 'Khối lượng đóng gói (tấn)'],
          rows: filtered.map(item => ({
            displayValues: [
              item.id,
              item.ma_puc,
              item.dia_chi_vuon,
              item.ten_vuon,
              item.ngay_thu_hoach,
              item.lan_phun_thuoc_gan_nhat,
              item.cach_ly,
              item.loai,
              item.khoi_luong_lo_hang,
              item.khoi_luong_dong_goi !== null && item.khoi_luong_dong_goi !== '' ? item.khoi_luong_dong_goi : 'đang chế biến & đóng gói'
            ],
            original: item
          })),
          badgeColor: 'info'
        };
      }
      case 'lo-hang-bao-quan': {
        const filtered = traceabilityList.filter(item => {
          const hasCore = item.cach_ly && item.loai && item.khoi_luong_lo_hang !== null && item.khoi_luong_lo_hang !== '';
          const hasDongGoi = item.khoi_luong_dong_goi !== null && item.khoi_luong_dong_goi !== '';
          const isApproved = item.ket_qua_kiem_dich === 'Đạt';
          return hasCore && hasDongGoi && isApproved;
        });
        return {
          title: 'Bảo quản lô hàng trong kho',
          headers: ['Mã lô', 'Mã vùng trồng (PUC)', 'Địa chỉ vườn', 'Tên vườn', 'Ngày thu hoạch', 'Phun thuốc gần nhất', 'Cách ly', 'Loại', 'Khối lượng lô (tấn)', 'Khối lượng đóng gói (tấn)', 'Nơi xuất khẩu', 'Cơ sở đóng gói', 'Mã CS đóng gói', 'Kết quả kiểm dịch'],
          rows: filtered.map(item => ({
            displayValues: [
              item.id,
              item.ma_puc,
              item.dia_chi_vuon,
              item.ten_vuon,
              item.ngay_thu_hoach,
              item.lan_phun_thuoc_gan_nhat,
              item.cach_ly,
              item.loai,
              item.khoi_luong_lo_hang,
              item.khoi_luong_dong_goi,
              item.noi_xuat_khau,
              item.ten_co_so_dong_goi,
              item.ma_phc,
              item.ket_qua_kiem_dich
            ],
            original: item
          })),
          badgeColor: 'success'
        };
      }
      case 'lo-hang-loi': {
        const rows = (faultyList || []).map(item => ({
          displayValues: [
            item.ma_loi,
            item.id_lo_hang,
            item.ma_puc,
            item.loai_loi,
            item.ngay_phat_hien,
            item.nguoi_phu_trach,
            item.trang_thai,
            item.ket_qua_kiem_tra_lai
          ],
          original: item
        }));
        return {
          title: 'Quản lý danh sách lô hàng lỗi (FR45, FR46)',
          headers: ['Mã lỗi', 'Mã lô hàng', 'Mã vùng trồng', 'Loại lỗi', 'Ngày phát hiện', 'Người phụ trách', 'Trạng thái xử lý', 'Kết quả kiểm tra lại'],
          rows: rows,
          badgeColor: 'danger'
        };
      }
      case 'lo-hang-cach-ly': {
        const filtered = traceabilityList.filter(item => 
          item.cach_ly === 'Có'
        );
        return {
          title: 'Lô hàng đang cách ly',
          headers: ['Mã lô', 'Mã vùng trồng (PUC)', 'Địa chỉ vườn', 'Tên vườn', 'Ngày thu hoạch', 'Cách ly', 'Loại', 'Khối lượng lô (tấn)', 'Kết quả kiểm dịch'],
          rows: filtered.map(item => ({
            displayValues: [
              item.id,
              item.ma_puc,
              item.dia_chi_vuon,
              item.ten_vuon,
              item.ngay_thu_hoach,
              item.cach_ly || 'Có',
              item.loai || 'đang phân loại',
              item.khoi_luong_lo_hang !== null && item.khoi_luong_lo_hang !== '' ? item.khoi_luong_lo_hang : 'đang phân loại',
              item.ket_qua_kiem_dich || 'Chưa kiểm dịch'
            ],
            original: item
          })),
          badgeColor: 'danger'
        };
      }
      case 'lo-hang-tra-cuu': {
        return {
          title: 'Tra cứu lô hàng',
          headers: ['Mã lô', 'Mã vùng trồng (PUC)', 'Tên vườn', 'Loại', 'Khối lượng lô (tấn)', 'Nơi xuất khẩu', 'Kết quả kiểm dịch'],
          rows: traceabilityList.map(item => ({
            displayValues: [
              item.id,
              item.ma_puc,
              item.ten_vuon,
              item.loai || 'Chưa rõ',
              item.khoi_luong_lo_hang !== null && item.khoi_luong_lo_hang !== '' ? item.khoi_luong_lo_hang : 'Chưa rõ',
              item.noi_xuat_khau || 'Chưa rõ',
              item.ket_qua_kiem_dich || 'Chưa rõ'
            ],
            original: item
          })),
          badgeColor: 'primary'
        };
      }
      case 'nguoi-dung-tai-khoan':
        return {
          title: 'Quản lý tài khoản',
          headers: ['Email tài khoản', 'Họ tên', 'Vai trò', 'Quyền truy cập', 'Lần đăng nhập cuối', 'Trạng thái'],
          rows: [
            ['an.nguyen@namdogroup.vn', 'Nguyễn Văn An', 'Giám đốc', 'Đầy đủ chức năng', 'Hôm nay 08:30', 'Đang hoạt động'],
            ['bich.tran@namdogroup.vn', 'Trần Thị Bích', 'Trưởng phòng Marketing', 'Giới hạn', 'Hôm qua 15:40', 'Đang hoạt động'],
            ['admin.sys@namdogroup.vn', 'Hệ thống Quản trị', 'IT Admin', 'Đầy đủ chức năng', 'Hôm nay 07:15', 'Đang hoạt động'],
            ['partner.test@gmail.com', 'Đại diện HTX', 'Đối tác', 'Chỉ xem', '12/06/2026', 'Tạm khóa']
          ],
          badgeColor: 'primary'
        };
      case 'nguoi-dung-khach-hang': {
        const rows = (customersList || []).map(item => ({
          displayValues: [
            item.ma_kh,
            item.ten_kh,
            item.dia_chi || 'Chưa rõ',
            item.quoc_gia,
            item.sdt || 'Chưa rõ',
            item.email || 'Chưa rõ'
          ],
          original: item
        }));
        return {
          title: 'Danh sách khách hàng',
          headers: ['Mã KH', 'Tên khách hàng / Doanh nghiệp', 'Địa chỉ', 'Quốc gia', 'Số điện thoại', 'Email liên hệ'],
          rows: rows,
          badgeColor: 'success'
        };
      }
      case 'nguoi-dung-doi-tac':
        return {
          title: 'Danh sách Đối tác',
          headers: ['Mã đối tác', 'Tên đối tác / Nhà vườn', 'Loại đối tác', 'Khu vực', 'Liên hệ', 'Đánh giá'],
          rows: [
            ['DT-001', 'Hợp tác xã Nông nghiệp Cái Bè', 'Nhà vườn cung cấp', 'Tiền Giang', 'Ông Nguyễn Văn Hữu', '⭐⭐⭐⭐⭐ (Xuất sắc)'],
            ['DT-002', 'Công ty Vận tải Biển Nam Triệu', 'Vận chuyển logistics', 'Hải Phòng', 'Bà Lê Thị Thu', '⭐⭐⭐⭐ (Tốt)'],
            ['DT-003', 'HTX Cây ăn trái Cao Lãnh', 'Nhà vườn cung cấp', 'Đồng Tháp', 'Ông Phạm Minh Đức', '⭐⭐⭐⭐⭐ (Xuất sắc)'],
            ['DT-004', 'Logistics Green Express', 'Vận chuyển nội địa', 'Hồ Chí Minh', 'Ông Trần Thanh Nam', '⭐⭐⭐⭐ (Tốt)']
          ],
          badgeColor: 'info'
        };
      case 'bao-bi-tuoi-xuat-khau':
        return {
          title: 'Bao bì Trái tươi xuất khẩu',
          headers: ['Mã vật tư', 'Loại bao bì', 'Kích thước', 'Số lượng tồn kho', 'Đơn vị', 'Ngưỡng tối thiểu'],
          rows: [
            ['BB-T01', 'Thùng carton đựng sầu riêng (5 lớp)', '60x40x40 cm', '5,000', 'Cái', '1,000'],
            ['BB-T02', 'Thùng carton đựng xoài (3 lớp)', '45x30x25 cm', '12,000', 'Cái', '2,000'],
            ['BB-T03', 'Lưới xốp bọc trái cây', 'Đường kính 10cm', '50,000', 'Cái', '10,000'],
            ['BB-T04', 'Nhãn dán logo Nam Đô Group', 'Cuộn 1000 tem', '150', 'Cuộn', '30']
          ],
          badgeColor: 'success'
        };
      case 'bao-bi-dong-lanh':
        return {
          title: 'Bao bì Nguyên trái đông lạnh',
          headers: ['Mã vật tư', 'Loại bao bì', 'Chất liệu', 'Số lượng tồn', 'Đơn vị', 'Trạng thái'],
          rows: [
            ['BB-DL01', 'Túi hút chân không dày 120mic', 'PA/PE', '25,000', 'Cái', 'Sẵn hàng'],
            ['BB-DL02', 'Thùng xốp bảo ôn xuất khẩu', 'EPS cao cấp', '1,500', 'Cái', 'Sẵn hàng'],
            ['BB-DL03', 'Tem dán hàng đông lạnh chuyên dụng', 'Keo chịu nhiệt âm', '30,000', 'Cái', 'Cần nhập thêm ⚠️']
          ],
          badgeColor: 'info'
        };
      case 'bao-bi-mui-com':
        return {
          title: 'Bao bì Đóng gói múi cơm',
          headers: ['Mã vật tư', 'Loại khay/hộp', 'Dung tích', 'Tồn kho', 'Đơn vị', 'Quy cách đóng gói'],
          rows: [
            ['BB-MC01', 'Khay nhựa PP đựng múi sầu riêng', '500g', '18,500', 'Cái', 'Thùng 500 cái'],
            ['BB-MC02', 'Màng bọc thực phẩm co giãn nhiệt', 'Khổ 40cm', '80', 'Cuộn', 'Hộp giấy cuộn lẻ'],
            ['BB-MC03', 'Hộp giấy bọc ngoài khay sầu riêng', 'In Offset 4 màu', '8,000', 'Cái', 'Thùng 200 cái']
          ],
          badgeColor: 'warning'
        };
      case 'bao-bi-say-kho':
        return {
          title: 'Bao bì sấy khô',
          headers: ['Mã vật tư', 'Tên bao bì', 'Kích thước túi', 'Tồn kho', 'Đơn vị', 'Nhà cung cấp'],
          rows: [
            ['BB-SK01', 'Túi nhôm zipper đáy đứng mít sấy', '18x26 cm', '15,000', 'Cái', 'Bao bì Ánh Dương'],
            ['BB-SK02', 'Túi zipper giấy Kraft sấy dẻo', '15x22 cm', '8,000', 'Cái', 'Bao bì Thành Phát'],
            ['BB-SK03', 'Hộp nhựa tròn nắp vặn đựng chuối sấy', '500ml', '3,500', 'Cái', 'Nhựa Song Long']
          ],
          badgeColor: 'success'
        };
      case 'van-chuyen':
        return {
          title: 'Quản lý vận chuyển',
          headers: ['Mã chuyến', 'Phương tiện / Số xe', 'Đơn vị vận chuyển', 'Tuyến đường', 'Ngày xuất phát', 'Trạng thái'],
          rows: [
            ['VC-101', 'Container Lạnh (Xe 29C-889.22)', 'Vận tải Nam Triệu', 'Kho Cái Bè -> Cảng Cát Lái', '16/06/2026', 'Đang giao hàng'],
            ['VC-102', 'Tàu biển WAN HAI 312', 'Hãng tàu Wan Hai', 'Cảng Cát Lái -> Cảng Yokohama', '18/06/2026', 'Chờ bốc xếp'],
            ['VC-103', 'Xe tải nhẹ 2.5 tấn (63C-112.45)', 'Nội bộ Nam Đô', 'Nhà vườn HTX -> Nhà máy sơ chế', '16/06/2026', 'Đã hoàn thành']
          ],
          badgeColor: 'info'
        };
      case 'quan-ly-hop-dong': {
        const rows = (contractsList || []).map(item => ({
          displayValues: [
            item.so_hop_dong,
            item.ma_kh ? `${item.ma_kh}${item.ten_kh ? ' - ' + item.ten_kh : ''}` : 'Chưa liên kết',
            item.ten_doi_tac,
            item.loai_hop_dong,
            item.gia_tri,
            item.ngay_ky,
            item.trang_thai
          ],
          original: item
        }));
        return {
          title: 'Quản lý hợp đồng mua bán',
          headers: ['Số hợp đồng', 'Khách hàng (MaKH)', 'Tên đối tác', 'Loại hợp đồng', 'Giá trị', 'Ngày ký', 'Trạng thái'],
          rows: rows,
          badgeColor: 'primary'
        };
      }
      case 'quan-ly-vung-trong': {
        const rows = (vungTrongList || []).map(item => ({
          displayValues: [
            item.ma_puc,
            item.ten || 'Chưa rõ',
            item.ten_vuon || 'Chưa rõ',
            item.dia_chi || 'Chưa rõ'
          ],
          original: item
        }));
        return {
          title: 'Quản lý vùng trồng nguyên liệu',
          headers: ['Mã PUC', 'Đại diện / Chủ vườn', 'Tên vườn', 'Địa chỉ vùng trồng'],
          rows: rows,
          badgeColor: 'success'
        };
      }
      case 'quan-ly-kho': {
        const rows = (warehousesList || []).map(item => ({
          displayValues: [
            item.ma_kho,
            item.ten_kho,
            item.loai_kho === 'Đông' ? 'Kho đông lạnh' : 'Kho bảo mát',
            `${item.suc_chua_lon_nhat} tấn`,
            `${item.suc_chua_con_trong} tấn`,
            item.tinh_trang_ve_sinh
          ],
          original: item
        }));
        return {
          title: 'Quản lý kho bảo quản',
          headers: ['Mã kho', 'Tên kho hàng', 'Loại kho', 'Sức chứa tối đa', 'Sức chứa còn trống', 'Tình trạng vệ sinh'],
          rows: rows,
          badgeColor: 'primary'
        };
      }
      case 'bao-cao-doanh-thu':
        return {
          title: 'Báo cáo doanh thu bán hàng xuất khẩu',
          headers: ['Tháng', 'Doanh thu xuất khẩu (đ)', 'Doanh thu nội địa (đ)', 'Tổng doanh thu (đ)', 'Tỷ lệ tăng trưởng', 'Trạng thái'],
          rows: [
            ['Tháng 5/2026', '3,450,000,000đ', '850,000,000đ', '4,300,000,000đ', '+12.5%', 'Đã chốt sổ'],
            ['Tháng 4/2026', '2,900,000,000đ', '720,000,000đ', '3,620,000,000đ', '+8.2%', 'Đã chốt sổ'],
            ['Tháng 3/2026', '2,500,000,000đ', '650,000,000đ', '3,150,000,000đ', '+5.0%', 'Đã chốt sổ']
          ],
          badgeColor: 'success',
          isChart: true // We can render a neat custom SVG chart here!
        };
      case 'bao-cao-tuan':
        return {
          title: 'Báo cáo hoạt động tuần',
          headers: ['Tuần báo cáo', 'Sản lượng tiếp nhận (tấn)', 'Sản lượng xuất khẩu (tấn)', 'Tổng xe hoàn thành', 'Sự cố phát sinh', 'Người lập báo cáo'],
          rows: [
            ['Tuần 24 (08/06 - 14/06)', '42.5', '38.0', '12 chuyến', 'Không', 'Trần Thị Bích'],
            ['Tuần 23 (01/06 - 07/06)', '38.2', '35.5', '10 chuyến', 'Hỏng máy lạnh xe VC-101 (đã xử lý)', 'Trần Thị Bích'],
            ['Tuần 22 (25/05 - 31/05)', '45.0', '42.0', '15 chuyến', 'Không', 'Trần Thị Bích']
          ],
          badgeColor: 'info'
        };
      default:
        return {
          title: 'Dữ liệu trang quản lý',
          headers: ['Mã số', 'Thông tin chi tiết', 'Trạng thái'],
          rows: [
            ['001', 'Thông tin mẫu trang quản lý', 'Hoạt động']
          ],
          badgeColor: 'primary'
        };
    }
  };

  const data = getDataForTab();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  
  const [isCreatingVungTrong, setIsCreatingVungTrong] = useState(false);
  const [newVungTrong, setNewVungTrong] = useState({
    ma_puc: '',
    ten: '',
    ten_vuon: '',
    dia_chi: ''
  });

  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    ma_kh: '',
    ten_kh: '',
    dia_chi: '',
    quoc_gia: '',
    sdt: '',
    email: ''
  });

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

  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const [newContract, setNewContract] = useState({
    so_hop_dong: '',
    ma_kh: '',
    ten_doi_tac: '',
    loai_hop_dong: '',
    gia_tri: '',
    ngay_ky: '',
    trang_thai: '',
    tiens_do_giao_hang: '',
    vi_pham: 'Không ghi nhận vi phạm',
    phu_luc: 'Không có phụ lục',
    tinh_trang_thanh_toan: ''
  });

  const [isCreatingFaulty, setIsCreatingFaulty] = useState(false);
  const [newFaulty, setNewFaulty] = useState({
    ma_loi: '',
    id_lo_hang: '',
    ma_puc: '',
    loai_loi: '',
    ngay_phat_hien: '',
    nguoi_phu_trach: '',
    trang_thai: 'Đang xử lý',
    ket_qua_kiem_tra_lai: 'Chưa kiểm tra lại'
  });

  const handleCreateClick = () => {
    if (activeTab === 'quan-ly-vung-trong') {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setNewVungTrong({
        ma_puc: `VT-PUC-${randomNum}`,
        ten: '',
        ten_vuon: '',
        dia_chi: ''
      });
      setIsCreatingVungTrong(true);
    } else if (activeTab === 'nguoi-dung-khach-hang') {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setNewCustomer({
        ma_kh: `KH${randomNum}`,
        ten_kh: '',
        dia_chi: '',
        quoc_gia: '',
        sdt: '',
        email: ''
      });
      setIsCreatingCustomer(true);
    } else if (activeTab === 'quan-ly-hop-dong') {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setNewContract({
        so_hop_dong: `HD-2026-${randomNum}`,
        ma_kh: '',
        ten_doi_tac: '',
        loai_hop_dong: '',
        gia_tri: '',
        ngay_ky: new Date().toISOString().split('T')[0],
        trang_thai: 'Đang chuẩn bị',
        tiens_do_giao_hang: '',
        vi_pham: 'Không ghi nhận vi phạm',
        phu_luc: 'Không có phụ lục',
        tinh_trang_thanh_toan: ''
      });
      setIsCreatingContract(true);
    } else if (activeTab === 'lo-hang-loi') {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setNewFaulty({
        ma_loi: `LHL-${randomNum}`,
        id_lo_hang: '',
        ma_puc: '',
        loai_loi: '',
        ngay_phat_hien: new Date().toISOString().split('T')[0],
        nguoi_phu_trach: '',
        trang_thai: 'Đang xử lý',
        ket_qua_kiem_tra_lai: 'Chưa kiểm tra lại'
      });
      setIsCreatingFaulty(true);
    } else if (activeTab.startsWith('lo-hang-')) {
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
    } else {
      alert('Chức năng tạo mới cho danh mục này sẽ được phát triển sau!');
    }
  };

  const handleFaultySubmit = (e) => {
    if (e) e.preventDefault();
    if (!newFaulty.ma_loi || !newFaulty.id_lo_hang || !newFaulty.ma_puc || !newFaulty.loai_loi || !newFaulty.ngay_phat_hien || !newFaulty.nguoi_phu_trach) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }
    fetch(`${API_BASE_URL}/faulty-shipments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFaulty)
    })
      .then(res => res.json())
      .then(saved => {
        setFaultyList(prev => [saved, ...prev]);
        setIsCreatingFaulty(false);
      })
      .catch(err => {
        console.error(err);
        setFaultyList(prev => [newFaulty, ...prev]);
        setIsCreatingFaulty(false);
      });
  };

  const handleVungTrongSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newVungTrong.ma_puc || !newVungTrong.ten || !newVungTrong.ten_vuon || !newVungTrong.dia_chi) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }
    fetch(`${API_BASE_URL}/vung-trong`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVungTrong)
    })
      .then(res => res.json())
      .then(saved => {
        setVungTrongList(prev => [saved, ...prev]);
        setIsCreatingVungTrong(false);
      })
      .catch(err => {
        console.error(err);
        setVungTrongList(prev => [newVungTrong, ...prev]);
        setIsCreatingVungTrong(false);
      });
  };

  const handleContractSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newContract.so_hop_dong || !newContract.ten_doi_tac || !newContract.loai_hop_dong || !newContract.gia_tri || !newContract.ngay_ky) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }
    fetch(`${API_BASE_URL}/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newContract)
    })
      .then(res => res.json())
      .then(saved => {
        setContractsList(prev => [saved, ...prev]);
        setIsCreatingContract(false);
      })
      .catch(err => {
        console.error(err);
        setContractsList(prev => [newContract, ...prev]);
        setIsCreatingContract(false);
      });
  };

  const handleCustomerSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newCustomer.ma_kh || !newCustomer.ten_kh || !newCustomer.quoc_gia) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }
    fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    })
      .then(res => res.json())
      .then(saved => {
        setCustomersList(prev => [saved, ...prev]);
        setIsCreatingCustomer(false);
      })
      .catch(err => {
        console.error(err);
        setCustomersList(prev => [newCustomer, ...prev]);
        setIsCreatingCustomer(false);
      });
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

    fetch(`${API_BASE_URL}/traceability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedShipment)
    })
      .then(res => res.json())
      .then(saved => {
        if (setTraceabilityList) {
          setTraceabilityList(prev => [formattedShipment, ...prev]);
        }
        setIsCreatingShipment(false);
      })
      .catch(err => {
        console.error('Error creating shipment:', err);
        // Fallback local update
        if (setTraceabilityList) {
          setTraceabilityList(prev => [formattedShipment, ...prev]);
        }
        setIsCreatingShipment(false);
      });
  };

  const handleEditClick = () => {
    setEditData({ ...selectedRecord });
    setIsEditing(true);
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

    if (activeTab === 'quan-ly-vung-trong') {
      fetch(`${API_BASE_URL}/vung-trong/${editData.ma_puc}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })
        .then(res => res.json())
        .then(updated => {
          setVungTrongList(prev => prev.map(item => item.ma_puc === updated.ma_puc ? updated : item));
          if (setTraceabilityList) {
            setTraceabilityList(prev => prev.map(item => {
              if (item.ma_puc === updated.ma_puc) {
                return { ...item, ten_vuon: updated.ten_vuon, dia_chi_vuon: updated.dia_chi };
              }
              return item;
            }));
          }
          setSelectedRecord(updated);
          setIsEditing(false);
        })
        .catch(err => {
          console.error(err);
          setSelectedRecord(editData);
          setIsEditing(false);
        });
      return;
    }

    if (activeTab === 'lo-hang-loi') {
      fetch(`${API_BASE_URL}/faulty-shipments/${editData.ma_loi}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })
        .then(res => res.json())
        .then(updated => {
          setFaultyList(prev => prev.map(item => item.ma_loi === editData.ma_loi ? { ...item, ...editData } : item));
          setSelectedRecord({ ...selectedRecord, ...editData });
          setIsEditing(false);
        })
        .catch(err => {
          console.error(err);
          setSelectedRecord(editData);
          setIsEditing(false);
        });
      return;
    }

    if (activeTab === 'quan-ly-hop-dong') {
      fetch(`${API_BASE_URL}/contracts/${editData.so_hop_dong}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })
        .then(res => res.json())
        .then(updated => {
          setContractsList(prev => prev.map(item => item.so_hop_dong === updated.so_hop_dong ? updated : item));
          setSelectedRecord(updated);
          setIsEditing(false);
        })
        .catch(err => {
          console.error(err);
          setSelectedRecord(editData);
          setIsEditing(false);
        });
      return;
    }

    if (activeTab === 'nguoi-dung-khach-hang') {
      fetch(`${API_BASE_URL}/customers/${editData.ma_kh}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })
        .then(res => res.json())
        .then(updated => {
          setCustomersList(prev => prev.map(item => item.ma_kh === updated.ma_kh ? updated : item));
          setSelectedRecord(updated);
          setIsEditing(false);
        })
        .catch(err => {
          console.error(err);
          setSelectedRecord(editData);
          setIsEditing(false);
        });
      return;
    }

    if (!editData.id || !editData.ma_puc || !editData.ten_vuon || !editData.dia_chi_vuon || !editData.ngay_thu_hoach) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    const formatted = {
      ...editData,
      khoi_luong_lo_hang: editData.khoi_luong_lo_hang !== '' && editData.khoi_luong_lo_hang !== null ? parseFloat(editData.khoi_luong_lo_hang) : null,
      khoi_luong_dong_goi: editData.khoi_luong_dong_goi !== '' && editData.khoi_luong_dong_goi !== null ? parseFloat(editData.khoi_luong_dong_goi) : null,
      cach_ly: editData.cach_ly || null,
      loai: editData.loai || null,
      noi_xuat_khau: editData.noi_xuat_khau || null,
      ten_co_so_dong_goi: editData.ten_co_so_dong_goi || null,
      ma_phc: editData.ma_phc || null,
      ket_qua_kiem_dich: editData.ket_qua_kiem_dich || null
    };

    fetch(`${API_BASE_URL}/traceability/${formatted.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formatted)
    })
      .then(res => res.json())
      .then(updated => {
        if (setTraceabilityList) {
          setTraceabilityList(prev => prev.map(item => item.id === formatted.id ? formatted : item));
        }
        setSelectedRecord(formatted);
        setIsEditing(false);
      })
      .catch(err => {
        console.error('Error updating shipment:', err);
        if (setTraceabilityList) {
          setTraceabilityList(prev => prev.map(item => item.id === formatted.id ? formatted : item));
        }
        setSelectedRecord(formatted);
        setIsEditing(false);
      });
  };

  const handleExportExcel = () => {
    const currentData = getDataForTab();
    
    const normalizedRows = currentData.rows.map(row => {
      if (Array.isArray(row)) {
        return { displayValues: row, original: null };
      }
      return row;
    });

    const filtered = normalizedRows.filter(row => 
      row.displayValues.some(cell => cell !== null && cell !== undefined ? cell.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false)
    );

    if (filtered.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    const exportData = filtered.map(row => {
      const obj = {};
      currentData.headers.forEach((header, idx) => {
        let val = row.displayValues[idx];
        if (val === null || val === undefined) {
          val = '';
        }
        obj[header] = val;
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    
    let sheetName = currentData.title.replace(/[:\\/?*\[\]]/g, '').substring(0, 30);
    sheetName = sheetName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
    if (!sheetName) {
      sheetName = 'Sheet1';
    }
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const cleanTitle = currentData.title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const fileName = `${cleanTitle || 'export'}.xlsx`;

    try {
      const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
      const dataUri = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + b64;
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Data URI download failed, falling back to writeFile", err);
      XLSX.writeFile(wb, fileName);
    }
  };

  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allPageIds = filteredRows.map(row => row.original ? (row.original.ma_loi || row.original.id || row.original.ma_puc || row.original.ma_kh || row.original.ma_kho) : null).filter(Boolean);
      setSelectedIds(allPageIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteRow = (id) => {
    if (activeTab === 'quan-ly-vung-trong') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa vùng trồng ${id}?`)) {
        fetch(`${API_BASE_URL}/vung-trong/${id}`, { method: 'DELETE' })
          .then(() => {
            setVungTrongList(prev => prev.filter(item => item.ma_puc !== id));
            setSelectedIds(prev => prev.filter(x => x !== id));
          })
          .catch(console.error);
      }
      return;
    }
    if (activeTab === 'nguoi-dung-khach-hang') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng ${id}?`)) {
        fetch(`${API_BASE_URL}/customers/${id}`, { method: 'DELETE' })
          .then(() => {
            setCustomersList(prev => prev.filter(item => item.ma_kh !== id));
            setSelectedIds(prev => prev.filter(x => x !== id));
          })
          .catch(console.error);
      }
      return;
    }

    if (activeTab === 'lo-hang-loi') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa lô hàng lỗi ${id}?`)) {
        fetch(`${API_BASE_URL}/faulty-shipments/${id}`, { method: 'DELETE' })
          .then(() => {
            setFaultyList(prev => prev.filter(item => item.ma_loi !== id));
            setSelectedIds(prev => prev.filter(x => x !== id));
          })
          .catch(console.error);
      }
      return;
    }

    if (activeTab === 'quan-ly-hop-dong') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa hợp đồng ${id}?`)) {
        fetch(`${API_BASE_URL}/contracts/${id}`, { method: 'DELETE' })
          .then(() => {
            setContractsList(prev => prev.filter(item => item.so_hop_dong !== id));
            setSelectedIds(prev => prev.filter(x => x !== id));
          })
          .catch(console.error);
      }
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa lô hàng ${id}?`)) {
      if (setTraceabilityList) {
        setTraceabilityList(prev => prev.filter(item => item.id !== id));
      }
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  const handleBulkDelete = () => {
    if (activeTab === 'quan-ly-vung-trong') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} vùng trồng đã chọn?`)) {
        Promise.all(selectedIds.map(id => fetch(`${API_BASE_URL}/vung-trong/${id}`, { method: 'DELETE' })))
          .then(() => {
            setVungTrongList(prev => prev.filter(item => !selectedIds.includes(item.ma_puc)));
            setSelectedIds([]);
          })
          .catch(console.error);
      }
      return;
    }
    if (activeTab === 'lo-hang-loi') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} lô hàng lỗi đã chọn?`)) {
        Promise.all(selectedIds.map(id => fetch(`${API_BASE_URL}/faulty-shipments/${id}`, { method: 'DELETE' })))
          .then(() => {
            setFaultyList(prev => prev.filter(item => !selectedIds.includes(item.ma_loi)));
            setSelectedIds([]);
          })
          .catch(console.error);
      }
      return;
    }

    if (activeTab === 'quan-ly-hop-dong') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} hợp đồng đã chọn?`)) {
        Promise.all(selectedIds.map(id => fetch(`${API_BASE_URL}/contracts/${id}`, { method: 'DELETE' })))
          .then(() => {
            setContractsList(prev => prev.filter(item => !selectedIds.includes(item.so_hop_dong)));
            setSelectedIds([]);
          })
          .catch(console.error);
      }
      return;
    }
    if (activeTab === 'nguoi-dung-khach-hang') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} khách hàng đã chọn?`)) {
        Promise.all(selectedIds.map(id => fetch(`${API_BASE_URL}/customers/${id}`, { method: 'DELETE' })))
          .then(() => {
            setCustomersList(prev => prev.filter(item => !selectedIds.includes(item.ma_kh)));
            setSelectedIds([]);
          })
          .catch(console.error);
      }
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} lô hàng đã chọn?`)) {
      if (setTraceabilityList) {
        setTraceabilityList(prev => prev.filter(item => !selectedIds.includes(item.id)));
      }
      setSelectedIds([]);
    }
  };

  const handleRowDoubleClick = (record) => {
    if (activeTab === 'quan-ly-kho') {
      setSelectedWarehouse(record);
      setIsEditingWarehouse(false);
      fetch(`${API_BASE_URL}/warehouses/${record.ma_kho}/receipts`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setWarehouseReceipts(data);
        })
        .catch(err => console.error(err));
      return;
    }
    if (activeTab === 'quan-ly-hop-dong') {
      setSelectedRecord(record);
      return;
    }
    if (activeTab === 'lo-hang-loi') {
      if (role !== 'admin' && role !== 'technical') {
        alert("Bạn không có quyền xem thông tin chi tiết lô hàng lỗi (Chỉ Bộ phận quản lý và Bộ phận kỹ thuật được quyền xem).");
        return;
      }
      setSelectedRecord(record);
      return;
    }
    if (role !== 'admin' && role !== 'production') {
      alert("Bạn không có quyền xem thông tin chi tiết lô hàng này (Chỉ Bộ phận quản lý và Bộ phận sản xuất được quyền xem).");
      return;
    }
    setSelectedRecord(record);
  };

  const handleWarehouseEditChange = (e) => {
    const { name, value } = e.target;
    setWarehouseEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWarehouseEditSubmit = (e) => {
    if (e) e.preventDefault();
    if (role === 'qaqc') {
      fetch(`${API_BASE_URL}/warehouses/${warehouseEditData.ma_kho}/hygiene`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tinh_trang_ve_sinh: warehouseEditData.tinh_trang_ve_sinh })
      })
        .then(res => res.json())
        .then(() => {
          setWarehousesList(prev => prev.map(w => w.ma_kho === warehouseEditData.ma_kho ? { ...w, tinh_trang_ve_sinh: warehouseEditData.tinh_trang_ve_sinh } : w));
          setSelectedWarehouse(prev => ({ ...prev, tinh_trang_ve_sinh: warehouseEditData.tinh_trang_ve_sinh }));
          setIsEditingWarehouse(false);
        })
        .catch(console.error);
    } else if (role === 'logistics') {
      fetch(`${API_BASE_URL}/warehouses/${warehouseEditData.ma_kho}/capacity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suc_chua_con_trong: warehouseEditData.suc_chua_con_trong })
      })
        .then(res => res.json())
        .then(() => {
          setWarehousesList(prev => prev.map(w => w.ma_kho === warehouseEditData.ma_kho ? { ...w, suc_chua_con_trong: parseFloat(warehouseEditData.suc_chua_con_trong) } : w));
          setSelectedWarehouse(prev => ({ ...prev, suc_chua_con_trong: parseFloat(warehouseEditData.suc_chua_con_trong) }));
          setIsEditingWarehouse(false);
        })
        .catch(console.error);
    } else if (role === 'admin') {
      // Admin edits everything: hygiene, temperature, and capacity
      fetch(`${API_BASE_URL}/warehouses/${warehouseEditData.ma_kho}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouseEditData)
      })
        .then(res => res.json())
        .then(() => {
          setWarehousesList(prev => prev.map(w => w.ma_kho === warehouseEditData.ma_kho ? { ...w, ...warehouseEditData } : w));
          setSelectedWarehouse({ ...warehouseEditData });
          setIsEditingWarehouse(false);
        })
        .catch(console.error);
    }
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
    setIsEditing(false);
  };

  // Chuẩn hóa dòng dữ liệu để luôn có cấu trúc { displayValues, original }
  const normalizedRows = data.rows.map(row => {
    if (Array.isArray(row)) {
      return { displayValues: row, original: null };
    }
    return row;
  });

  // Lọc dữ liệu dựa trên từ khóa tìm kiếm
  const filteredRows = normalizedRows.filter(row => 
    row.displayValues.some(cell => cell !== null && cell !== undefined ? cell.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false)
  );

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <h2 className="table-title">{data.title} ({filteredRows.length})</h2>
        <div className="toolbar-actions">
          {selectedIds.length > 0 && role === 'admin' && (
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
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Xóa đã chọn ({selectedIds.length})
            </button>
          )}
          {/* Search bar integrated directly in toolbar */}
          <div className="search-wrapper" style={{ marginRight: '12px', position: 'relative', display: 'inline-block' }}>
            <input 
              type="text" 
              placeholder="Tìm kiếm nhanh..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontSize: '13px',
                width: '180px'
              }}
            />
          </div>
          <button 
            className="icon-btn" 
            style={{ marginRight: '12px', cursor: 'pointer' }}
            title="Quét mã QR (Tính năng đang phát triển)"
            onClick={() => alert('Chức năng quét mã QR đang được phát triển!')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-main)' }}>
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <line x1="7" y1="7" x2="7" y2="7.01" />
              <line x1="17" y1="7" x2="17" y2="7.01" />
              <line x1="17" y1="17" x2="17" y2="17.01" />
              <line x1="7" y1="17" x2="7" y2="17.01" />
            </svg>
          </button>
          <button className="icon-btn" style={{ marginRight: '12px' }} onClick={() => setSearchTerm('')}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
          <button className="text-btn active" style={{ marginRight: '12px' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Danh sách
          </button>
          <button className="text-btn" style={{ marginRight: '12px' }} onClick={handleExportExcel} title="Xuất dữ liệu sang file Excel">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Xuất Excel
          </button>
          {(((role === 'admin' || role === 'technical')) || (activeTab === 'quan-ly-hop-dong' && role === 'admin')) && (
            <button className="btn-primary" onClick={handleCreateClick}>+ Tạo mới</button>
          )}
        </div>
      </div>

      {data.isChart && (
        <div className="chart-container" style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-main)' }}>Biểu đồ tăng trưởng doanh thu 3 tháng qua (triệu đồng)</h3>
          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0 20px 20px 20px', borderBottom: '2px solid var(--border-color)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '40px', height: '100px', background: 'linear-gradient(to top, #818cf8, #4f46e5)', borderRadius: '4px 4px 0 0', position: 'relative', transition: 'all 0.5s' }}>
                <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: '700', color: 'var(--primary)' }}>3,150</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tháng 3</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '40px', height: '120px', background: 'linear-gradient(to top, #818cf8, #4f46e5)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: '700', color: 'var(--primary)' }}>3,620</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tháng 4</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '40px', height: '150px', background: 'linear-gradient(to top, #34d399, #10b981)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: '700', color: 'var(--success)' }}>4,300</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '600' }}>Tháng 5</span>
            </div>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-checkbox">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={filteredRows.length > 0 && selectedIds.length === filteredRows.filter(r => r.original).length}
                  disabled={role !== 'admin'}
                />
              </th>
              <th className="col-status"></th>
              {data.headers.map((header, idx) => (
                <th key={idx}>{header}</th>
              ))}
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, rowIdx) => {
              const displayCells = row.displayValues;
              const originalObj = row.original;
              
              return (
                <tr 
                  key={rowIdx} 
                  className={`table-row ${originalObj ? 'clickable-row' : ''}`}
                  onDoubleClick={() => originalObj && handleRowDoubleClick(originalObj)}
                  title={originalObj ? "Nhấp đúp để xem chi tiết lô hàng" : ""}
                >
                  <td className="col-checkbox">
                    {originalObj ? (
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(originalObj.ma_loi || originalObj.id || originalObj.ma_puc || originalObj.ma_kh || originalObj.ma_kho || originalObj.id_lo_hang)}
                        onChange={() => handleSelectRow(originalObj.ma_loi || originalObj.id || originalObj.ma_puc || originalObj.ma_kh || originalObj.ma_kho || originalObj.id_lo_hang)}
                        disabled={role !== 'admin'}
                      />
                    ) : (
                      <input type="checkbox" disabled />
                    )}
                  </td>
                  <td className="col-status">
                    <span className={`status-dot ${data.badgeColor}`}></span>
                  </td>
                  {displayCells.map((cell, cellIdx) => {
                    const isWarning = cell === 'đang phân loại';
                    const isInfo = cell === 'đang chế biến & đóng gói';
                    const isSuccess = cell === 'Đạt';
                    const isDanger = cell === 'Không đạt';
                    
                    return (
                      <td key={cellIdx} style={{ fontSize: '13px', fontWeight: cellIdx === 0 ? '600' : '400' }}>
                        {isWarning ? (
                          <span className="badge-class warning">{cell}</span>
                        ) : isInfo ? (
                          <span className="badge-class info">{cell}</span>
                        ) : isSuccess ? (
                          <span className="badge-class success">{cell}</span>
                        ) : isDanger ? (
                          <span className="badge-class danger">{cell}</span>
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}
                  <td className="col-actions">
                    <button className="action-btn" style={!originalObj ? { cursor: 'not-allowed' } : {}}>⋮</button>
                  </td>
                </tr>
              );
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={data.headers.length + 3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  Không tìm thấy kết quả phù hợp cho "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết lô hàng */}
      {selectedRecord && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: isEditing ? '750px' : '650px' }}>
            <div className="modal-header">
              <h3>{isEditing ? `Chỉnh sửa: ${selectedRecord.id || selectedRecord.so_hop_dong}` : `Chi tiết: ${selectedRecord.id || selectedRecord.so_hop_dong}`}</h3>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body" style={isEditing ? { padding: '20px 24px' } : {}}>
              {activeTab === 'quan-ly-vung-trong' ? (
                isEditing ? (
                  <form onSubmit={handleEditSubmit}>
                    <div className="other-info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                      <div className="form-group">
                        <label>Mã số vùng trồng (PUC)*</label>
                        <input type="text" name="ma_puc" value={editData.ma_puc || ''} disabled />
                      </div>
                      <div className="form-group">
                        <label>Đại diện / Chủ vườn*</label>
                        <input type="text" name="ten" value={editData.ten || ''} onChange={handleEditChange} required />
                      </div>
                      <div className="form-group">
                        <label>Tên vườn*</label>
                        <input type="text" name="ten_vuon" value={editData.ten_vuon || ''} onChange={handleEditChange} required />
                      </div>
                      <div className="form-group">
                        <label>Địa chỉ vùng trồng*</label>
                        <input type="text" name="dia_chi" value={editData.dia_chi || ''} onChange={handleEditChange} required />
                      </div>
                    </div>
                  </form>
                ) : (
                  <table className="detail-table">
                    <tbody>
                      <tr>
                        <th>Mã PUC</th>
                        <td>{selectedRecord.ma_puc}</td>
                      </tr>
                      <tr>
                        <th>Đại diện / Chủ vườn</th>
                        <td>{selectedRecord.ten || 'Chưa rõ'}</td>
                      </tr>
                      <tr>
                        <th>Tên vườn</th>
                        <td>{selectedRecord.ten_vuon || 'Chưa rõ'}</td>
                      </tr>
                      <tr>
                        <th>Địa chỉ</th>
                        <td>{selectedRecord.dia_chi || 'Chưa rõ'}</td>
                      </tr>
                    </tbody>
                  </table>
                )
              ) : activeTab === 'quan-ly-hop-dong' ? (
                isEditing ? (
                  <form onSubmit={handleEditSubmit}>
                    <div className="other-info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                      <div className="form-group">
                        <label>Số hợp đồng*</label>
                        <input type="text" name="so_hop_dong" value={editData.so_hop_dong || ''} disabled />
                      </div>
                      <div className="form-group">
                        <label>Tên đối tác hợp đồng*</label>
                        <input type="text" name="ten_doi_tac" value={editData.ten_doi_tac || ''} onChange={handleEditChange} required disabled={role !== 'admin'} />
                      </div>
                      <div className="form-group">
                        <label>Loại hợp đồng*</label>
                        <select name="loai_hop_dong" value={editData.loai_hop_dong || ''} onChange={handleEditChange} required disabled={role !== 'admin'}>
                          <option value="">-- Chọn loại --</option>
                          <option value="Hợp đồng thu mua">Hợp đồng thu mua</option>
                          <option value="Hợp đồng xuất khẩu">Hợp đồng xuất khẩu</option>
                          <option value="Hợp đồng nguyên tắc vận chuyển">Hợp đồng nguyên tắc vận chuyển</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Giá trị hợp đồng*</label>
                        <input type="text" name="gia_tri" value={editData.gia_tri || ''} onChange={handleEditChange} required disabled={role !== 'admin'} />
                      </div>
                      <div className="form-group">
                        <label>Ngày ký hợp đồng*</label>
                        <input type="date" name="ngay_ky" value={editData.ngay_ky || ''} onChange={handleEditChange} required disabled={role !== 'admin'} />
                      </div>
                      <div className="form-group">
                        <label>Trạng thái thực hiện*</label>
                        <select name="trang_thai" value={editData.trang_thai || ''} onChange={handleEditChange} required disabled={role !== 'admin'}>
                          <option value="Đang chuẩn bị">Đang chuẩn bị</option>
                          <option value="Đang thực hiện">Đang thực hiện</option>
                          <option value="Đang hiệu lực">Đang hiệu lực</option>
                          <option value="Đã hoàn thành">Đã hoàn thành</option>
                          <option value="Đã hủy">Đã hủy</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Theo dõi tiến độ giao hàng (FR15)</label>
                        <textarea name="tiens_do_giao_hang" value={editData.tiens_do_giao_hang || ''} onChange={handleEditChange} rows="3" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} disabled={role !== 'admin'}></textarea>
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Quản lý thanh toán hợp đồng (FR18)</label>
                        <textarea name="tinh_trang_thanh_toan" value={editData.tinh_trang_thanh_toan || ''} onChange={handleEditChange} rows="3" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} disabled={role !== 'admin'}></textarea>
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Xử lý vi phạm hợp đồng (FR16)</label>
                        <textarea name="vi_pham" value={editData.vi_pham || ''} onChange={handleEditChange} rows="3" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} disabled={role !== 'admin'}></textarea>
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Quản lý phụ lục hợp đồng (FR17)</label>
                        <textarea name="phu_luc" value={editData.phu_luc || ''} onChange={handleEditChange} rows="3" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} disabled={role !== 'admin'}></textarea>
                      </div>
                    </div>
                  </form>
                ) : (
                  <table className="detail-table">
                    <tbody>
                      <tr>
                        <th>Số hợp đồng</th>
                        <td>{selectedRecord.so_hop_dong}</td>
                      </tr>
                      <tr>
                        <th>Tên đối tác hợp đồng</th>
                        <td>{selectedRecord.ten_doi_tac}</td>
                      </tr>
                      <tr>
                        <th>Loại hợp đồng</th>
                        <td>{selectedRecord.loai_hop_dong}</td>
                      </tr>
                      <tr>
                        <th>Giá trị hợp đồng</th>
                        <td>{selectedRecord.gia_tri}</td>
                      </tr>
                      <tr>
                        <th>Ngày ký</th>
                        <td>{selectedRecord.ngay_ky}</td>
                      </tr>
                      <tr>
                        <th>Trạng thái</th>
                        <td>
                          <span className={`badge-class ${
                            selectedRecord.trang_thai === 'Đang thực hiện' || selectedRecord.trang_thai === 'Đang hiệu lực' ? 'success' : 
                            selectedRecord.trang_thai === 'Đang chuẩn bị' ? 'info' : 'warning'
                          }`}>{selectedRecord.trang_thai}</span>
                        </td>
                      </tr>
                      <tr>
                        <th>Tiến độ giao hàng (FR15)</th>
                        <td>{selectedRecord.tiens_do_giao_hang || <span className="empty-value">Chưa có thông tin tiến độ</span>}</td>
                      </tr>
                      <tr>
                        <th>Tình trạng thanh toán (FR18)</th>
                        <td>{selectedRecord.tinh_trang_thanh_toan || <span className="empty-value">Chưa có thông tin thanh toán</span>}</td>
                      </tr>
                      <tr>
                        <th>Vi phạm hợp đồng (FR16)</th>
                        <td>
                          {selectedRecord.vi_pham ? (
                            <span style={{ color: selectedRecord.vi_pham.includes('vi phạm') ? 'inherit' : '#ef4444', fontWeight: '500' }}>
                              {selectedRecord.vi_pham}
                            </span>
                          ) : (
                            <span className="empty-value">Chưa ghi nhận vi phạm</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Phụ lục hợp đồng (FR17)</th>
                        <td>{selectedRecord.phu_luc || <span className="empty-value">Không có phụ lục</span>}</td>
                      </tr>
                    </tbody>
                  </table>
                )
              ) : activeTab === 'lo-hang-loi' ? (
                isEditing ? (
                  <form onSubmit={handleEditSubmit}>
                    <div className="other-info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                      <div className="form-group">
                        <label>Mã lỗi*</label>
                        <input type="text" name="ma_loi" value={editData.ma_loi || ''} disabled />
                      </div>
                      <div className="form-group">
                        <label>Mã lô hàng gốc*</label>
                        <input type="text" name="id_lo_hang" value={editData.id_lo_hang || ''} disabled />
                      </div>
                      <div className="form-group">
                        <label>Mã vùng trồng (PUC)*</label>
                        <input type="text" name="ma_puc" value={editData.ma_puc || ''} disabled />
                      </div>
                      <div className="form-group">
                        <label>Loại lỗi*</label>
                        <select 
                          name="loai_loi" 
                          value={editData.loai_loi || ''} 
                          onChange={handleEditChange} 
                          required
                          disabled={role !== 'admin' && role !== 'technical'}
                        >
                          <option value="Tồn đọng dư lượng hóa chất">Tồn đọng dư lượng hóa chất</option>
                          <option value="Phát hiện sinh vật KDTV">Phát hiện sinh vật KDTV</option>
                          <option value="Lỗi tem nhãn / Bao bì">Lỗi tem nhãn / Bao bì</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Ngày phát hiện*</label>
                        <input type="date" name="ngay_phat_hien" value={editData.ngay_phat_hien || ''} onChange={handleEditChange} required disabled={role !== 'admin' && role !== 'technical'} />
                      </div>
                      <div className="form-group">
                        <label>Người phụ trách*</label>
                        <input type="text" name="nguoi_phu_trach" value={editData.nguoi_phu_trach || ''} onChange={handleEditChange} required disabled={role !== 'admin' && role !== 'technical'} />
                      </div>
                      <div className="form-group">
                        <label>Trạng thái xử lý*</label>
                        <select 
                          name="trang_thai" 
                          value={editData.trang_thai || ''} 
                          onChange={handleEditChange} 
                          required
                          disabled={role !== 'admin' && role !== 'technical'}
                        >
                          <option value="Đang xử lý">Đang xử lý</option>
                          <option value="Đã xử lý xong">Đã xử lý xong</option>
                          <option value="Đã hủy">Đã hủy</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Kết quả kiểm tra lại*</label>
                        <select 
                          name="ket_qua_kiem_tra_lai" 
                          value={editData.ket_qua_kiem_tra_lai || ''} 
                          onChange={handleEditChange} 
                          required
                          disabled={role !== 'admin' && role !== 'technical'}
                        >
                          <option value="Chưa kiểm tra lại">Chưa kiểm tra lại</option>
                          <option value="Đạt">Đạt</option>
                          <option value="Không đạt">Không đạt</option>
                        </select>
                      </div>
                    </div>
                  </form>
                ) : (
                  <table className="detail-table">
                    <tbody>
                      <tr>
                        <th>Mã lỗi</th>
                        <td>{selectedRecord.ma_loi}</td>
                      </tr>
                      <tr>
                        <th>Mã lô hàng gốc</th>
                        <td>{selectedRecord.id_lo_hang}</td>
                      </tr>
                      <tr>
                        <th>Mã vùng trồng (PUC)</th>
                        <td>{selectedRecord.ma_puc}</td>
                      </tr>
                      <tr>
                        <th>Loại lỗi kiểm dịch</th>
                        <td>
                          <span className="badge-class danger" style={{ padding: '4px 10px', fontSize: '12px' }}>
                            {selectedRecord.loai_loi}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th>Ngày phát hiện</th>
                        <td>{selectedRecord.ngay_phat_hien}</td>
                      </tr>
                      <tr>
                        <th>Người phụ trách xử lý</th>
                        <td>{selectedRecord.nguoi_phu_trach}</td>
                      </tr>
                      <tr>
                        <th>Trạng thái xử lý</th>
                        <td>
                          <span className={`badge-class ${selectedRecord.trang_thai === 'Đã xử lý xong' ? 'success' : 'warning'}`}>
                            {selectedRecord.trang_thai}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th>Kết quả kiểm tra lại</th>
                        <td>
                          <span className={`badge-class ${selectedRecord.ket_qua_kiem_tra_lai === 'Đạt' ? 'success' : selectedRecord.ket_qua_kiem_tra_lai === 'Không đạt' ? 'danger' : 'info'}`}>
                            {selectedRecord.ket_qua_kiem_tra_lai}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )
              ) : activeTab === 'nguoi-dung-khach-hang' ? (
                isEditing ? (
                  <form onSubmit={handleEditSubmit}>
                    <div className="other-info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                      <div className="form-group">
                        <label>Mã khách hàng*</label>
                        <input type="text" name="ma_kh" value={editData.ma_kh || ''} disabled />
                      </div>
                      <div className="form-group">
                        <label>Tên khách hàng / Doanh nghiệp*</label>
                        <input type="text" name="ten_kh" value={editData.ten_kh || ''} onChange={handleEditChange} required />
                      </div>
                      <div className="form-group">
                        <label>Địa chỉ</label>
                        <input type="text" name="dia_chi" value={editData.dia_chi || ''} onChange={handleEditChange} />
                      </div>
                      <div className="form-group">
                        <label>Quốc gia*</label>
                        <input type="text" name="quoc_gia" value={editData.quoc_gia || ''} onChange={handleEditChange} required />
                      </div>
                      <div className="form-group">
                        <label>Số điện thoại</label>
                        <input type="text" name="sdt" value={editData.sdt || ''} onChange={handleEditChange} />
                      </div>
                      <div className="form-group">
                        <label>Email liên hệ</label>
                        <input type="email" name="email" value={editData.email || ''} onChange={handleEditChange} />
                      </div>
                    </div>
                  </form>
                ) : (
                  <table className="detail-table">
                    <tbody>
                      <tr>
                        <th>Mã khách hàng</th>
                        <td>{selectedRecord.ma_kh}</td>
                      </tr>
                      <tr>
                        <th>Tên khách hàng / Doanh nghiệp</th>
                        <td>{selectedRecord.ten_kh}</td>
                      </tr>
                      <tr>
                        <th>Địa chỉ</th>
                        <td>{selectedRecord.dia_chi || 'Chưa rõ'}</td>
                      </tr>
                      <tr>
                        <th>Quốc gia</th>
                        <td>{selectedRecord.quoc_gia}</td>
                      </tr>
                      <tr>
                        <th>Số điện thoại</th>
                        <td>{selectedRecord.sdt || 'Chưa rõ'}</td>
                      </tr>
                      <tr>
                        <th>Email liên hệ</th>
                        <td>{selectedRecord.email || 'Chưa rõ'}</td>
                      </tr>
                    </tbody>
                  </table>
                )
              ) : (
                isEditing ? (
                  <div>
                    <form onSubmit={handleEditSubmit}>
                      <div className="other-info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                        <div className="form-group">
                          <label>Mã số vùng trồng (PUC)*</label>
                          <input 
                            type="text" 
                            name="ma_puc" 
                            value={editData.ma_puc || ''} 
                            onChange={handleEditChange} 
                            required 
                            disabled={role !== 'admin' && role !== 'production'}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Tên vườn trồng*</label>
                          <input 
                            type="text" 
                            name="ten_vuon" 
                            value={editData.ten_vuon || ''} 
                            onChange={handleEditChange} 
                            required 
                            disabled={role !== 'admin'}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Địa chỉ vườn*</label>
                          <input 
                            type="text" 
                            name="dia_chi_vuon" 
                            value={editData.dia_chi_vuon || ''} 
                            onChange={handleEditChange} 
                            required 
                            disabled={role !== 'admin' && role !== 'production'}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Ngày thu hoạch*</label>
                          <input 
                            type="date" 
                            name="ngay_thu_hoach" 
                            value={editData.ngay_thu_hoach || ''} 
                            onChange={handleEditChange} 
                            required 
                            disabled={role !== 'admin' && role !== 'technical'}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Lần phun thuốc gần nhất</label>
                          <input 
                            type="date" 
                            name="lan_phun_thuoc_gan_nhat" 
                            value={editData.lan_phun_thuoc_gan_nhat || ''} 
                            onChange={handleEditChange} 
                            disabled={role !== 'admin' && role !== 'technical'}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Cách ly (Có/Không)</label>
                          <select 
                            name="cach_ly" 
                            value={editData.cach_ly || ''} 
                            onChange={handleEditChange}
                            disabled={role !== 'admin' && role !== 'technical'}
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
                            value={editData.loai || ''} 
                            onChange={handleEditChange}
                            disabled={role !== 'admin' && role !== 'technical'}
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
                            value={editData.khoi_luong_lo_hang !== null && editData.khoi_luong_lo_hang !== undefined ? editData.khoi_luong_lo_hang : ''} 
                            onChange={handleEditChange} 
                            placeholder="VD: 12.5" 
                            disabled={role !== 'admin' && role !== 'production'}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Khối lượng đóng gói (tấn)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            name="khoi_luong_dong_goi" 
                            value={editData.khoi_luong_dong_goi !== null && editData.khoi_luong_dong_goi !== undefined ? editData.khoi_luong_dong_goi : ''} 
                            onChange={handleEditChange} 
                            placeholder="VD: 11.8" 
                            disabled={role !== 'admin' && role !== 'technical'}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Nơi xuất khẩu</label>
                          <input 
                            type="text" 
                            name="noi_xuat_khau" 
                            value={editData.noi_xuat_khau || ''} 
                            onChange={handleEditChange} 
                            placeholder="VD: Trung Quốc, Hoa Kỳ" 
                            disabled={role !== 'admin' && role !== 'technical'}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Tên cơ sở đóng gói</label>
                          <input 
                            type="text" 
                            name="ten_co_so_dong_goi" 
                            value={editData.ten_co_so_dong_goi || ''} 
                            onChange={handleEditChange} 
                            placeholder="VD: Cơ sở đóng gói Thanh Bình" 
                            disabled={role !== 'admin' && role !== 'technical'}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Mã số cơ sở đóng gói (PHC)</label>
                          <input 
                            type="text" 
                            name="ma_phc" 
                            value={editData.ma_phc || ''} 
                            onChange={handleEditChange} 
                            placeholder="VD: VN-PHC-0002" 
                            disabled={role !== 'admin' && role !== 'technical'}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Kết quả kiểm dịch</label>
                          <select 
                            name="ket_qua_kiem_dich" 
                            value={editData.ket_qua_kiem_dich || ''} 
                            onChange={handleEditChange}
                            disabled={role !== 'admin' && role !== 'qaqc'}
                          >
                            <option value="">Chưa có kết quả</option>
                            <option value="Đạt">Đạt</option>
                            <option value="Không đạt">Không đạt</option>
                          </select>
                        </div>
                      </div>
                    </form>
                    {activeTab.startsWith('lo-hang-') && (
                      <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '10px' }}>
                        <GS1QRCode shipment={editData} />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {(() => {
                      const step = getShipmentStep(selectedRecord);
                      return (
                        <div className="shipment-progress-stepper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', padding: '16px', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step.index >= 0 ? '#4f46e5' : '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>1</div>
                            <span style={{ fontSize: '12px', marginTop: '6px', fontWeight: '600', color: step.index >= 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>Tiếp nhận</span>
                          </div>
                          <div style={{ flex: 1, height: '2px', backgroundColor: step.index >= 1 ? '#4f46e5' : '#e2e8f0', marginTop: '-18px', zIndex: 1 }}></div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step.index >= 1 ? '#4f46e5' : '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>2</div>
                            <span style={{ fontSize: '12px', marginTop: '6px', fontWeight: '600', color: step.index >= 1 ? 'var(--text-main)' : 'var(--text-muted)' }}>Đang xử lý</span>
                          </div>
                          <div style={{ flex: 1, height: '2px', backgroundColor: step.index >= 2 ? (step.color === 'danger' ? '#ef4444' : '#10b981') : '#e2e8f0', marginTop: '-18px', zIndex: 1 }}></div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step.index >= 2 ? (step.color === 'danger' ? '#ef4444' : '#10b981') : '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>3</div>
                            <span style={{ fontSize: '12px', marginTop: '6px', fontWeight: '600', color: step.index >= 2 ? (step.color === 'danger' ? '#ef4444' : '#10b981') : 'var(--text-muted)' }}>{step.label}</span>
                          </div>
                        </div>
                      );
                    })()}
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
                    {activeTab.startsWith('lo-hang-') && activeTab !== 'lo-hang-loi' && (
                      <GS1QRCode shipment={selectedRecord} />
                    )}
                  </>
                )
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
                  {((activeTab === 'quan-ly-hop-dong' && role === 'admin') || 
                    (activeTab === 'lo-hang-loi' && (role === 'admin' || role === 'technical')) ||
                    (activeTab !== 'quan-ly-hop-dong' && activeTab !== 'lo-hang-loi')) && (
                    <button className="btn-primary" onClick={handleEditClick} style={{ marginRight: '12px' }}>Chỉnh sửa</button>
                  )}
                  <button className="btn-secondary" onClick={handleCloseModal}>Đóng</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo mới lô hàng */}
      {isCreatingShipment && (
        <div className="modal-backdrop" onClick={() => setIsCreatingShipment(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h3>Tạo mới lô hàng truy xuất</h3>
              <button className="close-btn" onClick={() => setIsCreatingShipment(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <div className="info-banner" style={{ marginBottom: '20px', backgroundColor: 'var(--primary-light)', borderColor: 'var(--border-color)', color: 'var(--primary)' }}>
                Nhập thông tin chi tiết của lô hàng. Lô hàng sẽ tự động phân loại vào các giai đoạn (Tiếp nhận, Đang xử lý, Bảo quản) dựa trên các thông tin được điền.
              </div>
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

      {/* Modal chi tiết kho & danh sách phiếu nhập kho */}
      {selectedWarehouse && (
        <div className="modal-backdrop" onClick={() => setSelectedWarehouse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <h3>{isEditingWarehouse ? `Cập nhật tình trạng kho: ${selectedWarehouse.ma_kho}` : `Chi tiết kho bảo quản: ${selectedWarehouse.ma_kho}`}</h3>
              <button className="close-btn" onClick={() => setSelectedWarehouse(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              {isEditingWarehouse ? (
                <form onSubmit={handleWarehouseEditSubmit}>
                  <div className="other-info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                    <div className="form-group">
                      <label>Mã kho</label>
                      <input type="text" value={warehouseEditData.ma_kho} disabled />
                    </div>
                    <div className="form-group">
                      <label>Tên kho</label>
                      <input type="text" value={warehouseEditData.ten_kho} disabled />
                    </div>
                    {(role === 'qaqc' || role === 'admin') && (
                      <>
                        <div className="form-group">
                          <label>Tình trạng vệ sinh (Đạt / Không đạt)*</label>
                          <select 
                            name="tinh_trang_ve_sinh" 
                            value={warehouseEditData.tinh_trang_ve_sinh || ''} 
                            onChange={handleWarehouseEditChange}
                            required
                          >
                            <option value="">-- Chọn tình trạng --</option>
                            <option value="Đạt">Đạt</option>
                            <option value="Không đạt">Không đạt</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Nhiệt độ hiện tại (°C)*</label>
                          <input 
                            type="number" 
                            name="nhiet_do" 
                            value={warehouseEditData.nhiet_do || ''} 
                            onChange={handleWarehouseEditChange} 
                            required 
                          />
                        </div>
                      </>
                    )}
                    {(role === 'logistics' || role === 'admin') && (
                      <div className="form-group">
                        <label>Sức chứa còn trống (tấn)*</label>
                        <input 
                          type="number" 
                          step="0.01"
                          name="suc_chua_con_trong" 
                          value={warehouseEditData.suc_chua_con_trong || ''} 
                          onChange={handleWarehouseEditChange} 
                          required 
                        />
                      </div>
                    )}
                  </div>
                </form>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '16px', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loại kho</span>
                      <h4 style={{ margin: '4px 0 0 0', fontSize: '16px', color: 'var(--text-main)' }}>
                        {selectedWarehouse.loai_kho === 'Đông' ? 'Kho đông lạnh' : 'Kho bảo mát'}
                      </h4>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sức chứa (Còn trống / Tối đa)</span>
                      <h4 style={{ margin: '4px 0 0 0', fontSize: '16px', color: 'var(--text-main)' }}>
                        {selectedWarehouse.suc_chua_con_trong} / {selectedWarehouse.suc_chua_lon_nhat} tấn
                      </h4>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vệ sinh & Nhiệt độ</span>
                      <h4 style={{ margin: '4px 0 0 0', fontSize: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge-class ${selectedWarehouse.tinh_trang_ve_sinh === 'Đạt' ? 'success' : 'danger'}`}>
                          Vệ sinh: {selectedWarehouse.tinh_trang_ve_sinh}
                        </span>
                        {selectedWarehouse.nhiet_do !== undefined && (
                          <span style={{ fontSize: '13px', fontWeight: 'normal' }}>
                            ({selectedWarehouse.nhiet_do}°C)
                          </span>
                        )}
                      </h4>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Danh sách phiếu nhập kho</h4>
                      {(role === 'admin' || role === 'technical') && (
                        <button className="btn-primary" onClick={handleCreateReceiptClick} style={{ padding: '6px 12px', fontSize: '13px' }}>
                          + Tạo phiếu nhập kho
                        </button>
                      )}
                    </div>
                    
                    <div style={{ overflowX: 'auto', maxHeight: '250px' }}>
                      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-body)' }}>
                            <th style={{ padding: '10px' }}>Mã phiếu</th>
                            <th style={{ padding: '10px' }}>Mã lô hàng</th>
                            <th style={{ padding: '10px' }}>Loại kho</th>
                            <th style={{ padding: '10px' }}>Khối lượng (tấn)</th>
                            <th style={{ padding: '10px' }}>Ngày nhập</th>
                            <th style={{ padding: '10px' }}>Vị trí lưu trữ</th>
                            <th style={{ padding: '10px', width: '80px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {warehouseReceipts.map((receipt) => (
                            <tr key={receipt.ma_phieu} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '10px' }}>{receipt.ma_phieu}</td>
                              <td style={{ padding: '10px' }}>{receipt.id_lo_hang}</td>
                              <td style={{ padding: '10px' }}>
                                {receipt.loai_kho_lo_hang === 'Đông' ? 'Kho đông lạnh' : 'Kho bảo mát'}
                              </td>
                              <td style={{ padding: '10px' }}>
                                {editingReceiptId === receipt.ma_phieu ? (
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    name="khoi_luong" 
                                    value={receiptEditData.khoi_luong} 
                                    onChange={handleReceiptEditChange} 
                                    style={{ width: '80px', padding: '4px' }}
                                  />
                                ) : (
                                  `${receipt.khoi_luong} tấn`
                                )}
                              </td>
                              <td style={{ padding: '10px' }}>
                                {editingReceiptId === receipt.ma_phieu ? (
                                  <input 
                                    type="date" 
                                    name="ngay_nhap" 
                                    value={receiptEditData.ngay_nhap} 
                                    onChange={handleReceiptEditChange} 
                                    style={{ padding: '4px' }}
                                  />
                                ) : (
                                  receipt.ngay_nhap
                                )}
                              </td>
                              <td style={{ padding: '10px' }}>
                                {editingReceiptId === receipt.ma_phieu ? (
                                  <input 
                                    type="text" 
                                    name="vi_tri_luu_tru" 
                                    value={receiptEditData.vi_tri_luu_tru} 
                                    onChange={handleReceiptEditChange} 
                                    style={{ width: '100px', padding: '4px' }}
                                  />
                                ) : (
                                  receipt.vi_tri_luu_tru || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa rõ</span>
                                )}
                              </td>
                              <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                                {editingReceiptId === receipt.ma_phieu ? (
                                  <>
                                    <button 
                                      className="btn-primary" 
                                      onClick={handleReceiptEditSubmit}
                                      style={{ padding: '2px 6px', fontSize: '11px' }}
                                    >
                                      Lưu
                                    </button>
                                    <button 
                                      className="btn-secondary" 
                                      onClick={() => setEditingReceiptId(null)}
                                      style={{ padding: '2px 6px', fontSize: '11px' }}
                                    >
                                      Hủy
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {(role === 'admin' || role === 'technical') && (
                                      <button 
                                        className="icon-btn" 
                                        title="Chỉnh sửa phiếu" 
                                        onClick={() => handleEditReceiptClick(receipt)}
                                        style={{ padding: '4px' }}
                                      >
                                        ✏️
                                      </button>
                                    )}
                                    {role === 'admin' && (
                                      <button 
                                        className="icon-btn" 
                                        title="Xóa phiếu" 
                                        onClick={() => handleDeleteReceipt(receipt.ma_phieu)}
                                        style={{ padding: '4px' }}
                                      >
                                        🗑️
                                      </button>
                                    )}
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                          {warehouseReceipts.length === 0 && (
                            <tr>
                              <td colSpan="7" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                                Chưa có phiếu nhập kho nào
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              {isEditingWarehouse ? (
                <>
                  <button className="btn-secondary" onClick={() => setIsEditingWarehouse(false)} style={{ marginRight: '12px' }}>Hủy</button>
                  <button className="btn-primary" onClick={handleWarehouseEditSubmit}>Lưu thay đổi</button>
                </>
              ) : (
                <>
                  {(role === 'admin' || role === 'qaqc' || role === 'technical' || role === 'logistics') && (
                    <button className="btn-primary" onClick={() => {
                      setWarehouseEditData({ ...selectedWarehouse });
                      setIsEditingWarehouse(true);
                    }} style={{ marginRight: '12px' }}>
                      Cập nhật tình trạng kho
                    </button>
                  )}
                  <button className="btn-secondary" onClick={() => setSelectedWarehouse(null)}>Đóng</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo phiếu nhập kho mới */}
      {isCreatingReceipt && (
        <div className="modal-backdrop" onClick={() => setIsCreatingReceipt(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Tạo phiếu nhập kho</h3>
              <button className="close-btn" onClick={() => setIsCreatingReceipt(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <form onSubmit={handleReceiptSubmit}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Mã phiếu nhập kho*</label>
                  <input type="text" name="ma_phieu" value={newReceipt.ma_phieu} onChange={handleReceiptChange} required />
                </div>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Lô hàng đã kiểm dịch đạt*</label>
                  <select name="id_lo_hang" value={newReceipt.id_lo_hang} onChange={handleReceiptChange} required>
                    <option value="">-- Chọn lô hàng --</option>
                    {traceabilityList
                      .filter(t => t.ket_qua_kiem_dich === 'Đạt')
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          {t.id} ({t.ten_vuon || 'Vườn không tên'} - {t.khoi_luong_dong_goi || t.khoi_luong_lo_hang || 0} tấn)
                        </option>
                      ))
                    }
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Khối lượng nhập kho (tấn)*</label>
                  <input type="number" step="0.01" name="khoi_luong" value={newReceipt.khoi_luong} onChange={handleReceiptChange} required />
                </div>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Ngày nhập kho*</label>
                  <input type="date" name="ngay_nhap" value={newReceipt.ngay_nhap} onChange={handleReceiptChange} required />
                </div>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Vị trí lưu trữ trong kho</label>
                  <input type="text" name="vi_tri_luu_tru" value={newReceipt.vi_tri_luu_tru} onChange={handleReceiptChange} placeholder="VD: Khu A, Kệ 2" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreatingReceipt(false)} style={{ marginRight: '12px' }}>Hủy</button>
              <button className="btn-primary" onClick={handleReceiptSubmit}>Tạo phiếu</button>
            </div>
          </div>
        </div>
      )}
      {isCreatingVungTrong && (
        <div className="modal-backdrop" onClick={() => setIsCreatingVungTrong(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Tạo mới vùng trồng nguyên liệu</h3>
              <button className="close-btn" onClick={() => setIsCreatingVungTrong(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <form onSubmit={handleVungTrongSubmit}>
                <div className="other-info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                  <div className="form-group">
                    <label>Mã số vùng trồng (PUC)*</label>
                    <input 
                      type="text" 
                      name="ma_puc" 
                      value={newVungTrong.ma_puc} 
                      onChange={(e) => setNewVungTrong(prev => ({ ...prev, ma_puc: e.target.value }))} 
                      placeholder="VD: TG-PUC-0001" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Đại diện / Chủ vườn*</label>
                    <input 
                      type="text" 
                      name="ten" 
                      value={newVungTrong.ten} 
                      onChange={(e) => setNewVungTrong(prev => ({ ...prev, ten: e.target.value }))} 
                      placeholder="VD: Nguyễn Văn A" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên vườn*</label>
                    <input 
                      type="text" 
                      name="ten_vuon" 
                      value={newVungTrong.ten_vuon} 
                      onChange={(e) => setNewVungTrong(prev => ({ ...prev, ten_vuon: e.target.value }))} 
                      placeholder="VD: Vườn Long Hải" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ vùng trồng*</label>
                    <input 
                      type="text" 
                      name="dia_chi" 
                      value={newVungTrong.dia_chi} 
                      onChange={(e) => setNewVungTrong(prev => ({ ...prev, dia_chi: e.target.value }))} 
                      placeholder="VD: Cai Lậy, Tiền Giang" 
                      required 
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreatingVungTrong(false)} style={{ marginRight: '12px' }}>Hủy</button>
              <button className="btn-primary" onClick={handleVungTrongSubmit}>Tạo mới</button>
            </div>
          </div>
        </div>
      )}

      {isCreatingCustomer && (
        <div className="modal-backdrop" onClick={() => setIsCreatingCustomer(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>Tạo mới khách hàng / Doanh nghiệp</h3>
              <button className="close-btn" onClick={() => setIsCreatingCustomer(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <form onSubmit={handleCustomerSubmit}>
                <div className="other-info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                  <div className="form-group">
                    <label>Mã khách hàng*</label>
                    <input 
                      type="text" 
                      name="ma_kh" 
                      value={newCustomer.ma_kh} 
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, ma_kh: e.target.value }))} 
                      placeholder="VD: KH001" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên khách hàng / Doanh nghiệp*</label>
                    <input 
                      type="text" 
                      name="ten_kh" 
                      value={newCustomer.ten_kh} 
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, ten_kh: e.target.value }))} 
                      placeholder="VD: Công ty TNHH Trái Cây Việt" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ</label>
                    <input 
                      type="text" 
                      name="dia_chi" 
                      value={newCustomer.dia_chi} 
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, dia_chi: e.target.value }))} 
                      placeholder="VD: Quận 1, TP. Hồ Chí Minh" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Quốc gia*</label>
                    <input 
                      type="text" 
                      name="quoc_gia" 
                      value={newCustomer.quoc_gia} 
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, quoc_gia: e.target.value }))} 
                      placeholder="VD: Việt Nam" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input 
                      type="text" 
                      name="sdt" 
                      value={newCustomer.sdt} 
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, sdt: e.target.value }))} 
                      placeholder="VD: 0987654321" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email liên hệ</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={newCustomer.email} 
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))} 
                      placeholder="VD: contact@traicayviet.vn" 
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreatingCustomer(false)} style={{ marginRight: '12px' }}>Hủy</button>
              <button className="btn-primary" onClick={handleCustomerSubmit}>Tạo mới</button>
            </div>
          </div>
        </div>
      )}

      {isCreatingContract && (
        <div className="modal-backdrop" onClick={() => setIsCreatingContract(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>Tạo mới hợp đồng mua bán</h3>
              <button className="close-btn" onClick={() => setIsCreatingContract(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <form onSubmit={handleContractSubmit}>
                <div className="other-info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                  <div className="form-group">
                    <label>Số hợp đồng*</label>
                    <input 
                      type="text" 
                      name="so_hop_dong" 
                      value={newContract.so_hop_dong} 
                      onChange={(e) => setNewContract(prev => ({ ...prev, so_hop_dong: e.target.value }))} 
                      placeholder="VD: HD-2026-005" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên đối tác hợp đồng*</label>
                    <input 
                      type="text" 
                      name="ten_doi_tac" 
                      value={newContract.ten_doi_tac} 
                      onChange={(e) => setNewContract(prev => ({ ...prev, ten_doi_tac: e.target.value }))} 
                      placeholder="VD: HTX Bình Minh" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Loại hợp đồng*</label>
                    <select 
                      name="loai_hop_dong" 
                      value={newContract.loai_hop_dong} 
                      onChange={(e) => setNewContract(prev => ({ ...prev, loai_hop_dong: e.target.value }))} 
                      required
                    >
                      <option value="">-- Chọn loại --</option>
                      <option value="Hợp đồng thu mua">Hợp đồng thu mua</option>
                      <option value="Hợp đồng xuất khẩu">Hợp đồng xuất khẩu</option>
                      <option value="Hợp đồng nguyên tắc vận chuyển">Hợp đồng nguyên tắc vận chuyển</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Giá trị hợp đồng*</label>
                    <input 
                      type="text" 
                      name="gia_tri" 
                      value={newContract.gia_tri} 
                      onChange={(e) => setNewContract(prev => ({ ...prev, gia_tri: e.target.value }))} 
                      placeholder="VD: 500,000,000đ" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày ký*</label>
                    <input 
                      type="date" 
                      name="ngay_ky" 
                      value={newContract.ngay_ky} 
                      onChange={(e) => setNewContract(prev => ({ ...prev, ngay_ky: e.target.value }))} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái*</label>
                    <select 
                      name="trang_thai" 
                      value={newContract.trang_thai} 
                      onChange={(e) => setNewContract(prev => ({ ...prev, trang_thai: e.target.value }))} 
                      required
                    >
                      <option value="Đang chuẩn bị">Đang chuẩn bị</option>
                      <option value="Đang thực hiện">Đang thực hiện</option>
                      <option value="Đang hiệu lực">Đang hiệu lực</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Khách hàng liên kết (Mã KH)</label>
                    <select 
                      name="ma_kh" 
                      value={newContract.ma_kh} 
                      onChange={(e) => setNewContract(prev => ({ ...prev, ma_kh: e.target.value }))}
                    >
                      <option value="">-- Chọn khách hàng (tùy chọn) --</option>
                      {(customersList || []).map(kh => (
                        <option key={kh.ma_kh} value={kh.ma_kh}>
                          {kh.ma_kh} - {kh.ten_kh} ({kh.quoc_gia})
                        </option>
                      ))}
                    </select>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Liên kết hợp đồng với khách hàng trong hệ thống qua mã KH</small>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreatingContract(false)} style={{ marginRight: '12px' }}>Hủy</button>
              <button className="btn-primary" onClick={handleContractSubmit}>Tạo mới</button>
            </div>
          </div>
        </div>
      )}
      {isCreatingFaulty && (
        <div className="modal-backdrop" onClick={() => setIsCreatingFaulty(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>Tạo mã lô hàng lỗi</h3>
              <button className="close-btn" onClick={() => setIsCreatingFaulty(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <form onSubmit={handleFaultySubmit}>
                <div className="other-info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                  <div className="form-group">
                    <label>Mã lỗi*</label>
                    <input 
                      type="text" 
                      name="ma_loi" 
                      value={newFaulty.ma_loi} 
                      onChange={(e) => setNewFaulty(prev => ({ ...prev, ma_loi: e.target.value }))} 
                      placeholder="VD: LHL-101" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Lô hàng bị phát hiện lỗi*</label>
                    <select 
                      name="id_lo_hang" 
                      value={newFaulty.id_lo_hang} 
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const matchingShipment = traceabilityList.find(t => t.id === selectedId);
                        setNewFaulty(prev => ({
                          ...prev,
                          id_lo_hang: selectedId,
                          ma_puc: matchingShipment ? matchingShipment.ma_puc : ''
                        }));
                      }} 
                      required
                    >
                      <option value="">-- Chọn lô hàng --</option>
                      {traceabilityList
                        .filter(t => t.ket_qua_kiem_dich === 'Không đạt')
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            {t.id} ({t.ten_vuon || 'Vườn không tên'} - PUC: {t.ma_puc})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Mã vùng trồng (PUC)*</label>
                    <input 
                      type="text" 
                      name="ma_puc" 
                      value={newFaulty.ma_puc} 
                      disabled 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Loại lỗi*</label>
                    <select 
                      name="loai_loi" 
                      value={newFaulty.loai_loi} 
                      onChange={(e) => setNewFaulty(prev => ({ ...prev, loai_loi: e.target.value }))} 
                      required
                    >
                      <option value="">-- Chọn loại lỗi --</option>
                      <option value="Tồn đọng dư lượng hóa chất">Tồn đọng dư lượng hóa chất</option>
                      <option value="Phát hiện sinh vật KDTV">Phát hiện sinh vật KDTV</option>
                      <option value="Lỗi tem nhãn / Bao bì">Lỗi tem nhãn / Bao bì</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ngày phát hiện*</label>
                    <input 
                      type="date" 
                      name="ngay_phat_hien" 
                      value={newFaulty.ngay_phat_hien} 
                      onChange={(e) => setNewFaulty(prev => ({ ...prev, ngay_phat_hien: e.target.value }))} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Người phụ trách xử lý*</label>
                    <input 
                      type="text" 
                      name="nguoi_phu_trach" 
                      value={newFaulty.nguoi_phu_trach} 
                      onChange={(e) => setNewFaulty(prev => ({ ...prev, nguoi_phu_trach: e.target.value }))} 
                      placeholder="VD: Nguyễn Văn A"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái xử lý*</label>
                    <select 
                      name="trang_thai" 
                      value={newFaulty.trang_thai} 
                      onChange={(e) => setNewFaulty(prev => ({ ...prev, trang_thai: e.target.value }))} 
                      required
                    >
                      <option value="Đang xử lý">Đang xử lý</option>
                      <option value="Đã xử lý xong">Đã xử lý xong</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Kết quả kiểm tra lại*</label>
                    <select 
                      name="ket_qua_kiem_tra_lai" 
                      value={newFaulty.ket_qua_kiem_tra_lai} 
                      onChange={(e) => setNewFaulty(prev => ({ ...prev, ket_qua_kiem_tra_lai: e.target.value }))} 
                      required
                    >
                      <option value="Chưa kiểm tra lại">Chưa kiểm tra lại</option>
                      <option value="Đạt">Đạt</option>
                      <option value="Không đạt">Không đạt</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreatingFaulty(false)} style={{ marginRight: '12px' }}>Hủy</button>
              <button className="btn-primary" onClick={handleFaultySubmit}>Tạo mới</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericListView;
