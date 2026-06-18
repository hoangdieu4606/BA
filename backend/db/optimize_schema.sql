ALTER TABLE hop_dong ADD COLUMN IF NOT EXISTS ma_kh VARCHAR(10);

UPDATE hop_dong
SET ma_kh = CASE so_hop_dong
  WHEN 'HD-2026-001' THEN 'KH001'
  WHEN 'HD-2026-002' THEN 'KH002'
  WHEN 'HD-2026-003' THEN 'KH003'
  WHEN 'HD-2026-004' THEN 'KH004'
  ELSE ma_kh
END
WHERE ma_kh IS NULL;

CREATE TABLE IF NOT EXISTS nhan_vien_vung_trong (
  ma_nv VARCHAR(10) NOT NULL REFERENCES nhan_vien(ma_nv) ON DELETE CASCADE,
  ma_puc VARCHAR(50) NOT NULL REFERENCES vung_trong(ma_puc) ON UPDATE CASCADE ON DELETE CASCADE,
  vai_tro VARCHAR(100),
  PRIMARY KEY (ma_nv, ma_puc)
);

CREATE TABLE IF NOT EXISTS nhan_vien_kho (
  ma_nv VARCHAR(10) NOT NULL REFERENCES nhan_vien(ma_nv) ON DELETE CASCADE,
  ma_kho VARCHAR(10) NOT NULL REFERENCES kho_bao_quan(ma_kho) ON UPDATE CASCADE ON DELETE CASCADE,
  vai_tro VARCHAR(100),
  PRIMARY KEY (ma_nv, ma_kho)
);

INSERT INTO nhan_vien_vung_trong (ma_nv, ma_puc, vai_tro)
SELECT n.ma_nv, n.vung_trong_phu_trach, n.chuc_vu
FROM nhan_vien n
JOIN vung_trong v ON v.ma_puc = n.vung_trong_phu_trach
WHERE n.vung_trong_phu_trach IS NOT NULL
  AND n.vung_trong_phu_trach <> ''
  AND n.vung_trong_phu_trach <> 'Chưa phân công'
ON CONFLICT (ma_nv, ma_puc) DO UPDATE SET vai_tro = EXCLUDED.vai_tro;

INSERT INTO nhan_vien_kho (ma_nv, ma_kho, vai_tro)
SELECT n.ma_nv, n.kho_phu_trach, n.chuc_vu
FROM nhan_vien n
JOIN kho_bao_quan k ON k.ma_kho = n.kho_phu_trach
WHERE n.kho_phu_trach IS NOT NULL
  AND n.kho_phu_trach <> ''
  AND n.kho_phu_trach <> 'Chưa phân công'
ON CONFLICT (ma_nv, ma_kho) DO UPDATE SET vai_tro = EXCLUDED.vai_tro;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'truy_xuat_id_ma_puc_uniq') THEN
    ALTER TABLE truy_xuat_nguon_goc
      ADD CONSTRAINT truy_xuat_id_ma_puc_uniq UNIQUE (id, ma_puc);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hop_dong_ma_kh_fkey') THEN
    ALTER TABLE hop_dong
      ADD CONSTRAINT hop_dong_ma_kh_fkey
      FOREIGN KEY (ma_kh)
      REFERENCES khach_hang(ma_kh)
      ON UPDATE CASCADE
      ON DELETE SET NULL
      NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hang_loi_lo_hang_fk') THEN
    ALTER TABLE hang_loi
      ADD CONSTRAINT hang_loi_lo_hang_fk
      FOREIGN KEY (id_lo_hang, ma_puc)
      REFERENCES truy_xuat_nguon_goc(id, ma_puc)
      ON UPDATE CASCADE
      ON DELETE CASCADE
      NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'kho_bao_quan_capacity_chk') THEN
    ALTER TABLE kho_bao_quan
      ADD CONSTRAINT kho_bao_quan_capacity_chk
      CHECK (suc_chua_con_trong <= suc_chua_lon_nhat)
      NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'truy_xuat_khoi_luong_chk') THEN
    ALTER TABLE truy_xuat_nguon_goc
      ADD CONSTRAINT truy_xuat_khoi_luong_chk
      CHECK (khoi_luong_dong_goi IS NULL OR khoi_luong_lo_hang IS NULL OR khoi_luong_dong_goi <= khoi_luong_lo_hang)
      NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_hop_dong_ma_kh ON hop_dong(ma_kh);
CREATE INDEX IF NOT EXISTS idx_truy_xuat_ma_puc ON truy_xuat_nguon_goc(ma_puc);
CREATE INDEX IF NOT EXISTS idx_phieu_nhap_id_lo_hang ON phieu_nhap_kho(id_lo_hang);
CREATE INDEX IF NOT EXISTS idx_phieu_nhap_ma_kho ON phieu_nhap_kho(ma_kho);
CREATE INDEX IF NOT EXISTS idx_hang_loi_id_lo_hang ON hang_loi(id_lo_hang);
CREATE INDEX IF NOT EXISTS idx_hang_loi_ma_puc ON hang_loi(ma_puc);
CREATE INDEX IF NOT EXISTS idx_nhan_vien_vung_trong_ma_puc ON nhan_vien_vung_trong(ma_puc);
CREATE INDEX IF NOT EXISTS idx_nhan_vien_kho_ma_kho ON nhan_vien_kho(ma_kho);

COMMENT ON TABLE truy_xuat_nguon_goc IS 'Bảng lô hàng và trạng thái truy xuất nguồn gốc; id chính là mã lô hàng.';
COMMENT ON COLUMN truy_xuat_nguon_goc.id IS 'Mã lô hàng.';
COMMENT ON TABLE nhan_vien_vung_trong IS 'Bảng liên kết nhiều-nhiều giữa nhân viên và vùng trồng phụ trách.';
COMMENT ON TABLE nhan_vien_kho IS 'Bảng liên kết nhiều-nhiều giữa nhân viên và kho phụ trách.';
