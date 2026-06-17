-- Bảng thông tin nhân viên giám sát đóng gói/kiểm định
CREATE TABLE nhan_vien (
    ma_nv VARCHAR(10) PRIMARY KEY,
    ten_nv VARCHAR(100) NOT NULL
);

INSERT INTO nhan_vien VALUES ('NV001', 'Nguyễn Văn An');
INSERT INTO nhan_vien VALUES ('NV002', 'Trần Thị Bình');
INSERT INTO nhan_vien VALUES ('NV003', 'Lê Hoàng Chi');
INSERT INTO nhan_vien VALUES ('NV004', 'Phạm Quốc Đạt');
INSERT INTO nhan_vien VALUES ('NV005', 'Hoàng Kim Anh');
INSERT INTO nhan_vien VALUES ('NV006', 'Vũ Tiến Đức');
INSERT INTO nhan_vien VALUES ('NV007', 'Ngô Quốc Huy');
INSERT INTO nhan_vien VALUES ('NV008', 'Đỗ Minh Khang');
INSERT INTO nhan_vien VALUES ('NV009', 'Bùi Phương Linh');
INSERT INTO nhan_vien VALUES ('NV010', 'Nguyễn Tiến Dũng');
