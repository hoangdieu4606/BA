const { pool } = require('./config/db');
const fs = require('fs');
const path = require('path');

const customers = [
  { ma_kh: "KH001", ten_kh: "Guangzhou Fruit Import & Export Co., Ltd.", quoc_gia: "Trung Quốc", dia_chi: "No. 88, Fruit Market St, Guangzhou", sdt: "+86-20-12345678", email: "contact@guangzhoufruit.com" },
  { ma_kh: "KH002", ten_kh: "Shenzhen Fresh Trade Co.", quoc_gia: "Trung Quốc", dia_chi: "Room 402, Fresh Building, Futian Dist, Shenzhen", sdt: "+86-755-87654321", email: "info@szfresh.cn" },
  { ma_kh: "KH003", ten_kh: "Shanghai Xinlian Import Co.", quoc_gia: "Trung Quốc", dia_chi: "Floor 12, Xinlian Tower, Pudong, Shanghai", sdt: "+86-21-99887766", email: "trade@xinlian-sh.com" },
  { ma_kh: "KH004", ten_kh: "Tokyo Fresh Fruits Co., Ltd.", quoc_gia: "Nhật Bản", dia_chi: "5-10 Tsukiji, Chuo-ku, Tokyo", sdt: "+81-3-3541-1111", email: "orders@tokyofresh.co.jp" },
  { ma_kh: "KH005", ten_kh: "Seoul Mart Corporation", quoc_gia: "Hàn Quốc", dia_chi: "123 Yeouido-dong, Yeongdeungpo-gu, Seoul", sdt: "+82-2-789-0123", email: "support@seoulmart.co.kr" }
];

const warehouses = [
  { ma_kho: "KHO-01", ten_kho: "Kho lạnh trung tâm Cái Bè", loai_kho: "Đông", suc_chua_lon_nhat: 500, suc_chua_con_trong: 280, tinh_trang_ve_sinh: "Đạt", nhiet_do: -18 },
  { ma_kho: "KHO-02", ten_kho: "Kho trung chuyển Cát Lái", loai_kho: "Mát", suc_chua_lon_nhat: 200, suc_chua_con_trong: 150, tinh_trang_ve_sinh: "Đạt", nhiet_do: 4 },
  { ma_kho: "KHO-03", ten_kho: "Kho bao bì Cao Lãnh", loai_kho: "Mát", suc_chua_lon_nhat: 100, suc_chua_con_trong: 65, tinh_trang_ve_sinh: "Chưa đạt", nhiet_do: 10 }
];

const personnel = [
  { ma_nv: "NV001", ten_nv: "Nguyễn Văn An", tuoi: 34, suc_khoe: "Tốt", dang_tap_huan: "Có", bo_phan: "Phòng Quản lý Chất lượng", chuc_vu: "Giám sát đóng gói", sdt: "0981234501", email: "an.nguyen@namdogroup.vn", vung_trong_phu_trach: "BG-PUC-0001", kho_phu_trach: "KHO-01", kiem_dinh_chat_luong: "Đạt chuẩn xuất khẩu", ket_qua_cong_viec: "Tích cực, hoàn thành đúng tiến độ đóng gói" },
  { ma_nv: "NV002", ten_nv: "Trần Thị Bình", tuoi: 28, suc_khoe: "Tốt", dang_tap_huan: "Không", bo_phan: "Phòng Sản xuất", chuc_vu: "Nhân viên vận hành", sdt: "0981234502", email: "binh.tran@namdogroup.vn", vung_trong_phu_trach: "BG-PUC-0002", kho_phu_trach: "KHO-02", kiem_dinh_chat_luong: "Không áp dụng", ket_qua_cong_viec: "Đảm bảo vận hành dây chuyền ổn định" },
  { ma_nv: "NV003", ten_nv: "Lê Hoàng Chi", tuoi: 42, suc_khoe: "Khá", dang_tap_huan: "Có", bo_phan: "Phòng Kỹ thuật", chuc_vu: "Kỹ thuật viên thực địa", sdt: "0981234503", email: "chi.le@namdogroup.vn", vung_trong_phu_trach: "HG-PUC-0001", kho_phu_trach: "Chưa phân công", kiem_dinh_chat_luong: "Đạt chuẩn VietGAP", ket_qua_cong_viec: "Hỗ trợ nhà vườn khắc phục sự cố sâu bệnh tốt" },
  { ma_nv: "NV004", ten_nv: "Phạm Quốc Đạt", tuoi: 31, suc_khoe: "Tốt", dang_tap_huan: "Có", bo_phan: "Phòng QA/QC", chuc_vu: "Kiểm định viên", sdt: "0981234504", email: "dat.pham@namdogroup.vn", vung_trong_phu_trach: "HG-PUC-0002", kho_phu_trach: "KHO-01", kiem_dinh_chat_luong: "Giám định dư lượng thuốc đạt chuẩn", ket_qua_cong_viec: "Kiểm soát tốt chất lượng đầu vào của lô hàng" },
  { ma_nv: "NV005", ten_nv: "Hoàng Kim Anh", tuoi: 26, suc_khoe: "Tốt", dang_tap_huan: "Không", bo_phan: "Phòng Kỹ thuật", chuc_vu: "Kỹ thuật viên thực địa", sdt: "0981234505", email: "anh.hoang@namdogroup.vn", vung_trong_phu_trach: "TG-PUC-0001", kho_phu_trach: "Chưa phân công", kiem_dinh_chat_luong: "Không áp dụng", ket_qua_cong_viec: "Ghi chép đầy đủ nhật ký bón phân và phun thuốc" },
  { ma_nv: "NV006", ten_nv: "Vũ Tiến Đức", tuoi: 39, suc_khoe: "Khá", dang_tap_huan: "Không", bo_phan: "Phòng Sản xuất", chuc_vu: "Nhân viên kho", sdt: "0981234506", email: "duc.vu@namdogroup.vn", vung_trong_phu_trach: "TG-PUC-0002", kho_phu_trach: "KHO-03", kiem_dinh_chat_luong: "Không áp dụng", ket_qua_cong_viec: "Sắp xếp kho bao bì gọn gàng, kiểm kho chính xác" },
  { ma_nv: "NV007", ten_nv: "Ngô Quốc Huy", tuoi: 35, suc_khoe: "Bình thường", dang_tap_huan: "Có", bo_phan: "Phòng Quản lý Chất lượng", chuc_vu: "Giám sát đóng gói", sdt: "0981234507", email: "huy.ngo@namdogroup.vn", vung_trong_phu_trach: "BG-PUC-0003", kho_phu_trach: "KHO-02", kiem_dinh_chat_luong: "Đạt chuẩn xuất khẩu", ket_qua_cong_viec: "Đảm bảo đúng quy cách đóng gói cho thị trường Hàn Quốc" },
  { ma_nv: "NV008", ten_nv: "Đỗ Minh Khang", tuoi: 45, suc_khoe: "Tốt", dang_tap_huan: "Có", bo_phan: "Phòng Kỹ thuật", chuc_vu: "Kỹ thuật viên thực địa", sdt: "0981234508", email: "khang.do@namdogroup.vn", vung_trong_phu_trach: "LA-PUC-0001", kho_phu_trach: "Chưa phân công", kiem_dinh_chat_luong: "Đạt chuẩn hữu cơ", ket_qua_cong_viec: "Khảo sát và lập báo cáo kỹ thuật đúng thời hạn" },
  { ma_nv: "NV009", ten_nv: "Bùi Phương Linh", tuoi: 29, suc_khoe: "Tốt", dang_tap_huan: "Không", bo_phan: "Phòng QA/QC", chuc_vu: "Kiểm định viên", sdt: "0981234509", email: "linh.bui@namdogroup.vn", vung_trong_phu_trach: "LA-PUC-0002", kho_phu_trach: "KHO-01", kiem_dinh_chat_luong: "Kiểm dịch thực vật đạt 100%", ket_qua_cong_viec: "Phát hiện nhanh và xử lý kịp thời lô hàng bị lỗi kiểm dịch" },
  { ma_nv: "NV010", ten_nv: "Nguyễn Tiến Dũng", tuoi: 37, suc_khoe: "Khá", dang_tap_huan: "Có", bo_phan: "Phòng Sản xuất", chuc_vu: "Nhân viên vận hành", sdt: "0981234510", email: "dung.nguyen@namdogroup.vn", vung_trong_phu_trach: "HG-PUC-0003", kho_phu_trach: "KHO-02", kiem_dinh_chat_luong: "Không áp dụng", ket_qua_cong_viec: "Vận hành hệ thống cấp đông nhanh đạt công suất" }
];

const traceability = [
  {
    "id": "BG-001",
    "ma_puc": "BG-PUC-0001",
    "dia_chi_vuon": "Xã Tân Hương, H. Yên Phong, Bắc Giang",
    "ten_vuon": "Vườn Anh Minh",
    "ngay_thu_hoach": "2026-06-05",
    "lan_phun_thuoc_gan_nhat": "2026-05-28",
    "cach_ly": null,
    "loai": null,
    "khoi_luong_lo_hang": null,
    "khoi_luong_dong_goi": null,
    "noi_xuat_khau": null,
    "ten_co_so_dong_goi": null,
    "ma_phc": null,
    "ket_qua_kiem_dich": null
  },
  {
    "id": "BG-002",
    "ma_puc": "BG-PUC-0002",
    "dia_chi_vuon": "Xã Quang Châu, H. Việt Yên, Bắc Giang",
    "ten_vuon": "Vườn Chị Lan",
    "ngay_thu_hoach": "2026-06-06",
    "lan_phun_thuoc_gan_nhat": "2026-05-30",
    "cach_ly": "Không",
    "loai": "Nguyên trái đông lạnh",
    "khoi_luong_lo_hang": 17.2,
    "khoi_luong_dong_goi": 15.7,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Trường Thịnh",
    "ma_phc": "VN-PHC-0009",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "HG-001",
    "ma_puc": "HG-PUC-0001",
    "dia_chi_vuon": "Xã Bình Long, H. Châu Phú, An Giang",
    "ten_vuon": "Vườn Bác Tám",
    "ngay_thu_hoach": "2026-06-04",
    "lan_phun_thuoc_gan_nhat": "2026-05-27",
    "cach_ly": "Có",
    "loai": "Lột múi cơm",
    "khoi_luong_lo_hang": 24.1,
    "khoi_luong_dong_goi": 23.9,
    "noi_xuat_khau": "Hàn Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Á Đông",
    "ma_phc": "VN-PHC-0010",
    "ket_qua_kiem_dich": null
  },
  {
    "id": "HG-002",
    "ma_puc": "HG-PUC-0002",
    "dia_chi_vuon": "Xã Vĩnh Thạnh Trung, H. Châu Phú, An Giang",
    "ten_vuon": "Vườn Chú Hai",
    "ngay_thu_hoach": "2026-06-07",
    "lan_phun_thuoc_gan_nhat": "2026-06-01",
    "cach_ly": null,
    "loai": null,
    "khoi_luong_lo_hang": null,
    "khoi_luong_dong_goi": null,
    "noi_xuat_khau": null,
    "ten_co_so_dong_goi": null,
    "ma_phc": null,
    "ket_qua_kiem_dich": null
  },
  {
    "id": "TG-001",
    "ma_puc": "TG-PUC-0001",
    "dia_chi_vuon": "Xã Long Trung, H. Cai Lậy, Tiền Giang",
    "ten_vuon": "Vườn Anh Hùng",
    "ngay_thu_hoach": "2026-06-03",
    "lan_phun_thuoc_gan_nhat": "2026-05-26",
    "cach_ly": "Có",
    "loai": null,
    "khoi_luong_lo_hang": null,
    "khoi_luong_dong_goi": null,
    "noi_xuat_khau": null,
    "ten_co_so_dong_goi": null,
    "ma_phc": null,
    "ket_qua_kiem_dich": null
  },
  {
    "id": "TG-002",
    "ma_puc": "TG-PUC-0002",
    "dia_chi_vuon": "Xã Tam Bình, H. Cai Lậy, Tiền Giang",
    "ten_vuon": "Vườn Bà Năm",
    "ngay_thu_hoach": "2026-06-08",
    "lan_phun_thuoc_gan_nhat": "2026-06-02",
    "cach_ly": "Không",
    "loai": "Nguyên trái đông lạnh",
    "khoi_luong_lo_hang": 9.8,
    "khoi_luong_dong_goi": 9.1,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Thanh Bình",
    "ma_phc": "VN-PHC-0002",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "BG-003",
    "ma_puc": "BG-PUC-0003",
    "dia_chi_vuon": "Xã Hương Mai, H. Việt Yên, Bắc Giang",
    "ten_vuon": "Vườn Anh Tuấn",
    "ngay_thu_hoach": "2026-06-05",
    "lan_phun_thuoc_gan_nhat": "2026-05-29",
    "cach_ly": "Không",
    "loai": "Lột múi cơm",
    "khoi_luong_lo_hang": 6.7,
    "khoi_luong_dong_goi": 6.4,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Trường Thịnh",
    "ma_phc": "VN-PHC-0009",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "LA-001",
    "ma_puc": "LA-PUC-0001",
    "dia_chi_vuon": "Xã Định Thành, H. Đức Hòa, Long An",
    "ten_vuon": "Vườn Chị Thu",
    "ngay_thu_hoach": "2026-06-06",
    "lan_phun_thuoc_gan_nhat": "2026-05-31",
    "cach_ly": null,
    "loai": null,
    "khoi_luong_lo_hang": null,
    "khoi_luong_dong_goi": null,
    "noi_xuat_khau": null,
    "ten_co_so_dong_goi": null,
    "ma_phc": null,
    "ket_qua_kiem_dich": null
  },
  {
    "id": "LA-002",
    "ma_puc": "LA-PUC-0002",
    "dia_chi_vuon": "Xã Tân Mỹ, H. Đức Hòa, Long An",
    "ten_vuon": "Vườn Ông Sáu",
    "ngay_thu_hoach": "2026-06-07",
    "lan_phun_thuoc_gan_nhat": "2026-06-01",
    "cach_ly": "Có",
    "loai": "Sấy khô",
    "khoi_luong_lo_hang": 20.3,
    "khoi_luong_dong_goi": 18.5,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Trường Thịnh",
    "ma_phc": "VN-PHC-0009",
    "ket_qua_kiem_dich": "Không đạt"
  },
  {
    "id": "HG-003",
    "ma_puc": "HG-PUC-0003",
    "dia_chi_vuon": "Xã Bình Mỹ, H. Châu Phú, An Giang",
    "ten_vuon": "Vườn Cô Ba",
    "ngay_thu_hoach": "2026-06-04",
    "lan_phun_thuoc_gan_nhat": "2026-05-28",
    "cach_ly": "Có",
    "loai": "Sấy khô",
    "khoi_luong_lo_hang": 8.3,
    "khoi_luong_dong_goi": 7.9,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Rồng Việt",
    "ma_phc": "VN-PHC-0004",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "TG-003",
    "ma_puc": "TG-PUC-0003",
    "dia_chi_vuon": "Xã Mỹ Long, H. Cai Lậy, Tiền Giang",
    "ten_vuon": "Vườn Anh Phước",
    "ngay_thu_hoach": "2026-06-09",
    "lan_phun_thuoc_gan_nhat": "2026-06-03",
    "cach_ly": "Không",
    "loai": "Nguyên trái đông lạnh",
    "khoi_luong_lo_hang": 23.6,
    "khoi_luong_dong_goi": 23,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói VinaGreen",
    "ma_phc": "VN-PHC-0005",
    "ket_qua_kiem_dich": "Không đạt"
  },
  {
    "id": "BG-004",
    "ma_puc": "BG-PUC-0004",
    "dia_chi_vuon": "Xã Nội Hoàng, H. Yên Dũng, Bắc Giang",
    "ten_vuon": "Vườn Chị Hoa",
    "ngay_thu_hoach": "2026-06-05",
    "lan_phun_thuoc_gan_nhat": "2026-05-30",
    "cach_ly": "Không",
    "loai": "Nguyên trái đông lạnh",
    "khoi_luong_lo_hang": 13,
    "khoi_luong_dong_goi": 12.6,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Trường Thịnh",
    "ma_phc": "VN-PHC-0009",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "VL-001",
    "ma_puc": "VL-PUC-0001",
    "dia_chi_vuon": "Xã Trung Thành, H. Vũng Liêm, Vĩnh Long",
    "ten_vuon": "Vườn Bác Bảy",
    "ngay_thu_hoach": "2026-06-06",
    "lan_phun_thuoc_gan_nhat": "2026-05-29",
    "cach_ly": "Có",
    "loai": "Trái tươi xuất khẩu",
    "khoi_luong_lo_hang": 14,
    "khoi_luong_dong_goi": 12.9,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Hưng Phát",
    "ma_phc": "VN-PHC-0001",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "VL-002",
    "ma_puc": "VL-PUC-0002",
    "dia_chi_vuon": "Xã Hiếu Phụng, H. Vũng Liêm, Vĩnh Long",
    "ten_vuon": "Vườn Chú Chín",
    "ngay_thu_hoach": "2026-06-07",
    "lan_phun_thuoc_gan_nhat": "2026-06-02",
    "cach_ly": "Có",
    "loai": "Lột múi cơm",
    "khoi_luong_lo_hang": 16.8,
    "khoi_luong_dong_goi": 15.5,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Thanh Bình",
    "ma_phc": "VN-PHC-0002",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "LA-003",
    "ma_puc": "LA-PUC-0003",
    "dia_chi_vuon": "Xã Nhị Thành, H. Thủ Thừa, Long An",
    "ten_vuon": "Vườn Anh Khoa",
    "ngay_thu_hoach": "2026-06-08",
    "lan_phun_thuoc_gan_nhat": "2026-06-01",
    "cach_ly": "Không",
    "loai": "Sấy khô",
    "khoi_luong_lo_hang": 19.2,
    "khoi_luong_dong_goi": 17.4,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Hưng Phát",
    "ma_phc": "VN-PHC-0001",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "TG-004",
    "ma_puc": "TG-PUC-0004",
    "dia_chi_vuon": "Xã Phú Nhuận, H. Cai Lậy, Tiền Giang",
    "ten_vuon": "Vườn Bà Tư",
    "ngay_thu_hoach": "2026-06-04",
    "lan_phun_thuoc_gan_nhat": "2026-05-27",
    "cach_ly": null,
    "loai": null,
    "khoi_luong_lo_hang": null,
    "khoi_luong_dong_goi": null,
    "noi_xuat_khau": null,
    "ten_co_so_dong_goi": null,
    "ma_phc": null,
    "ket_qua_kiem_dich": null
  },
  {
    "id": "HG-004",
    "ma_puc": "HG-PUC-0004",
    "dia_chi_vuon": "Xã Khánh Hòa, H. Châu Phú, An Giang",
    "ten_vuon": "Vườn Ông Hai",
    "ngay_thu_hoach": "2026-06-09",
    "lan_phun_thuoc_gan_nhat": "2026-06-03",
    "cach_ly": "Có",
    "loai": "Nguyên trái đông lạnh",
    "khoi_luong_lo_hang": 22.2,
    "khoi_luong_dong_goi": 20.1,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Minh Sáng",
    "ma_phc": "VN-PHC-0008",
    "ket_qua_kiem_dich": "Không đạt"
  },
  {
    "id": "BG-005",
    "ma_puc": "BG-PUC-0005",
    "dia_chi_vuon": "Xã Tự Lạn, H. Việt Yên, Bắc Giang",
    "ten_vuon": "Vườn Chị Ngọc",
    "ngay_thu_hoach": "2026-06-10",
    "lan_phun_thuoc_gan_nhat": "2026-06-04",
    "cach_ly": "Không",
    "loai": "Trái tươi xuất khẩu",
    "khoi_luong_lo_hang": 9.3,
    "khoi_luong_dong_goi": 8.5,
    "noi_xuat_khau": "Hàn Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Á Đông",
    "ma_phc": "VN-PHC-0010",
    "ket_qua_kiem_dich": null
  },
  {
    "id": "VL-003",
    "ma_puc": "VL-PUC-0003",
    "dia_chi_vuon": "Xã Quới An, H. Vũng Liêm, Vĩnh Long",
    "ten_vuon": "Vườn Anh Dũng",
    "ngay_thu_hoach": "2026-06-06",
    "lan_phun_thuoc_gan_nhat": "2026-05-30",
    "cach_ly": null,
    "loai": null,
    "khoi_luong_lo_hang": null,
    "khoi_luong_dong_goi": null,
    "noi_xuat_khau": null,
    "ten_co_so_dong_goi": null,
    "ma_phc": null,
    "ket_qua_kiem_dich": null
  },
  {
    "id": "LA-004",
    "ma_puc": "LA-PUC-0004",
    "dia_chi_vuon": "Xã Long Thượng, H. Cần Giuộc, Long An",
    "ten_vuon": "Vườn Bác Ba",
    "ngay_thu_hoach": "2026-06-07",
    "lan_phun_thuoc_gan_nhat": "2026-05-31",
    "cach_ly": "Không",
    "loai": "Lột múi cơm",
    "khoi_luong_lo_hang": 16.5,
    "khoi_luong_dong_goi": 15.3,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Hòa Phát",
    "ma_phc": "VN-PHC-0007",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "BG-006",
    "ma_puc": "BG-PUC-0006",
    "dia_chi_vuon": "Xã Lương Phong, H. Hiệp Hòa, Bắc Giang",
    "ten_vuon": "Vườn Chú Sơn",
    "ngay_thu_hoach": "2026-06-20",
    "lan_phun_thuoc_gan_nhat": "2026-06-13",
    "cach_ly": "Có",
    "loai": "Nguyên trái đông lạnh",
    "khoi_luong_lo_hang": 8.8,
    "khoi_luong_dong_goi": 8,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Hòa Phát",
    "ma_phc": "VN-PHC-0007",
    "ket_qua_kiem_dich": null
  },
  {
    "id": "BG-007",
    "ma_puc": "BG-PUC-0007",
    "dia_chi_vuon": "Xã Mỹ Hà, H. Lạng Giang, Bắc Giang",
    "ten_vuon": "Vườn Anh Dũng",
    "ngay_thu_hoach": "2026-06-22",
    "lan_phun_thuoc_gan_nhat": "2026-06-15",
    "cach_ly": "Không",
    "loai": "Lột múi cơm",
    "khoi_luong_lo_hang": 13.2,
    "khoi_luong_dong_goi": 13,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Thanh Bình",
    "ma_phc": "VN-PHC-0002",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "BG-008",
    "ma_puc": "BG-PUC-0008",
    "dia_chi_vuon": "Xã Hồng Giang, H. Lục Ngạn, Bắc Giang",
    "ten_vuon": "Vườn Bác Hải",
    "ngay_thu_hoach": "2026-06-13",
    "lan_phun_thuoc_gan_nhat": "2026-06-07",
    "cach_ly": "Không",
    "loai": "Trái tươi xuất khẩu",
    "khoi_luong_lo_hang": 19.6,
    "khoi_luong_dong_goi": 19.2,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Rồng Việt",
    "ma_phc": "VN-PHC-0004",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "BG-009",
    "ma_puc": "BG-PUC-0009",
    "dia_chi_vuon": "Xã Phượng Sơn, H. Lục Ngạn, Bắc Giang",
    "ten_vuon": "Vườn Chị Mai",
    "ngay_thu_hoach": "2026-06-12",
    "lan_phun_thuoc_gan_nhat": "2026-06-05",
    "cach_ly": "Có",
    "loai": "Lột múi cơm",
    "khoi_luong_lo_hang": 14,
    "khoi_luong_dong_goi": 13.2,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": null,
    "ma_phc": null,
    "ket_qua_kiem_dich": null
  },
  {
    "id": "BG-010",
    "ma_puc": "BG-PUC-0010",
    "dia_chi_vuon": "Xã Thanh Hải, H. Lục Ngạn, Bắc Giang",
    "ten_vuon": "Vườn Cô Hồng",
    "ngay_thu_hoach": "2026-06-24",
    "lan_phun_thuoc_gan_nhat": "2026-06-17",
    "cach_ly": "Không",
    "loai": "Trái tươi xuất khẩu",
    "khoi_luong_lo_hang": 10,
    "khoi_luong_dong_goi": 9.9,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Trường Thịnh",
    "ma_phc": "VN-PHC-0009",
    "ket_qua_kiem_dich": null
  },
  {
    "id": "BG-011",
    "ma_puc": "BG-PUC-0011",
    "dia_chi_vuon": "Xã Đồng Cốc, H. Lục Ngạn, Bắc Giang",
    "ten_vuon": "Vườn Anh Quân",
    "ngay_thu_hoach": "2026-06-22",
    "lan_phun_thuoc_gan_nhat": "2026-06-15",
    "cach_ly": "Có",
    "loai": "Sấy khô",
    "khoi_luong_lo_hang": 7,
    "khoi_luong_dong_goi": 6.8,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Hưng Phát",
    "ma_phc": "VN-PHC-0001",
    "ket_qua_kiem_dich": "Không đạt"
  },
  {
    "id": "HG-005",
    "ma_puc": "HG-PUC-0005",
    "dia_chi_vuon": "Xã Mỹ Đức, H. Châu Phú, An Giang",
    "ten_vuon": "Vườn Chị Thủy",
    "ngay_thu_hoach": "2026-06-12",
    "lan_phun_thuoc_gan_nhat": "2026-06-04",
    "cach_ly": "Không",
    "loai": "Lột múi cơm",
    "khoi_luong_lo_hang": 23.5,
    "khoi_luong_dong_goi": 23.1,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Minh Sáng",
    "ma_phc": "VN-PHC-0008",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "HG-006",
    "ma_puc": "HG-PUC-0006",
    "dia_chi_vuon": "Xã Ô Long Vĩ, H. Châu Phú, An Giang",
    "ten_vuon": "Vườn Bác Hùng",
    "ngay_thu_hoach": "2026-06-20",
    "lan_phun_thuoc_gan_nhat": "2026-06-14",
    "cach_ly": "Có",
    "loai": "Trái tươi xuất khẩu",
    "khoi_luong_lo_hang": 22.3,
    "khoi_luong_dong_goi": 22.1,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Hưng Phát",
    "ma_phc": "VN-PHC-0001",
    "ket_qua_kiem_dich": "Không đạt"
  },
  {
    "id": "HG-007",
    "ma_puc": "HG-PUC-0007",
    "dia_chi_vuon": "Xã Thạnh Mỹ Tây, H. Châu Phú, An Giang",
    "ten_vuon": "Vườn Chú Tư",
    "ngay_thu_hoach": "2026-06-21",
    "lan_phun_thuoc_gan_nhat": "2026-06-15",
    "cach_ly": "Không",
    "loai": "Trái tươi xuất khẩu",
    "khoi_luong_lo_hang": 10.3,
    "khoi_luong_dong_goi": 10.1,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Hòa Phát",
    "ma_phc": "VN-PHC-0007",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "HG-008",
    "ma_puc": "HG-PUC-0008",
    "dia_chi_vuon": "Xã Đào Hữu Cảnh, H. Châu Phú, An Giang",
    "ten_vuon": "Vườn Anh Bình",
    "ngay_thu_hoach": "2026-06-24",
    "lan_phun_thuoc_gan_nhat": "2026-06-18",
    "cach_ly": "Có",
    "loai": "Sấy khô",
    "khoi_luong_lo_hang": 19.6,
    "khoi_luong_dong_goi": 19.2,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Minh Sáng",
    "ma_phc": "VN-PHC-0008",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "HG-009",
    "ma_puc": "HG-PUC-0009",
    "dia_chi_vuon": "Xã Bình Chánh, H. Châu Phú, An Giang",
    "ten_vuon": "Vườn Cô Liên",
    "ngay_thu_hoach": "2026-06-15",
    "lan_phun_thuoc_gan_nhat": "2026-06-08",
    "cach_ly": "Không",
    "loai": "Nguyên trái đông lạnh",
    "khoi_luong_lo_hang": 10.9,
    "khoi_luong_dong_goi": 10.9,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Trường Thịnh",
    "ma_phc": "VN-PHC-0009",
    "ket_qua_kiem_dich": null
  },
  {
    "id": "HG-010",
    "ma_puc": "HG-PUC-0010",
    "dia_chi_vuon": "Xã Bình Phú, H. Châu Phú, An Giang",
    "ten_vuon": "Vườn Ông Mười",
    "ngay_thu_hoach": "2026-06-16",
    "lan_phun_thuoc_gan_nhat": "2026-06-09",
    "cach_ly": "Có",
    "loai": "Lột múi cơm",
    "khoi_luong_lo_hang": 11.3,
    "khoi_luong_dong_goi": 10.2,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Trường Thịnh",
    "ma_phc": null,
    "ket_qua_kiem_dich": null
  },
  {
    "id": "TG-005",
    "ma_puc": "TG-PUC-0005",
    "dia_chi_vuon": "Xã Cẩm Sơn, H. Cai Lậy, Tiền Giang",
    "ten_vuon": "Vườn Chị Hằng",
    "ngay_thu_hoach": "2026-06-22",
    "lan_phun_thuoc_gan_nhat": "2026-06-14",
    "cach_ly": "Có",
    "loai": null,
    "khoi_luong_lo_hang": null,
    "khoi_luong_dong_goi": null,
    "noi_xuat_khau": null,
    "ten_co_so_dong_goi": null,
    "ma_phc": null,
    "ket_qua_kiem_dich": null
  },
  {
    "id": "TG-006",
    "ma_puc": "TG-PUC-0006",
    "dia_chi_vuon": "Xã Hiệp Đức, H. Cai Lậy, Tiền Giang",
    "ten_vuon": "Vườn Anh Thịnh",
    "ngay_thu_hoach": "2026-06-19",
    "lan_phun_thuoc_gan_nhat": "2026-06-11",
    "cach_ly": "Có",
    "loai": "Nguyên trái đông lạnh",
    "khoi_luong_lo_hang": 8.1,
    "khoi_luong_dong_goi": 8.1,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Sen Vàng",
    "ma_phc": "VN-PHC-0003",
    "ket_qua_kiem_dich": null
  },
  {
    "id": "TG-007",
    "ma_puc": "TG-PUC-0007",
    "dia_chi_vuon": "Xã Tân Phong, H. Cai Lậy, Tiền Giang",
    "ten_vuon": "Vườn Bác Sáu",
    "ngay_thu_hoach": "2026-06-18",
    "lan_phun_thuoc_gan_nhat": "2026-06-11",
    "cach_ly": "Không",
    "loai": "Nguyên trái đông lạnh",
    "khoi_luong_lo_hang": 6.4,
    "khoi_luong_dong_goi": 5.8,
    "noi_xuat_khau": "Nhật Bản",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Hòa Phát",
    "ma_phc": "VN-PHC-0007",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "TG-008",
    "ma_puc": "TG-PUC-0008",
    "dia_chi_vuon": "Xã Ngũ Hiệp, H. Cai Lậy, Tiền Giang",
    "ten_vuon": "Vườn Chú Út",
    "ngay_thu_hoach": "2026-06-21",
    "lan_phun_thuoc_gan_nhat": "2026-06-14",
    "cach_ly": "Có",
    "loai": "Nguyên trái đông lạnh",
    "khoi_luong_lo_hang": 22.8,
    "khoi_luong_dong_goi": 21.1,
    "noi_xuat_khau": null,
    "ten_co_so_dong_goi": null,
    "ma_phc": null,
    "ket_qua_kiem_dich": null
  },
  {
    "id": "TG-009",
    "ma_puc": "TG-PUC-0009",
    "dia_chi_vuon": "Xã Hội Xuân, H. Cai Lậy, Tiền Giang",
    "ten_vuon": "Vườn Cô Mai",
    "ngay_thu_hoach": "2026-06-24",
    "lan_phun_thuoc_gan_nhat": "2026-06-18",
    "cach_ly": "Không",
    "loai": "Sấy khô",
    "khoi_luong_lo_hang": 16.9,
    "khoi_luong_dong_goi": 16.3,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Á Đông",
    "ma_phc": "VN-PHC-0010",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "TG-010",
    "ma_puc": "TG-PUC-0010",
    "dia_chi_vuon": "Xã Long Khánh, H. Cai Lậy, Tiền Giang",
    "ten_vuon": "Vườn Anh Khánh",
    "ngay_thu_hoach": "2026-06-15",
    "lan_phun_thuoc_gan_nhat": "2026-06-09",
    "cach_ly": "Có",
    "loai": "Lột múi cơm",
    "khoi_luong_lo_hang": 11.3,
    "khoi_luong_dong_goi": 10.5,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Mekong",
    "ma_phc": "VN-PHC-0006",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "LA-005",
    "ma_puc": "LA-PUC-0005",
    "dia_chi_vuon": "Xã Mỹ Hạnh Nam, H. Đức Hòa, Long An",
    "ten_vuon": "Vườn Chị Dung",
    "ngay_thu_hoach": "2026-06-14",
    "lan_phun_thuoc_gan_nhat": "2026-06-06",
    "cach_ly": "Không",
    "loai": "Sấy khô",
    "khoi_luong_lo_hang": 12.9,
    "khoi_luong_dong_goi": 12.5,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Mekong",
    "ma_phc": "VN-PHC-0006",
    "ket_qua_kiem_dich": null
  },
  {
    "id": "LA-006",
    "ma_puc": "LA-PUC-0006",
    "dia_chi_vuon": "Xã Hựu Thạnh, H. Đức Hòa, Long An",
    "ten_vuon": "Vườn Anh Tuấn",
    "ngay_thu_hoach": "2026-06-25",
    "lan_phun_thuoc_gan_nhat": "2026-06-17",
    "cach_ly": "Không",
    "loai": "Nguyên trái đông lạnh",
    "khoi_luong_lo_hang": 23.6,
    "khoi_luong_dong_goi": 23.4,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Á Đông",
    "ma_phc": "VN-PHC-0010",
    "ket_qua_kiem_dich": "Không đạt"
  },
  {
    "id": "LA-007",
    "ma_puc": "LA-PUC-0007",
    "dia_chi_vuon": "Xã Hòa Khánh Nam, H. Đức Hòa, Long An",
    "ten_vuon": "Vườn Bác Minh",
    "ngay_thu_hoach": "2026-06-15",
    "lan_phun_thuoc_gan_nhat": "2026-06-09",
    "cach_ly": "Có",
    "loai": "Lột múi cơm",
    "khoi_luong_lo_hang": 24.9,
    "khoi_luong_dong_goi": 22.6,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói VinaGreen",
    "ma_phc": "VN-PHC-0005",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "LA-008",
    "ma_puc": "LA-PUC-0008",
    "dia_chi_vuon": "Xã Đức Lập Hạ, H. Đức Hòa, Long An",
    "ten_vuon": "Vườn Chú Bảy",
    "ngay_thu_hoach": "2026-06-22",
    "lan_phun_thuoc_gan_nhat": "2026-06-14",
    "cach_ly": "Không",
    "loai": "Sấy khô",
    "khoi_luong_lo_hang": null,
    "khoi_luong_dong_goi": null,
    "noi_xuat_khau": null,
    "ten_co_so_dong_goi": null,
    "ma_phc": null,
    "ket_qua_kiem_dich": null
  },
  {
    "id": "LA-009",
    "ma_puc": "LA-PUC-0009",
    "dia_chi_vuon": "Xã Hướng Thọ Phú, TP. Tân An, Long An",
    "ten_vuon": "Vườn Cô Lan",
    "ngay_thu_hoach": "2026-06-16",
    "lan_phun_thuoc_gan_nhat": "2026-06-10",
    "cach_ly": "Có",
    "loai": "Sấy khô",
    "khoi_luong_lo_hang": 12,
    "khoi_luong_dong_goi": 10.9,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói VinaGreen",
    "ma_phc": "VN-PHC-0005",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "LA-010",
    "ma_puc": "LA-PUC-010",
    "dia_chi_vuon": "Xã Bình Thạnh, H. Thủ Thừa, Long An",
    "ten_vuon": "Vườn Anh Sơn",
    "ngay_thu_hoach": "2026-06-12",
    "lan_phun_thuoc_gan_nhat": "2026-06-06",
    "cach_ly": "Có",
    "loai": "Nguyên trái đông lạnh",
    "khoi_luong_lo_hang": 21.7,
    "khoi_luong_dong_goi": 21.1,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Trường Thịnh",
    "ma_phc": "VN-PHC-0009",
    "ket_qua_kiem_dich": null
  },
  {
    "id": "VL-004",
    "ma_puc": "VL-PUC-0004",
    "dia_chi_vuon": "Xã Trung Hiếu, H. Vũng Liêm, Vĩnh Long",
    "ten_vuon": "Vườn Chị Thảo",
    "ngay_thu_hoach": "2026-06-21",
    "lan_phun_thuoc_gan_nhat": "2026-06-15",
    "cach_ly": "Không",
    "loai": "Trái tươi xuất khẩu",
    "khoi_luong_lo_hang": 5.2,
    "khoi_luong_dong_goi": 5.1,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Thanh Bình",
    "ma_phc": "VN-PHC-0002",
    "ket_qua_kiem_dich": "Không đạt"
  },
  {
    "id": "VL-005",
    "ma_puc": "VL-PUC-0005",
    "dia_chi_vuon": "Xã Hiếu Thành, H. Vũng Liêm, Vĩnh Long",
    "ten_vuon": "Vườn Bác Lâm",
    "ngay_thu_hoach": "2026-06-17",
    "lan_phun_thuoc_gan_nhat": "2026-06-10",
    "cach_ly": "Không",
    "loai": "Lột múi cơm",
    "khoi_luong_lo_hang": 7.7,
    "khoi_luong_dong_goi": 7,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Trường Thịnh",
    "ma_phc": "VN-PHC-0009",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "VL-006",
    "ma_puc": "VL-PUC-0006",
    "dia_chi_vuon": "Xã Trung An, H. Vũng Liêm, Vĩnh Long",
    "ten_vuon": "Vườn Chú Hoàng",
    "ngay_thu_hoach": "2026-06-19",
    "lan_phun_thuoc_gan_nhat": "2026-06-13",
    "cach_ly": "Có",
    "loai": "Lột múi cơm",
    "khoi_luong_lo_hang": 10.6,
    "khoi_luong_dong_goi": 9.8,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói VinaGreen",
    "ma_phc": "VN-PHC-0005",
    "ket_qua_kiem_dich": null
  },
  {
    "id": "VL-007",
    "ma_puc": "VL-PUC-0007",
    "dia_chi_vuon": "Xã Trung Thành Tây, H. Vũng Liêm, Vĩnh Long",
    "ten_vuon": "Vườn Cô Huệ",
    "ngay_thu_hoach": "2026-06-23",
    "lan_phun_thuoc_gan_nhat": "2026-06-15",
    "cach_ly": "Không",
    "loai": "Trái tươi xuất khẩu",
    "khoi_luong_lo_hang": 15.1,
    "khoi_luong_dong_goi": 14,
    "noi_xuat_khau": "Hàn Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Hưng Phát",
    "ma_phc": "VN-PHC-0001",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "VL-008",
    "ma_puc": "VL-PUC-0008",
    "dia_chi_vuon": "Xã Tân Quới Trung, H. Vũng Liêm, Vĩnh Long",
    "ten_vuon": "Vườn Anh Nam",
    "ngay_thu_hoach": "2026-06-15",
    "lan_phun_thuoc_gan_nhat": "2026-06-08",
    "cach_ly": "Có",
    "loai": "Sấy khô",
    "khoi_luong_lo_hang": 13.5,
    "khoi_luong_dong_goi": 12.5,
    "noi_xuat_khau": "Trung Quốc",
    "ten_co_so_dong_goi": "Cơ sở đóng gói Sen Vàng",
    "ma_phc": "VN-PHC-0003",
    "ket_qua_kiem_dich": "Đạt"
  },
  {
    "id": "VL-009",
    "ma_puc": "VL-PUC-0009",
    "dia_chi_vuon": "Xã Thanh Bình, H. Vũng Liêm, Vĩnh Long",
    "ten_vuon": "Vườn Chị Hương",
    "ngay_thu_hoach": "2026-06-11",
    "lan_phun_thuoc_gan_nhat": "2026-06-03",
    "cach_ly": null,
    "loai": null,
    "khoi_luong_lo_hang": null,
    "khoi_luong_dong_goi": null,
    "noi_xuat_khau": null,
    "ten_co_so_dong_goi": null,
    "ma_phc": null,
    "ket_qua_kiem_dich": null
  }
];

async function seed() {
  try {
    console.log('Starting seed process...');

    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('Created database schema from backend/db/schema.sql');

    // Insert customers
    for (const c of customers) {
      await pool.query(
        'INSERT INTO khach_hang (ma_kh, ten_kh, dia_chi, quoc_gia, sdt, email) VALUES ($1, $2, $3, $4, $5, $6)',
        [c.ma_kh, c.ten_kh, c.dia_chi, c.quoc_gia, c.sdt, c.email]
      );
    }
    console.log(`Seeded ${customers.length} customers`);

    // Insert personnel
    for (const p of personnel) {
      await pool.query(
        'INSERT INTO nhan_vien (ma_nv, ten_nv, tuoi, suc_khoe, dang_tap_huan, bo_phan, chuc_vu, sdt, email, vung_trong_phu_trach, kho_phu_trach, kiem_dinh_chat_luong, ket_qua_cong_viec) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [p.ma_nv, p.ten_nv, p.tuoi, p.suc_khoe, p.dang_tap_huan, p.bo_phan, p.chuc_vu, p.sdt, p.email, p.vung_trong_phu_trach, p.kho_phu_trach, p.kiem_dinh_chat_luong, p.ket_qua_cong_viec]
      );
    }
    console.log(`Seeded ${personnel.length} personnel`);

    // Insert warehouses
    for (const w of warehouses) {
      await pool.query(
        'INSERT INTO kho_bao_quan (ma_kho, ten_kho, loai_kho, suc_chua_lon_nhat, suc_chua_con_trong, tinh_trang_ve_sinh, nhiet_do) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [w.ma_kho, w.ten_kho, w.loai_kho, w.suc_chua_lon_nhat, w.suc_chua_con_trong, w.tinh_trang_ve_sinh, w.nhiet_do]
      );
    }
    console.log(`Seeded ${warehouses.length} warehouses`);

    // Collect unique growing areas (vung_trong) from traceability dataset
    const uniquePucs = {};
    for (const t of traceability) {
      if (t.ma_puc && !uniquePucs[t.ma_puc]) {
        const representativeName = t.ten_vuon.startsWith("Vườn ") ? t.ten_vuon.substring(5) : t.ten_vuon;
        uniquePucs[t.ma_puc] = {
          ma_puc: t.ma_puc,
          ten: representativeName,
          ten_vuon: t.ten_vuon,
          dia_chi: t.dia_chi_vuon
        };
      }
    }

    // Insert growing areas
    const vungTrongList = Object.values(uniquePucs);
    for (const v of vungTrongList) {
      await pool.query(
        'INSERT INTO vung_trong (ma_puc, ten, ten_vuon, dia_chi) VALUES ($1, $2, $3, $4)',
        [v.ma_puc, v.ten, v.ten_vuon, v.dia_chi]
      );
    }
    console.log(`Seeded ${vungTrongList.length} growing areas (vung_trong)`);

    let personnelAreaLinks = 0;
    let personnelWarehouseLinks = 0;
    for (const p of personnel) {
      if (p.vung_trong_phu_trach && p.vung_trong_phu_trach !== 'Chưa phân công') {
        const areaExists = vungTrongList.some(v => v.ma_puc === p.vung_trong_phu_trach);
        if (areaExists) {
          await pool.query(
            'INSERT INTO nhan_vien_vung_trong (ma_nv, ma_puc, vai_tro) VALUES ($1, $2, $3) ON CONFLICT (ma_nv, ma_puc) DO NOTHING',
            [p.ma_nv, p.vung_trong_phu_trach, p.chuc_vu]
          );
          personnelAreaLinks++;
        }
      }
      if (p.kho_phu_trach && p.kho_phu_trach !== 'Chưa phân công') {
        const warehouseExists = warehouses.some(w => w.ma_kho === p.kho_phu_trach);
        if (warehouseExists) {
          await pool.query(
            'INSERT INTO nhan_vien_kho (ma_nv, ma_kho, vai_tro) VALUES ($1, $2, $3) ON CONFLICT (ma_nv, ma_kho) DO NOTHING',
            [p.ma_nv, p.kho_phu_trach, p.chuc_vu]
          );
          personnelWarehouseLinks++;
        }
      }
    }
    console.log(`Seeded ${personnelAreaLinks} personnel-area links and ${personnelWarehouseLinks} personnel-warehouse links`);

    // Insert traceability
    for (const t of traceability) {
      await pool.query(`
        INSERT INTO truy_xuat_nguon_goc (
          id, ma_puc, ngay_thu_hoach, lan_phun_thuoc_gan_nhat,
          cach_ly, loai, khoi_luong_lo_hang, khoi_luong_dong_goi, noi_xuat_khau,
          ten_co_so_dong_goi, ma_phc, ket_qua_kiem_dich
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        t.id, t.ma_puc, t.ngay_thu_hoach, t.lan_phun_thuoc_gan_nhat,
        t.cach_ly, t.loai, t.khoi_luong_lo_hang, t.khoi_luong_dong_goi, t.noi_xuat_khau,
        t.ten_co_so_dong_goi, t.ma_phc, t.ket_qua_kiem_dich
      ]);
    }
    console.log(`Seeded ${traceability.length} traceability records`);

    // Insert entry receipts (phieu_nhap_kho)
    let receiptCounter = 1;
    for (const t of traceability) {
      if (t.ket_qua_kiem_dich === 'Đạt' && t.khoi_luong_dong_goi !== null && t.khoi_luong_dong_goi !== '') {
        const maKho = t.id.includes('BG') || t.id.includes('HG') ? 'KHO-01' : 'KHO-02';
        const harvestDate = new Date(t.ngay_thu_hoach);
        harvestDate.setDate(harvestDate.getDate() + 1);
        const entryDate = harvestDate.toISOString().split('T')[0];
        const viTri = `Khu-${t.id.split('-')[1] || 'A1'}`;

        const maPhieu = `PNK-${String(receiptCounter).padStart(4, '0')}`;
        await pool.query(
          'INSERT INTO phieu_nhap_kho (ma_phieu, id_lo_hang, ma_kho, ngay_nhap, khoi_luong, vi_tri_luu_tru) VALUES ($1, $2, $3, $4, $5, $6)',
          [maPhieu, t.id, maKho, entryDate, parseFloat(t.khoi_luong_dong_goi), viTri]
        );
        receiptCounter++;
      }
    }
    console.log(`Seeded ${receiptCounter - 1} storage entry receipts (phieu_nhap_kho)`);

    // Insert mock contracts
    const mockContracts = [
      { so_hop_dong: 'HD-2026-001', ma_kh: 'KH001', ten_doi_tac: 'Global Fruit Import Co.', loai_hop_dong: 'Hợp đồng xuất khẩu', gia_tri: '1,250,000,000đ', ngay_ky: '2026-05-01', trang_thai: 'Đang thực hiện', tiens_do_giao_hang: 'Đợt 1: Đã giao 10 tấn ngày 10/05/2026 (Xác nhận); Đợt 2: Dự kiến giao 15 tấn ngày 25/06/2026', vi_pham: 'Không ghi nhận vi phạm', phu_luc: 'Phụ lục số 01: Điều chỉnh tăng khối lượng thêm 5 tấn', tinh_trang_thanh_toan: 'Đợt 1: Đã thanh toán 500tr; Đợt 2: Chưa thanh toán' },
      { so_hop_dong: 'HD-2026-002', ma_kh: 'KH002', ten_doi_tac: 'HTX Nông nghiệp Cái Bè', loai_hop_dong: 'Hợp đồng thu mua', gia_tri: '850,000,000đ', ngay_ky: '2026-05-10', trang_thai: 'Đang thực hiện', tiens_do_giao_hang: 'Đợt 1: Đã nhận đủ hàng ngày 15/05/2026', vi_pham: 'Không ghi nhận vi phạm', phu_luc: 'Không có phụ lục', tinh_trang_thanh_toan: 'Đã thanh toán 100% (850tr)' },
      { so_hop_dong: 'HD-2026-003', ma_kh: 'KH003', ten_doi_tac: 'Tokyo Fresh Agro', loai_hop_dong: 'Hợp đồng xuất khẩu', gia_tri: '2,100,000,000đ', ngay_ky: '2026-05-25', trang_thai: 'Đang chuẩn bị', tiens_do_giao_hang: 'Đợt 1: Dự kiến giao 20 tấn ngày 01/07/2026', vi_pham: 'Không ghi nhận vi phạm', phu_luc: 'Không có phụ lục', tinh_trang_thanh_toan: 'Đã nhận đặt cọc 200tr' },
      { so_hop_dong: 'HD-2026-004', ma_kh: 'KH004', ten_doi_tac: 'Vận tải biển Nam Triệu', loai_hop_dong: 'Hợp đồng nguyên tắc vận chuyển', gia_tri: 'Theo bảng giá năm 2026', ngay_ky: '2026-01-01', trang_thai: 'Đang hiệu lực', tiens_do_giao_hang: 'Thực hiện vận chuyển theo từng chuyến yêu cầu', vi_pham: 'Chậm trễ chuyến xe VC-101 ngày 16/06 (Đã cảnh báo & phạt 5tr)', phu_luc: 'Phụ lục 01: Bổ sung xe lạnh container 15 tấn', tinh_trang_thanh_toan: 'Thanh toán gối đầu theo tháng' }
    ];

    for (const c of mockContracts) {
      await pool.query(
        'INSERT INTO hop_dong (so_hop_dong, ma_kh, ten_doi_tac, loai_hop_dong, gia_tri, ngay_ky, trang_thai, tiens_do_giao_hang, vi_pham, phu_luc, tinh_trang_thanh_toan) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [c.so_hop_dong, c.ma_kh, c.ten_doi_tac, c.loai_hop_dong, c.gia_tri, c.ngay_ky, c.trang_thai, c.tiens_do_giao_hang, c.vi_pham, c.phu_luc, c.tinh_trang_thanh_toan]
      );
    }
    console.log(`Seeded ${mockContracts.length} contract records`);

    // Insert hang_loi records based on traceability logs
    const errorTypes = ['Tồn đọng dư lượng hóa chất', 'Phát hiện sinh vật KDTV'];
    const staffNames = ['Lê Hoàng Chi', 'Hoàng Kim Anh'];
    let errorCounter = 0;
    for (const t of traceability) {
      if (t.ket_qua_kiem_dich === 'Không đạt') {
        const errorType = errorTypes[errorCounter % 2];
        const staff = staffNames[errorCounter % 2];
        const maLoi = `LHL-${100 + errorCounter}`;
        const detectDate = t.ngay_thu_hoach; // detect around harvest time
        await pool.query(
          'INSERT INTO hang_loi (ma_loi, id_lo_hang, ma_puc, loai_loi, ngay_phat_hien, nguoi_phu_trach, trang_thai, ket_qua_kiem_tra_lai) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [maLoi, t.id, t.ma_puc, errorType, detectDate, staff, 'Đang xử lý', 'Chưa kiểm tra lại']
        );
        errorCounter++;
      }
    }
    console.log(`Seeded ${errorCounter} faulty shipment records (hang_loi)`);

    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seed();
}

module.exports = { customers, personnel, traceability, warehouses };
