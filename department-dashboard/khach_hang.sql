-- Bảng thông tin khách hàng nhập khẩu
CREATE TABLE khach_hang (
    ma_kh VARCHAR(10) PRIMARY KEY,
    ten_kh VARCHAR(100) NOT NULL,
    quoc_gia VARCHAR(50) NOT NULL
);

INSERT INTO khach_hang VALUES ('KH001', 'Guangzhou Fruit Import & Export Co., Ltd.', 'Trung Quốc');
INSERT INTO khach_hang VALUES ('KH002', 'Shenzhen Fresh Trade Co.', 'Trung Quốc');
INSERT INTO khach_hang VALUES ('KH003', 'Shanghai Xinlian Import Co.', 'Trung Quốc');
INSERT INTO khach_hang VALUES ('KH004', 'Tokyo Fresh Fruits Co., Ltd.', 'Nhật Bản');
INSERT INTO khach_hang VALUES ('KH005', 'Seoul Mart Corporation', 'Hàn Quốc');
