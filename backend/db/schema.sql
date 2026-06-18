DROP TABLE IF EXISTS nhan_vien_kho;
DROP TABLE IF EXISTS nhan_vien_vung_trong;
DROP TABLE IF EXISTS phieu_nhap_kho;
DROP TABLE IF EXISTS hang_loi;
DROP TABLE IF EXISTS truy_xuat_nguon_goc;
DROP TABLE IF EXISTS kho_bao_quan;
DROP TABLE IF EXISTS hop_dong;
DROP TABLE IF EXISTS vung_trong;
DROP TABLE IF EXISTS nhan_vien;
DROP TABLE IF EXISTS khach_hang;

CREATE TABLE khach_hang (
  ma_kh VARCHAR(10) PRIMARY KEY,
  ten_kh VARCHAR(100) NOT NULL,
  dia_chi TEXT,
  quoc_gia VARCHAR(50) NOT NULL,
  sdt VARCHAR(20),
  email VARCHAR(100),
  CONSTRAINT khach_hang_email_format_chk
    CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

CREATE TABLE nhan_vien (
  ma_nv VARCHAR(10) PRIMARY KEY,
  ten_nv VARCHAR(100) NOT NULL,
  tuoi INT CHECK (tuoi IS NULL OR tuoi BETWEEN 16 AND 80),
  suc_khoe VARCHAR(100),
  dang_tap_huan VARCHAR(10) CHECK (dang_tap_huan IS NULL OR dang_tap_huan IN ('Có', 'Không')),
  bo_phan VARCHAR(100),
  chuc_vu VARCHAR(100),
  sdt VARCHAR(20),
  email VARCHAR(100),
  vung_trong_phu_trach VARCHAR(50),
  kho_phu_trach VARCHAR(50),
  kiem_dinh_chat_luong VARCHAR(100),
  ket_qua_cong_viec TEXT,
  CONSTRAINT nhan_vien_email_format_chk
    CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

CREATE TABLE vung_trong (
  ma_puc VARCHAR(50) PRIMARY KEY,
  ten VARCHAR(100) NOT NULL,
  ten_vuon VARCHAR(100) NOT NULL,
  dia_chi TEXT NOT NULL
);

CREATE TABLE kho_bao_quan (
  ma_kho VARCHAR(10) PRIMARY KEY,
  ten_kho VARCHAR(100) NOT NULL,
  loai_kho VARCHAR(50) NOT NULL CHECK (loai_kho IN ('Đông', 'Mát')),
  suc_chua_lon_nhat NUMERIC NOT NULL CHECK (suc_chua_lon_nhat >= 0),
  suc_chua_con_trong NUMERIC NOT NULL CHECK (suc_chua_con_trong >= 0),
  tinh_trang_ve_sinh VARCHAR(50) DEFAULT 'Chưa đạt'
    CHECK (tinh_trang_ve_sinh IN ('Đạt', 'Chưa đạt')),
  nhiet_do NUMERIC NOT NULL,
  CONSTRAINT kho_bao_quan_capacity_chk
    CHECK (suc_chua_con_trong <= suc_chua_lon_nhat)
);

CREATE TABLE hop_dong (
  so_hop_dong VARCHAR(50) PRIMARY KEY,
  ma_kh VARCHAR(10) REFERENCES khach_hang(ma_kh) ON UPDATE CASCADE ON DELETE SET NULL,
  ten_doi_tac VARCHAR(100) NOT NULL,
  loai_hop_dong VARCHAR(50) NOT NULL
    CHECK (loai_hop_dong IN ('Hợp đồng thu mua', 'Hợp đồng xuất khẩu', 'Hợp đồng nguyên tắc vận chuyển')),
  gia_tri VARCHAR(50) NOT NULL,
  ngay_ky VARCHAR(10) NOT NULL CHECK (ngay_ky ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  trang_thai VARCHAR(50) NOT NULL
    CHECK (trang_thai IN ('Đang chuẩn bị', 'Đang thực hiện', 'Đang hiệu lực', 'Đã hoàn thành', 'Đã hủy')),
  tiens_do_giao_hang TEXT,
  vi_pham TEXT,
  phu_luc TEXT,
  tinh_trang_thanh_toan TEXT
);

CREATE TABLE truy_xuat_nguon_goc (
  id VARCHAR(10) PRIMARY KEY,
  ma_puc VARCHAR(50) NOT NULL REFERENCES vung_trong(ma_puc) ON UPDATE CASCADE,
  ngay_thu_hoach VARCHAR(10) NOT NULL CHECK (ngay_thu_hoach ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  lan_phun_thuoc_gan_nhat VARCHAR(10) NOT NULL CHECK (lan_phun_thuoc_gan_nhat ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  cach_ly VARCHAR(10) CHECK (cach_ly IS NULL OR cach_ly IN ('Có', 'Không')),
  loai VARCHAR(50) CHECK (loai IS NULL OR loai IN ('Trái tươi xuất khẩu', 'Nguyên trái đông lạnh', 'Lột múi cơm', 'Sấy khô')),
  khoi_luong_lo_hang NUMERIC CHECK (khoi_luong_lo_hang IS NULL OR khoi_luong_lo_hang >= 0),
  khoi_luong_dong_goi NUMERIC CHECK (khoi_luong_dong_goi IS NULL OR khoi_luong_dong_goi >= 0),
  noi_xuat_khau VARCHAR(100),
  ten_co_so_dong_goi VARCHAR(100),
  ma_phc VARCHAR(50),
  ket_qua_kiem_dich VARCHAR(50) CHECK (ket_qua_kiem_dich IS NULL OR ket_qua_kiem_dich IN ('Đạt', 'Không đạt')),
  CONSTRAINT truy_xuat_khoi_luong_chk
    CHECK (khoi_luong_dong_goi IS NULL OR khoi_luong_lo_hang IS NULL OR khoi_luong_dong_goi <= khoi_luong_lo_hang),
  CONSTRAINT truy_xuat_id_ma_puc_uniq UNIQUE (id, ma_puc)
);

CREATE TABLE phieu_nhap_kho (
  ma_phieu VARCHAR(20) PRIMARY KEY,
  id_lo_hang VARCHAR(10) REFERENCES truy_xuat_nguon_goc(id) ON DELETE CASCADE,
  ma_kho VARCHAR(10) REFERENCES kho_bao_quan(ma_kho) ON DELETE CASCADE,
  ngay_nhap VARCHAR(10) NOT NULL CHECK (ngay_nhap ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  khoi_luong NUMERIC NOT NULL CHECK (khoi_luong > 0),
  vi_tri_luu_tru VARCHAR(100)
);

CREATE TABLE hang_loi (
  ma_loi VARCHAR(20) PRIMARY KEY,
  id_lo_hang VARCHAR(10) NOT NULL,
  ma_puc VARCHAR(50) NOT NULL,
  loai_loi VARCHAR(100) NOT NULL
    CHECK (loai_loi IN ('Tồn đọng dư lượng hóa chất', 'Phát hiện sinh vật KDTV', 'Lỗi tem nhãn / Bao bì', 'Khác')),
  ngay_phat_hien VARCHAR(10) NOT NULL CHECK (ngay_phat_hien ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  nguoi_phu_trach VARCHAR(100) NOT NULL,
  trang_thai VARCHAR(50) DEFAULT 'Đang xử lý'
    CHECK (trang_thai IN ('Đang xử lý', 'Đã xử lý xong', 'Đã hủy')),
  ket_qua_kiem_tra_lai VARCHAR(100) DEFAULT 'Chưa kiểm tra lại'
    CHECK (ket_qua_kiem_tra_lai IN ('Chưa kiểm tra lại', 'Đạt', 'Không đạt')),
  CONSTRAINT hang_loi_lo_hang_fk
    FOREIGN KEY (id_lo_hang, ma_puc)
    REFERENCES truy_xuat_nguon_goc(id, ma_puc)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE nhan_vien_vung_trong (
  ma_nv VARCHAR(10) NOT NULL REFERENCES nhan_vien(ma_nv) ON DELETE CASCADE,
  ma_puc VARCHAR(50) NOT NULL REFERENCES vung_trong(ma_puc) ON UPDATE CASCADE ON DELETE CASCADE,
  vai_tro VARCHAR(100),
  PRIMARY KEY (ma_nv, ma_puc)
);

CREATE TABLE nhan_vien_kho (
  ma_nv VARCHAR(10) NOT NULL REFERENCES nhan_vien(ma_nv) ON DELETE CASCADE,
  ma_kho VARCHAR(10) NOT NULL REFERENCES kho_bao_quan(ma_kho) ON UPDATE CASCADE ON DELETE CASCADE,
  vai_tro VARCHAR(100),
  PRIMARY KEY (ma_nv, ma_kho)
);

CREATE INDEX idx_hop_dong_ma_kh ON hop_dong(ma_kh);
CREATE INDEX idx_truy_xuat_ma_puc ON truy_xuat_nguon_goc(ma_puc);
CREATE INDEX idx_phieu_nhap_id_lo_hang ON phieu_nhap_kho(id_lo_hang);
CREATE INDEX idx_phieu_nhap_ma_kho ON phieu_nhap_kho(ma_kho);
CREATE INDEX idx_hang_loi_id_lo_hang ON hang_loi(id_lo_hang);
CREATE INDEX idx_hang_loi_ma_puc ON hang_loi(ma_puc);
CREATE INDEX idx_nhan_vien_vung_trong_ma_puc ON nhan_vien_vung_trong(ma_puc);
CREATE INDEX idx_nhan_vien_kho_ma_kho ON nhan_vien_kho(ma_kho);

COMMENT ON TABLE truy_xuat_nguon_goc IS 'Bảng lô hàng và trạng thái truy xuất nguồn gốc; id chính là mã lô hàng.';
COMMENT ON COLUMN truy_xuat_nguon_goc.id IS 'Mã lô hàng.';
COMMENT ON TABLE nhan_vien_vung_trong IS 'Bảng liên kết nhiều-nhiều giữa nhân viên và vùng trồng phụ trách.';
COMMENT ON TABLE nhan_vien_kho IS 'Bảng liên kết nhiều-nhiều giữa nhân viên và kho phụ trách.';
