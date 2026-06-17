import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './DepartmentTable.css'; // Reuse existing table styles
import './EmployeeForm.css'; // Reuse form styles
import { customerData } from '../utils/traceabilityData';
import GS1QRCode from './GS1QRCode';

const API_BASE_URL = 'http://localhost:5000/api';

const GenericListView = ({ activeTab, traceabilityList = [], setTraceabilityList }) => {
  const [searchTerm, setSearchTerm] = useState('');

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
        const filtered = traceabilityList.filter(item => 
          item.ket_qua_kiem_dich === 'Không đạt'
        );
        return {
          title: 'Lô hàng lỗi kiểm dịch',
          headers: ['Mã lô', 'Mã vùng trồng (PUC)', 'Địa chỉ vườn', 'Tên vườn', 'Ngày thu hoạch', 'Phun thuốc gần nhất', 'Cách ly', 'Loại', 'Khối lượng lô (tấn)', 'Khối lượng đóng gói (tấn)', 'Kết quả kiểm dịch'],
          rows: filtered.map(item => ({
            displayValues: [
              item.id,
              item.ma_puc,
              item.dia_chi_vuon,
              item.ten_vuon,
              item.ngay_thu_hoach,
              item.lan_phun_thuoc_gan_nhat || 'Chưa rõ',
              item.cach_ly || 'Chưa rõ',
              item.loai || 'Chưa rõ',
              item.khoi_luong_lo_hang !== null && item.khoi_luong_lo_hang !== '' ? item.khoi_luong_lo_hang : 'Chưa rõ',
              item.khoi_luong_dong_goi !== null && item.khoi_luong_dong_goi !== '' ? item.khoi_luong_dong_goi : 'Chưa rõ',
              item.ket_qua_kiem_dich
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
        const rows = (customerData || []).map(item => [
          item.ma_kh,
          item.ten_kh,
          item.quoc_gia,
          `contact@${item.ten_kh.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'customer'}.com`,
          'Chưa rõ',
          '0 hợp đồng'
        ]);
        return {
          title: 'Danh sách khách hàng',
          headers: ['Mã KH', 'Tên khách hàng / Doanh nghiệp', 'Quốc gia', 'Email liên hệ', 'Số điện thoại', 'Hợp đồng active'],
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
      case 'quan-ly-hop-dong':
        return {
          title: 'Quản lý hợp đồng',
          headers: ['Số hợp đồng', 'Tên đối tác hợp đồng', 'Loại hợp đồng', 'Giá trị hợp đồng', 'Ngày ký', 'Trạng thái'],
          rows: [
            ['HD-2026-001', 'Global Fruit Import Co.', 'Hợp đồng xuất khẩu', '1,250,000,000đ', '01/05/2026', 'Đang thực hiện'],
            ['HD-2026-002', 'HTX Nông nghiệp Cái Bè', 'Hợp đồng thu mua', '850,000,000đ', '10/05/2026', 'Đang thực hiện'],
            ['HD-2026-003', 'Tokyo Fresh Agro', 'Hợp đồng xuất khẩu', '2,100,000,000đ', '25/05/2026', 'Đang chuẩn bị'],
            ['HD-2026-004', 'Vận tải biển Nam Triệu', 'Hợp đồng nguyên tắc vận chuyển', 'Theo bảng giá năm 2026', '01/01/2026', 'Đang hiệu lực']
          ],
          badgeColor: 'primary'
        };
      case 'quan-ly-vung-trong':
        return {
          title: 'Quản lý vùng trồng nguyên liệu',
          headers: ['Mã vùng', 'Địa điểm vùng trồng', 'Diện tích (ha)', 'Sản phẩm chủ lực', 'Tiêu chuẩn chất lượng', 'Liên hệ đại diện'],
          rows: [
            ['VT-TIENGIANG-01', 'Cái Bè, Tiền Giang', '25 ha', 'Sầu riêng Ri6, Monthong', 'VietGAP (Số hiệu: VG-10022)', 'Ông Nguyễn Văn Hữu'],
            ['VT-DONGTHAP-02', 'Cao Lãnh, Đồng Tháp', '18 ha', 'Xoài cát Hòa Lộc', 'GlobalGAP (Số hiệu: GG-99221)', 'Ông Phạm Minh Đức'],
            ['VT-BENCO-03', 'Chợ Lách, Bến Tre', '12 ha', 'Măng cụt, Bưởi da xanh', 'VietGAP (Số hiệu: VG-10055)', 'Bà Lâm Thị Thu']
          ],
          badgeColor: 'success'
        };
      case 'quan-ly-kho':
        return {
          title: 'Quản lý kho hàng',
          headers: ['Mã kho', 'Tên kho hàng', 'Địa chỉ', 'Sức chứa lớn nhất', 'Sức chứa hiện tại', 'Loại kho'],
          rows: [
            ['KHO-01', 'Kho lạnh trung tâm Cái Bè', 'QL1A, Mỹ Đức Đông, Cái Bè, Tiền Giang', '500 tấn', '220 tấn (44%)', 'Kho đông lạnh & bảo mát'],
            ['KHO-02', 'Kho trung chuyển Cát Lái', 'KCN Cát Lái, Quận 2, TP.HCM', '200 tấn', '50 tấn (25%)', 'Kho mát lưu hàng xuất khẩu'],
            ['KHO-03', 'Kho bao bì vật tư', 'Nhà máy Nam Đô Cao Lãnh, Đồng Tháp', '100,000 thùng', '35,000 thùng (35%)', 'Kho khô vật liệu đóng gói']
          ],
          badgeColor: 'primary'
        };
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

  const handleCreateClick = () => {
    if (activeTab.startsWith('lo-hang-')) {
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
        // Fallback local update
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
      const allPageIds = filteredRows.map(row => row.original ? row.original.id : null).filter(Boolean);
      setSelectedIds(allPageIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteRow = (id) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lô hàng ${id}?`)) {
      if (setTraceabilityList) {
        setTraceabilityList(prev => prev.filter(item => item.id !== id));
      }
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} lô hàng đã chọn?`)) {
      if (setTraceabilityList) {
        setTraceabilityList(prev => prev.filter(item => !selectedIds.includes(item.id)));
      }
      setSelectedIds([]);
    }
  };

  const handleRowDoubleClick = (record) => {
    setSelectedRecord(record);
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
          <button className="btn-primary" onClick={handleCreateClick}>+ Tạo mới</button>
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
                        checked={selectedIds.includes(originalObj.id)}
                        onChange={() => handleSelectRow(originalObj.id)}
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
              <h3>{isEditing ? `Chỉnh sửa lô hàng: ${selectedRecord.id}` : `Chi tiết lô hàng: ${selectedRecord.id}`}</h3>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body" style={isEditing ? { padding: '20px 24px' } : {}}>
              {isEditing ? (
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
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Lần phun thuốc gần nhất</label>
                        <input 
                          type="date" 
                          name="lan_phun_thuoc_gan_nhat" 
                          value={editData.lan_phun_thuoc_gan_nhat || ''} 
                          onChange={handleEditChange} 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Cách ly (Có/Không)</label>
                        <select 
                          name="cach_ly" 
                          value={editData.cach_ly || ''} 
                          onChange={handleEditChange}
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
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Kết quả kiểm dịch</label>
                        <select 
                          name="ket_qua_kiem_dich" 
                          value={editData.ket_qua_kiem_dich || ''} 
                          onChange={handleEditChange}
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
                  {activeTab.startsWith('lo-hang-') && (
                    <GS1QRCode shipment={selectedRecord} />
                  )}
                </>
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
                  <button className="btn-primary" onClick={handleEditClick} style={{ marginRight: '12px' }}>Chỉnh sửa</button>
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
    </div>
  );
};

export default GenericListView;
