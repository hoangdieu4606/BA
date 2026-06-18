const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { customers, personnel, traceability, warehouses } = require('./seed');

// Extract unique growing areas dynamically from initial traceability mock data
const uniquePucs = {};
(traceability || []).forEach(t => {
  if (t.ma_puc && !uniquePucs[t.ma_puc]) {
    const representativeName = t.ten_vuon.startsWith("Vườn ") ? t.ten_vuon.substring(5) : t.ten_vuon;
    uniquePucs[t.ma_puc] = {
      ma_puc: t.ma_puc,
      ten: representativeName,
      ten_vuon: t.ten_vuon,
      dia_chi: t.dia_chi_vuon
    };
  }
});

// Generate mock storage entry receipts fallback dynamically
const mockReceipts = [];
let receiptCounter = 1;
(traceability || []).forEach(t => {
  if (t.ket_qua_kiem_dich === 'Đạt' && t.khoi_luong_dong_goi !== null && t.khoi_luong_dong_goi !== '') {
    const maKho = t.id.includes('BG') || t.id.includes('HG') ? 'KHO-01' : 'KHO-02';
    const harvestDate = new Date(t.ngay_thu_hoach);
    harvestDate.setDate(harvestDate.getDate() + 1);
    const entryDate = harvestDate.toISOString().split('T')[0];
    const viTri = `Khu-${t.id.split('-')[1] || 'A1'}`;
    mockReceipts.push({
      ma_phieu: `PNK-${String(receiptCounter).padStart(4, '0')}`,
      id_lo_hang: t.id,
      ma_kho: maKho,
      ngay_nhap: entryDate,
      khoi_luong: parseFloat(t.khoi_luong_dong_goi),
      vi_tri_luu_tru: viTri
    });
    receiptCounter++;
  }
});

// In-memory fallback database state populated with full mock datasets
let dbFallback = {
  customers: customers || [],
  personnel: (personnel || []).map(p => ({
    ma_nv: p.ma_nv,
    ten_nv: p.ten_nv,
    tuoi: p.tuoi,
    suc_khoe: p.suc_khoe,
    dang_tap_huan: p.dang_tap_huan,
    bo_phan: p.bo_phan,
    chuc_vu: p.chuc_vu,
    sdt: p.sdt,
    email: p.email,
    vung_trong_phu_trach: p.vung_trong_phu_trach,
    kho_phu_trach: p.kho_phu_trach,
    kiem_dinh_chat_luong: p.kiem_dinh_chat_luong,
    ket_qua_cong_viec: p.ket_qua_cong_viec
  })),
  vung_trong: Object.values(uniquePucs),
  warehouses: (warehouses || []).map(w => ({
    ma_kho: w.ma_kho,
    ten_kho: w.ten_kho,
    loai_kho: w.loai_kho,
    suc_chua_lon_nhat: w.suc_chua_lon_nhat,
    suc_chua_con_trong: w.suc_chua_con_trong,
    tinh_trang_ve_sinh: w.tinh_trang_ve_sinh,
    nhiet_do: w.nhiet_do
  })),
  receipts: mockReceipts,
  traceability: (traceability || []).map(t => ({
    id: t.id,
    ma_puc: t.ma_puc,
    ngay_thu_hoach: t.ngay_thu_hoach,
    lan_phun_thuoc_gan_nhat: t.lan_phun_thuoc_gan_nhat,
    cach_ly: t.cach_ly,
    loai: t.loai,
    khoi_luong_lo_hang: t.khoi_luong_lo_hang,
    khoi_luong_dong_goi: t.khoi_luong_dong_goi,
    noi_xuat_khau: t.noi_xuat_khau,
    ten_co_so_dong_goi: t.ten_co_so_dong_goi,
    ma_phc: t.ma_phc,
    ket_qua_kiem_dich: t.ket_qua_kiem_dich
  })),
  contracts: [
    { so_hop_dong: 'HD-2026-001', ma_kh: 'KH001', ten_doi_tac: 'Global Fruit Import Co.', loai_hop_dong: 'Hợp đồng xuất khẩu', gia_tri: '1,250,000,000đ', ngay_ky: '2026-05-01', trang_thai: 'Đang thực hiện', tiens_do_giao_hang: 'Đợt 1: Đã giao 10 tấn ngày 10/05/2026 (Xác nhận); Đợt 2: Dự kiến giao 15 tấn ngày 25/06/2026', vi_pham: 'Không ghi nhận vi phạm', phu_luc: 'Phụ lục số 01: Điều chỉnh tăng khối lượng thêm 5 tấn', tinh_trang_thanh_toan: 'Đợt 1: Đã thanh toán 500tr; Đợt 2: Chưa thanh toán' },
    { so_hop_dong: 'HD-2026-002', ma_kh: 'KH002', ten_doi_tac: 'HTX Nông nghiệp Cái Bè', loai_hop_dong: 'Hợp đồng thu mua', gia_tri: '850,000,000đ', ngay_ky: '2026-05-10', trang_thai: 'Đang thực hiện', tiens_do_giao_hang: 'Đợt 1: Đã nhận đủ hàng ngày 15/05/2026', vi_pham: 'Không ghi nhận vi phạm', phu_luc: 'Không có phụ lục', tinh_trang_thanh_toan: 'Đã thanh toán 100% (850tr)' },
    { so_hop_dong: 'HD-2026-003', ma_kh: 'KH003', ten_doi_tac: 'Tokyo Fresh Agro', loai_hop_dong: 'Hợp đồng xuất khẩu', gia_tri: '2,100,000,000đ', ngay_ky: '2026-05-25', trang_thai: 'Đang chuẩn bị', tiens_do_giao_hang: 'Đợt 1: Dự kiến giao 20 tấn ngày 01/07/2026', vi_pham: 'Không ghi nhận vi phạm', phu_luc: 'Không có phụ lục', tinh_trang_thanh_toan: 'Đã nhận đặt cọc 200tr' },
    { so_hop_dong: 'HD-2026-004', ma_kh: 'KH004', ten_doi_tac: 'Vận tải biển Nam Triệu', loai_hop_dong: 'Hợp đồng nguyên tắc vận chuyển', gia_tri: 'Theo bảng giá năm 2026', ngay_ky: '2026-01-01', trang_thai: 'Đang hiệu lực', tiens_do_giao_hang: 'Thực hiện vận chuyển theo từng chuyến yêu cầu', vi_pham: 'Chậm trễ chuyến xe VC-101 ngày 16/06 (Đã cảnh báo & phạt 5tr)', phu_luc: 'Phụ lục 01: Bổ sung xe lạnh container 15 tấn', tinh_trang_thanh_toan: 'Thanh toán gối đầu theo tháng' }
  ],
  faultyShipments: (traceability || [])
    .filter(t => t.ket_qua_kiem_dich === 'Không đạt')
    .map((t, idx) => ({
      ma_loi: `LHL-${100 + idx}`,
      id_lo_hang: t.id,
      ma_puc: t.ma_puc,
      loai_loi: idx % 2 === 0 ? 'Tồn đọng dư lượng hóa chất' : 'Phát hiện sinh vật KDTV',
      ngay_phat_hien: t.ngay_thu_hoach,
      nguoi_phu_trach: idx % 2 === 0 ? 'Lê Hoàng Chi' : 'Hoàng Kim Anh',
      trang_thai: 'Đang xử lý',
      ket_qua_kiem_tra_lai: 'Chưa kiểm tra lại'
    }))
};

// Flag to track database health
let useFallbackDb = false;

// Helper function to query the DB with safety fallback
async function safeQuery(queryText, params) {
  if (useFallbackDb) {
    throw new Error('Database is in fallback mode');
  }
  try {
    return await pool.query(queryText, params);
  } catch (err) {
    console.warn('⚠️ Database connection issue. Switching temporarily to in-memory fallback database.', err.message);
    useFallbackDb = true;
    throw err;
  }
}

async function ensureContractCustomerLinkSchema() {
  if (useFallbackDb) return;

  await pool.query('ALTER TABLE hop_dong ADD COLUMN IF NOT EXISTS ma_kh VARCHAR(10)');
  await pool.query(`
    UPDATE hop_dong
    SET ma_kh = CASE so_hop_dong
      WHEN 'HD-2026-001' THEN 'KH001'
      WHEN 'HD-2026-002' THEN 'KH002'
      WHEN 'HD-2026-003' THEN 'KH003'
      WHEN 'HD-2026-004' THEN 'KH004'
      ELSE ma_kh
    END
    WHERE ma_kh IS NULL
  `);
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'hop_dong_ma_kh_fkey'
      ) THEN
        ALTER TABLE hop_dong
        ADD CONSTRAINT hop_dong_ma_kh_fkey
        FOREIGN KEY (ma_kh)
        REFERENCES khach_hang(ma_kh)
        ON UPDATE CASCADE
        ON DELETE SET NULL;
      END IF;
    END $$;
  `);
}

// Get all traceability logs (joined with vung_trong details)
app.get('/api/traceability', async (req, res) => {
  try {
    const result = await safeQuery(`
      SELECT t.*, v.ten_vuon, v.dia_chi AS dia_chi_vuon
      FROM truy_xuat_nguon_goc t
      LEFT JOIN vung_trong v ON t.ma_puc = v.ma_puc
      ORDER BY t.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    const merged = dbFallback.traceability.map(t => {
      const v = dbFallback.vung_trong.find(x => x.ma_puc === t.ma_puc) || {};
      return {
        ...t,
        ten_vuon: v.ten_vuon || '',
        dia_chi_vuon: v.dia_chi || ''
      };
    });
    res.json(merged);
  }
});

// Create a new traceability record
app.post('/api/traceability', async (req, res) => {
  const data = req.body;
  if (!data.id || !data.ma_puc) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Ensure PUC is linked/created in vung_trong
  try {
    const checkPuc = await pool.query('SELECT * FROM vung_trong WHERE ma_puc = $1', [data.ma_puc]);
    if (checkPuc.rows.length === 0) {
      await pool.query('INSERT INTO vung_trong (ma_puc, ten, ten_vuon, dia_chi) VALUES ($1, $2, $3, $4)', [
        data.ma_puc,
        data.ten_vuon ? (data.ten_vuon.startsWith('Vườn ') ? data.ten_vuon.substring(5) : data.ten_vuon) : 'Chủ vườn',
        data.ten_vuon || 'Vườn mới',
        data.dia_chi_vuon || 'Địa chỉ mới'
      ]);
    }
  } catch (e) {
    const exists = dbFallback.vung_trong.find(x => x.ma_puc === data.ma_puc);
    if (!exists) {
      dbFallback.vung_trong.push({
        ma_puc: data.ma_puc,
        ten: data.ten_vuon ? (data.ten_vuon.startsWith('Vườn ') ? data.ten_vuon.substring(5) : data.ten_vuon) : 'Chủ vườn',
        ten_vuon: data.ten_vuon || 'Vườn mới',
        dia_chi: data.dia_chi_vuon || 'Địa chỉ mới'
      });
    }
  }

  try {
    await safeQuery(`
      INSERT INTO truy_xuat_nguon_goc (
        id, ma_puc, ngay_thu_hoach, lan_phun_thuoc_gan_nhat,
        cach_ly, loai, khoi_luong_lo_hang, khoi_luong_dong_goi, noi_xuat_khau,
        ten_co_so_dong_goi, ma_phc, ket_qua_kiem_dich
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      data.id, data.ma_puc, data.ngay_thu_hoach, data.lan_phun_thuoc_gan_nhat,
      data.cach_ly, data.loai, data.khoi_luong_lo_hang, data.khoi_luong_dong_goi, data.noi_xuat_khau,
      data.ten_co_so_dong_goi, data.ma_phc, data.ket_qua_kiem_dich
    ]);
    res.status(201).json(data);
  } catch (err) {
    // Add to in-memory fallback
    const exists = dbFallback.traceability.find(x => x.id === data.id);
    if (!exists) {
      dbFallback.traceability.unshift({
        id: data.id,
        ma_puc: data.ma_puc,
        ngay_thu_hoach: data.ngay_thu_hoach,
        lan_phun_thuoc_gan_nhat: data.lan_phun_thuoc_gan_nhat,
        cach_ly: data.cach_ly,
        loai: data.loai,
        khoi_luong_lo_hang: data.khoi_luong_lo_hang,
        khoi_luong_dong_goi: data.khoi_luong_dong_goi,
        noi_xuat_khau: data.noi_xuat_khau,
        ten_co_so_dong_goi: data.ten_co_so_dong_goi,
        ma_phc: data.ma_phc,
        ket_qua_kiem_dich: data.ket_qua_kiem_dich
      });
    }
    res.status(201).json(data);
  }
});

// Update a traceability record
app.put('/api/traceability/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  // Make sure PUC exists/updates in vung_trong
  try {
    const checkPuc = await pool.query('SELECT * FROM vung_trong WHERE ma_puc = $1', [data.ma_puc]);
    if (checkPuc.rows.length === 0) {
      await pool.query('INSERT INTO vung_trong (ma_puc, ten, ten_vuon, dia_chi) VALUES ($1, $2, $3, $4)', [
        data.ma_puc,
        data.ten_vuon ? (data.ten_vuon.startsWith('Vườn ') ? data.ten_vuon.substring(5) : data.ten_vuon) : 'Chủ vườn',
        data.ten_vuon || 'Vườn mới',
        data.dia_chi_vuon || 'Địa chỉ mới'
      ]);
    } else {
      // update details if provided
      if (data.ten_vuon || data.dia_chi_vuon) {
        await pool.query('UPDATE vung_trong SET ten_vuon = COALESCE($1, ten_vuon), dia_chi = COALESCE($2, dia_chi) WHERE ma_puc = $3', [
          data.ten_vuon,
          data.dia_chi_vuon,
          data.ma_puc
        ]);
      }
    }
  } catch (e) {
    const exists = dbFallback.vung_trong.find(x => x.ma_puc === data.ma_puc);
    if (!exists) {
      dbFallback.vung_trong.push({
        ma_puc: data.ma_puc,
        ten: data.ten_vuon ? (data.ten_vuon.startsWith('Vườn ') ? data.ten_vuon.substring(5) : data.ten_vuon) : 'Chủ vườn',
        ten_vuon: data.ten_vuon || 'Vườn mới',
        dia_chi: data.dia_chi_vuon || 'Địa chỉ mới'
      });
    } else {
      if (data.ten_vuon) exists.ten_vuon = data.ten_vuon;
      if (data.dia_chi_vuon) exists.dia_chi = data.dia_chi_vuon;
    }
  }

  try {
    await safeQuery(`
      UPDATE truy_xuat_nguon_goc SET
        ma_puc = $1, ngay_thu_hoach = $2, lan_phun_thuoc_gan_nhat = $3,
        cach_ly = $4, loai = $5, khoi_luong_lo_hang = $6, khoi_luong_dong_goi = $7,
        noi_xuat_khau = $8, ten_co_so_dong_goi = $9, ma_phc = $10, ket_qua_kiem_dich = $11
      WHERE id = $12
    `, [
      data.ma_puc, data.ngay_thu_hoach, data.lan_phun_thuoc_gan_nhat,
      data.cach_ly, data.loai, data.khoi_luong_lo_hang, data.khoi_luong_dong_goi,
      data.noi_xuat_khau, data.ten_co_so_dong_goi, data.ma_phc, data.ket_qua_kiem_dich,
      id
    ]);
    res.json(data);
  } catch (err) {
    // Update in-memory fallback
    const idx = dbFallback.traceability.findIndex(x => x.id === id);
    if (idx !== -1) {
      dbFallback.traceability[idx] = {
        ...dbFallback.traceability[idx],
        ma_puc: data.ma_puc,
        ngay_thu_hoach: data.ngay_thu_hoach,
        lan_phun_thuoc_gan_nhat: data.lan_phun_thuoc_gan_nhat,
        cach_ly: data.cach_ly,
        loai: data.loai,
        khoi_luong_lo_hang: data.khoi_luong_lo_hang,
        khoi_luong_dong_goi: data.khoi_luong_dong_goi,
        noi_xuat_khau: data.noi_xuat_khau,
        ten_co_so_dong_goi: data.ten_co_so_dong_goi,
        ma_phc: data.ma_phc,
        ket_qua_kiem_dich: data.ket_qua_kiem_dich
      };
    }
    res.json(data);
  }
});

// Delete a traceability record
app.delete('/api/traceability/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await safeQuery('DELETE FROM truy_xuat_nguon_goc WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    dbFallback.traceability = dbFallback.traceability.filter(x => x.id !== id);
    res.json({ success: true });
  }
});

// Get all personnel (employees)
app.get('/api/personnel', async (req, res) => {
  try {
    const result = await safeQuery('SELECT * FROM nhan_vien ORDER BY ma_nv ASC');
    res.json(result.rows);
  } catch (err) {
    res.json(dbFallback.personnel);
  }
});

// Create a new employee (FR27)
app.post('/api/personnel', async (req, res) => {
  const { 
    id, firstName, lastName, tuoi, sucKhoe, dangTapHuan, 
    bo_phan, chuc_vu, sdt, email, vung_trong_phu_trach, 
    kho_phu_trach, kiem_dinh_chat_luong, ket_qua_cong_viec 
  } = req.body;

  if (!id || !firstName) {
    return res.status(400).json({ error: 'Missing required fields: id and firstName' });
  }

  const fullName = lastName ? `${lastName} ${firstName}`.trim() : firstName;

  try {
    const result = await safeQuery(
      `INSERT INTO nhan_vien (
        ma_nv, ten_nv, tuoi, suc_khoe, dang_tap_huan, 
        bo_phan, chuc_vu, sdt, email, 
        vung_trong_phu_trach, kho_phu_trach, kiem_dinh_chat_luong, ket_qua_cong_viec
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        id, fullName, tuoi ? parseInt(tuoi) : null, sucKhoe || null, dangTapHuan || null,
        bo_phan || null, chuc_vu || null, sdt || null, email || null,
        vung_trong_phu_trach || null, kho_phu_trach || null, kiem_dinh_chat_luong || null, ket_qua_cong_viec || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const newEmp = { 
      ma_nv: id, 
      ten_nv: fullName, 
      tuoi: tuoi ? parseInt(tuoi) : null, 
      suc_khoe: sucKhoe || null, 
      dang_tap_huan: dangTapHuan || null,
      bo_phan: bo_phan || null,
      chuc_vu: chuc_vu || null,
      sdt: sdt || null,
      email: email || null,
      vung_trong_phu_trach: vung_trong_phu_trach || null,
      kho_phu_trach: kho_phu_trach || null,
      kiem_dinh_chat_luong: kiem_dinh_chat_luong || null,
      ket_qua_cong_viec: ket_qua_cong_viec || null
    };
    dbFallback.personnel.unshift(newEmp);
    res.status(201).json(newEmp);
  }
});

// Update an employee (FR29, FR31, FR32)
app.put('/api/personnel/:ma_nv', async (req, res) => {
  const { ma_nv } = req.params;
  const { 
    ten_nv, tuoi, suc_khoe, dang_tap_huan, 
    bo_phan, chuc_vu, sdt, email, 
    vung_trong_phu_trach, kho_phu_trach, kiem_dinh_chat_luong, ket_qua_cong_viec 
  } = req.body;

  try {
    await safeQuery(
      `UPDATE nhan_vien SET
        ten_nv = $1, tuoi = $2, suc_khoe = $3, dang_tap_huan = $4,
        bo_phan = $5, chuc_vu = $6, sdt = $7, email = $8,
        vung_trong_phu_trach = $9, kho_phu_trach = $10, kiem_dinh_chat_luong = $11, ket_qua_cong_viec = $12
      WHERE ma_nv = $13`,
      [
        ten_nv, tuoi ? parseInt(tuoi) : null, suc_khoe || null, dang_tap_huan || null,
        bo_phan || null, chuc_vu || null, sdt || null, email || null,
        vung_trong_phu_trach || null, kho_phu_trach || null, kiem_dinh_chat_luong || null, ket_qua_cong_viec || null,
        ma_nv
      ]
    );
    res.json({ 
      ma_nv, ten_nv, tuoi, suc_khoe, dang_tap_huan, 
      bo_phan, chuc_vu, sdt, email, 
      vung_trong_phu_trach, kho_phu_trach, kiem_dinh_chat_luong, ket_qua_cong_viec 
    });
  } catch (err) {
    const idx = dbFallback.personnel.findIndex(x => x.ma_nv === ma_nv);
    if (idx !== -1) {
      dbFallback.personnel[idx] = { 
        ...dbFallback.personnel[idx], 
        ten_nv, tuoi: tuoi ? parseInt(tuoi) : null, suc_khoe, dang_tap_huan,
        bo_phan, chuc_vu, sdt, email,
        vung_trong_phu_trach, kho_phu_trach, kiem_dinh_chat_luong, ket_qua_cong_viec
      };
    }
    res.json({ 
      ma_nv, ten_nv, tuoi, suc_khoe, dang_tap_huan, 
      bo_phan, chuc_vu, sdt, email, 
      vung_trong_phu_trach, kho_phu_trach, kiem_dinh_chat_luong, ket_qua_cong_viec 
    });
  }
});

// Delete an employee (FR30)
app.delete('/api/personnel/:ma_nv', async (req, res) => {
  const { ma_nv } = req.params;
  try {
    await safeQuery('DELETE FROM nhan_vien WHERE ma_nv = $1', [ma_nv]);
    res.json({ success: true });
  } catch (err) {
    dbFallback.personnel = dbFallback.personnel.filter(x => x.ma_nv !== ma_nv);
    res.json({ success: true });
  }
});

// Get all vung_trong (growing areas)
app.get('/api/vung-trong', async (req, res) => {
  try {
    const result = await safeQuery('SELECT * FROM vung_trong ORDER BY ma_puc ASC');
    res.json(result.rows);
  } catch (err) {
    res.json(dbFallback.vung_trong);
  }
});

// Create a new growing area
app.post('/api/vung-trong', async (req, res) => {
  const { ma_puc, ten, ten_vuon, dia_chi } = req.body;
  if (!ma_puc || !ten || !ten_vuon || !dia_chi) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await safeQuery(
      'INSERT INTO vung_trong (ma_puc, ten, ten_vuon, dia_chi) VALUES ($1, $2, $3, $4) RETURNING *',
      [ma_puc, ten, ten_vuon, dia_chi]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const newArea = { ma_puc, ten, ten_vuon, dia_chi };
    const exists = dbFallback.vung_trong.find(x => x.ma_puc === ma_puc);
    if (!exists) {
      dbFallback.vung_trong.push(newArea);
    }
    res.status(201).json(newArea);
  }
});

// Update a growing area
app.put('/api/vung-trong/:ma_puc', async (req, res) => {
  const { ma_puc } = req.params;
  const { ten, ten_vuon, dia_chi } = req.body;

  try {
    await safeQuery(
      'UPDATE vung_trong SET ten = $1, ten_vuon = $2, dia_chi = $3 WHERE ma_puc = $4',
      [ten, ten_vuon, dia_chi, ma_puc]
    );
    res.json({ ma_puc, ten, ten_vuon, dia_chi });
  } catch (err) {
    const idx = dbFallback.vung_trong.findIndex(x => x.ma_puc === ma_puc);
    if (idx !== -1) {
      dbFallback.vung_trong[idx] = { ...dbFallback.vung_trong[idx], ten, ten_vuon, dia_chi };
    }
    res.json({ ma_puc, ten, ten_vuon, dia_chi });
  }
});

// Delete a growing area
app.delete('/api/vung-trong/:ma_puc', async (req, res) => {
  const { ma_puc } = req.params;
  try {
    await safeQuery('DELETE FROM vung_trong WHERE ma_puc = $1', [ma_puc]);
    res.json({ success: true });
  } catch (err) {
    dbFallback.vung_trong = dbFallback.vung_trong.filter(x => x.ma_puc !== ma_puc);
    res.json({ success: true });
  }
});

// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const result = await safeQuery('SELECT * FROM khach_hang ORDER BY ma_kh ASC');
    res.json(result.rows);
  } catch (err) {
    res.json(dbFallback.customers);
  }
});

// Create a new customer
app.post('/api/customers', async (req, res) => {
  const { ma_kh, ten_kh, dia_chi, quoc_gia, sdt, email } = req.body;
  if (!ma_kh || !ten_kh || !quoc_gia) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await safeQuery(
      'INSERT INTO khach_hang (ma_kh, ten_kh, dia_chi, quoc_gia, sdt, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [ma_kh, ten_kh, dia_chi, quoc_gia, sdt, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const newCust = { ma_kh, ten_kh, dia_chi, quoc_gia, sdt, email };
    const exists = dbFallback.customers.find(x => x.ma_kh === ma_kh);
    if (!exists) {
      dbFallback.customers.push(newCust);
    }
    res.status(201).json(newCust);
  }
});

// Update a customer
app.put('/api/customers/:ma_kh', async (req, res) => {
  const { ma_kh } = req.params;
  const { ten_kh, dia_chi, quoc_gia, sdt, email } = req.body;

  try {
    await safeQuery(
      'UPDATE khach_hang SET ten_kh = $1, dia_chi = $2, quoc_gia = $3, sdt = $4, email = $5 WHERE ma_kh = $6',
      [ten_kh, dia_chi, quoc_gia, sdt, email, ma_kh]
    );
    res.json({ ma_kh, ten_kh, dia_chi, quoc_gia, sdt, email });
  } catch (err) {
    const idx = dbFallback.customers.findIndex(x => x.ma_kh === ma_kh);
    if (idx !== -1) {
      dbFallback.customers[idx] = { ...dbFallback.customers[idx], ten_kh, dia_chi, quoc_gia, sdt, email };
    }
    res.json({ ma_kh, ten_kh, dia_chi, quoc_gia, sdt, email });
  }
});

// Delete a customer
app.delete('/api/customers/:ma_kh', async (req, res) => {
  const { ma_kh } = req.params;
  try {
    await safeQuery('DELETE FROM khach_hang WHERE ma_kh = $1', [ma_kh]);
    res.json({ success: true });
  } catch (err) {
    dbFallback.customers = dbFallback.customers.filter(x => x.ma_kh !== ma_kh);
    res.json({ success: true });
  }
});

// Get all warehouses
app.get('/api/warehouses', async (req, res) => {
  try {
    const result = await safeQuery('SELECT * FROM kho_bao_quan ORDER BY ma_kho ASC');
    res.json(result.rows);
  } catch (err) {
    res.json(dbFallback.warehouses);
  }
});

// Update warehouse remaining capacity (Logistics task)
app.put('/api/warehouses/:ma_kho/capacity', async (req, res) => {
  const { ma_kho } = req.params;
  const { suc_chua_con_trong } = req.body;
  const capacity = parseFloat(suc_chua_con_trong);

  try {
    await safeQuery(
      'UPDATE kho_bao_quan SET suc_chua_con_trong = $1 WHERE ma_kho = $2',
      [capacity, ma_kho]
    );
    res.json({ success: true, ma_kho, suc_chua_con_trong: capacity });
  } catch (err) {
    const idx = dbFallback.warehouses.findIndex(w => w.ma_kho === ma_kho);
    if (idx !== -1) {
      dbFallback.warehouses[idx].suc_chua_con_trong = capacity;
    }
    res.json({ success: true, ma_kho, suc_chua_con_trong: capacity });
  }
});

// Update warehouse hygiene status (QA/QC only)
app.put('/api/warehouses/:ma_kho/hygiene', async (req, res) => {
  const { ma_kho } = req.params;
  const { tinh_trang_ve_sinh } = req.body;

  try {
    await safeQuery(
      'UPDATE kho_bao_quan SET tinh_trang_ve_sinh = $1 WHERE ma_kho = $2',
      [tinh_trang_ve_sinh, ma_kho]
    );
    res.json({ success: true, ma_kho, tinh_trang_ve_sinh });
  } catch (err) {
    const idx = dbFallback.warehouses.findIndex(w => w.ma_kho === ma_kho);
    if (idx !== -1) {
      dbFallback.warehouses[idx].tinh_trang_ve_sinh = tinh_trang_ve_sinh;
    }
    res.json({ success: true, ma_kho, tinh_trang_ve_sinh });
  }
});

// Update warehouse general details (FR36)
app.put('/api/warehouses/:ma_kho', async (req, res) => {
  const { ma_kho } = req.params;
  const { ten_kho, loai_kho, suc_chua_lon_nhat, suc_chua_con_trong, tinh_trang_ve_sinh, nhiet_do } = req.body;

  try {
    await safeQuery(
      `UPDATE kho_bao_quan SET
        ten_kho = $1, loai_kho = $2, suc_chua_lon_nhat = $3, suc_chua_con_trong = $4, tinh_trang_ve_sinh = $5, nhiet_do = $6
       WHERE ma_kho = $7`,
      [ten_kho, loai_kho, parseFloat(suc_chua_lon_nhat), parseFloat(suc_chua_con_trong), tinh_trang_ve_sinh, parseFloat(nhiet_do), ma_kho]
    );
    res.json({ success: true, ma_kho, ten_kho, loai_kho, suc_chua_lon_nhat, suc_chua_con_trong, tinh_trang_ve_sinh, nhiet_do });
  } catch (err) {
    const idx = dbFallback.warehouses.findIndex(w => w.ma_kho === ma_kho);
    if (idx !== -1) {
      dbFallback.warehouses[idx] = {
        ...dbFallback.warehouses[idx],
        ten_kho, loai_kho, 
        suc_chua_lon_nhat: parseFloat(suc_chua_lon_nhat), 
        suc_chua_con_trong: parseFloat(suc_chua_con_trong), 
        tinh_trang_ve_sinh, 
        nhiet_do: parseFloat(nhiet_do)
      };
    }
    res.json({ success: true, ma_kho, ten_kho, loai_kho, suc_chua_lon_nhat, suc_chua_con_trong, tinh_trang_ve_sinh, nhiet_do });
  }
});

// Get entry receipts by warehouse
app.get('/api/warehouses/:ma_kho/receipts', async (req, res) => {
  const { ma_kho } = req.params;
  try {
    const result = await safeQuery(
      `SELECT p.*, t.loai AS loai_kho_lo_hang, t.khoi_luong_dong_goi
       FROM phieu_nhap_kho p
       JOIN truy_xuat_nguon_goc t ON p.id_lo_hang = t.id
       WHERE p.ma_kho = $1 ORDER BY p.ma_phieu ASC`,
      [ma_kho]
    );
    res.json(result.rows);
  } catch (err) {
    const filtered = dbFallback.receipts.filter(r => r.ma_kho === ma_kho).map(r => {
      const t = dbFallback.traceability.find(x => x.id === r.id_lo_hang) || {};
      return {
        ...r,
        loai_kho_lo_hang: t.loai || 'Chưa rõ',
        khoi_luong_dong_goi: t.khoi_luong_dong_goi || r.khoi_luong
      };
    });
    res.json(filtered);
  }
});

// Get all entry receipts
app.get('/api/receipts', async (req, res) => {
  try {
    const result = await safeQuery('SELECT * FROM phieu_nhap_kho ORDER BY ma_phieu ASC');
    res.json(result.rows);
  } catch (err) {
    res.json(dbFallback.receipts);
  }
});

// Create a new storage entry receipt (FR33)
app.post('/api/receipts', async (req, res) => {
  const { ma_phieu, id_lo_hang, ma_kho, ngay_nhap, khoi_luong, vi_tri_luu_tru } = req.body;
  if (!ma_phieu || !id_lo_hang || !ma_kho || !ngay_nhap || !khoi_luong) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 1. Enforce conditions: quarantine result must be approved and warehouse hygiene approved
  try {
    const checkShipment = await pool.query('SELECT ket_qua_kiem_dich FROM truy_xuat_nguon_goc WHERE id = $1', [id_lo_hang]);
    const checkWarehouse = await pool.query('SELECT tinh_trang_ve_sinh FROM kho_bao_quan WHERE ma_kho = $1', [ma_kho]);

    if (checkShipment.rows.length === 0 || checkShipment.rows[0].ket_qua_kiem_dich !== 'Đạt') {
      return res.status(400).json({ error: 'Lô hàng chưa đạt kết quả kiểm dịch, không thể nhập kho!' });
    }
    if (checkWarehouse.rows.length === 0 || checkWarehouse.rows[0].tinh_trang_ve_sinh !== 'Đạt') {
      return res.status(400).json({ error: 'Kho chưa đạt điều kiện vệ sinh chuẩn, không thể nhập kho!' });
    }

    const result = await safeQuery(
      'INSERT INTO phieu_nhap_kho (ma_phieu, id_lo_hang, ma_kho, ngay_nhap, khoi_luong, vi_tri_luu_tru) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [ma_phieu, id_lo_hang, ma_kho, ngay_nhap, parseFloat(khoi_luong), vi_tri_luu_tru || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Fallback Logic
    const shipment = dbFallback.traceability.find(t => t.id === id_lo_hang);
    const warehouse = dbFallback.warehouses.find(w => w.ma_kho === ma_kho);

    if (!shipment || shipment.ket_qua_kiem_dich !== 'Đạt') {
      return res.status(400).json({ error: 'Lô hàng chưa đạt kết quả kiểm dịch, không thể nhập kho!' });
    }
    if (!warehouse || warehouse.tinh_trang_ve_sinh !== 'Đạt') {
      return res.status(400).json({ error: 'Kho chưa đạt điều kiện vệ sinh chuẩn, không thể nhập kho!' });
    }

    const newReceipt = { ma_phieu, id_lo_hang, ma_kho, ngay_nhap, khoi_luong: parseFloat(khoi_luong), vi_tri_luu_tru };
    dbFallback.receipts.push(newReceipt);
    res.status(201).json(newReceipt);
  }
});

// Update a storage entry receipt (FR37)
app.put('/api/receipts/:ma_phieu', async (req, res) => {
  const { ma_phieu } = req.params;
  const { khoi_luong, vi_tri_luu_tru, ngay_nhap, ma_kho } = req.body;

  try {
    await safeQuery(
      'UPDATE phieu_nhap_kho SET khoi_luong = $1, vi_tri_luu_tru = $2, ngay_nhap = $3, ma_kho = $4 WHERE ma_phieu = $5',
      [parseFloat(khoi_luong), vi_tri_luu_tru, ngay_nhap, ma_kho, ma_phieu]
    );
    res.json({ success: true, ma_phieu, khoi_luong, vi_tri_luu_tru, ngay_nhap, ma_kho });
  } catch (err) {
    const idx = dbFallback.receipts.findIndex(r => r.ma_phieu === ma_phieu);
    if (idx !== -1) {
      dbFallback.receipts[idx] = { 
        ...dbFallback.receipts[idx], 
        khoi_luong: parseFloat(khoi_luong), 
        vi_tri_luu_tru, 
        ngay_nhap,
        ma_kho
      };
    }
    res.json({ success: true, ma_phieu, khoi_luong, vi_tri_luu_tru, ngay_nhap, ma_kho });
  }
});

// Get all contracts (FR12) - join with khach_hang to get customer info
app.get('/api/contracts', async (req, res) => {
  try {
    await ensureContractCustomerLinkSchema();
    const result = await safeQuery(`
      SELECT h.*, k.ten_kh, k.quoc_gia, k.email AS kh_email
      FROM hop_dong h
      LEFT JOIN khach_hang k ON h.ma_kh = k.ma_kh
      ORDER BY h.so_hop_dong ASC
    `);
    res.json(result.rows);
  } catch (err) {
    // Fallback: manually join customers
    const withCustomer = dbFallback.contracts.map(c => {
      const kh = (dbFallback.customers || []).find(x => x.ma_kh === c.ma_kh) || {};
      return { ...c, ten_kh: kh.ten_kh || null, quoc_gia: kh.quoc_gia || null, kh_email: kh.email || null };
    });
    res.json(withCustomer);
  }
});

// Create a new contract (FR10)
app.post('/api/contracts', async (req, res) => {
  const { so_hop_dong, ma_kh, ten_doi_tac, loai_hop_dong, gia_tri, ngay_ky, trang_thai, tiens_do_giao_hang, vi_pham, phu_luc, tinh_trang_thanh_toan } = req.body;
  if (!so_hop_dong || !ten_doi_tac || !loai_hop_dong || !gia_tri || !ngay_ky || !trang_thai) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!ma_kh) {
    return res.status(400).json({ error: 'Missing required field: ma_kh' });
  }

  try {
    await ensureContractCustomerLinkSchema();
    const customerResult = await safeQuery('SELECT ten_kh, quoc_gia, email AS kh_email FROM khach_hang WHERE ma_kh = $1', [ma_kh]);
    if (customerResult.rows.length === 0) {
      return res.status(400).json({ error: 'Mã KH không tồn tại trong danh sách khách hàng' });
    }
    const result = await safeQuery(
      `INSERT INTO hop_dong (so_hop_dong, ma_kh, ten_doi_tac, loai_hop_dong, gia_tri, ngay_ky, trang_thai, tiens_do_giao_hang, vi_pham, phu_luc, tinh_trang_thanh_toan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [so_hop_dong, ma_kh || null, ten_doi_tac, loai_hop_dong, gia_tri, ngay_ky, trang_thai, tiens_do_giao_hang || '', vi_pham || 'Không ghi nhận vi phạm', phu_luc || 'Không có phụ lục', tinh_trang_thanh_toan || '']
    );
    const saved = result.rows[0];
    const kh = customerResult.rows[0];
    res.status(201).json({ ...saved, ten_kh: kh.ten_kh || null, quoc_gia: kh.quoc_gia || null });
  } catch (err) {
    const kh = (dbFallback.customers || []).find(x => x.ma_kh === ma_kh) || {};
    if (!kh.ma_kh) {
      return res.status(400).json({ error: 'Mã KH không tồn tại trong danh sách khách hàng' });
    }
    const newContract = { so_hop_dong, ma_kh: ma_kh || null, ten_doi_tac, loai_hop_dong, gia_tri, ngay_ky, trang_thai, tiens_do_giao_hang, vi_pham, phu_luc, tinh_trang_thanh_toan, ten_kh: kh.ten_kh || null, quoc_gia: kh.quoc_gia || null };
    dbFallback.contracts.push(newContract);
    res.status(201).json(newContract);
  }
});

// Update a contract (FR11, FR13, FR15, FR16, FR17, FR18)
app.put('/api/contracts/:so_hop_dong', async (req, res) => {
  const { so_hop_dong } = req.params;
  const { ma_kh, ten_doi_tac, loai_hop_dong, gia_tri, ngay_ky, trang_thai, tiens_do_giao_hang, vi_pham, phu_luc, tinh_trang_thanh_toan } = req.body;

  try {
    await ensureContractCustomerLinkSchema();
    let kh = {};
    if (ma_kh) {
      const customerResult = await safeQuery('SELECT ten_kh, quoc_gia, email AS kh_email FROM khach_hang WHERE ma_kh = $1', [ma_kh]);
      if (customerResult.rows.length === 0) {
        return res.status(400).json({ error: 'Mã KH không tồn tại trong danh sách khách hàng' });
      }
      kh = customerResult.rows[0];
    }
    await safeQuery(
      `UPDATE hop_dong SET 
        ma_kh = $1, ten_doi_tac = $2, loai_hop_dong = $3, gia_tri = $4, ngay_ky = $5, trang_thai = $6,
        tiens_do_giao_hang = $7, vi_pham = $8, phu_luc = $9, tinh_trang_thanh_toan = $10
       WHERE so_hop_dong = $11`,
      [ma_kh || null, ten_doi_tac, loai_hop_dong, gia_tri, ngay_ky, trang_thai, tiens_do_giao_hang, vi_pham, phu_luc, tinh_trang_thanh_toan, so_hop_dong]
    );
    res.json({ so_hop_dong, ma_kh: ma_kh || null, ten_doi_tac, loai_hop_dong, gia_tri, ngay_ky, trang_thai, tiens_do_giao_hang, vi_pham, phu_luc, tinh_trang_thanh_toan, ten_kh: kh.ten_kh || null, quoc_gia: kh.quoc_gia || null });
  } catch (err) {
    const kh = (dbFallback.customers || []).find(x => x.ma_kh === ma_kh) || {};
    if (ma_kh && !kh.ma_kh) {
      return res.status(400).json({ error: 'Mã KH không tồn tại trong danh sách khách hàng' });
    }
    const idx = dbFallback.contracts.findIndex(c => c.so_hop_dong === so_hop_dong);
    if (idx !== -1) {
      dbFallback.contracts[idx] = { ...dbFallback.contracts[idx], ma_kh: ma_kh || null, ten_doi_tac, loai_hop_dong, gia_tri, ngay_ky, trang_thai, tiens_do_giao_hang, vi_pham, phu_luc, tinh_trang_thanh_toan, ten_kh: kh.ten_kh || null, quoc_gia: kh.quoc_gia || null };
    }
    res.json({ so_hop_dong, ma_kh: ma_kh || null, ten_doi_tac, loai_hop_dong, gia_tri, ngay_ky, trang_thai, tiens_do_giao_hang, vi_pham, phu_luc, tinh_trang_thanh_toan, ten_kh: kh.ten_kh || null, quoc_gia: kh.quoc_gia || null });
  }
});

// Delete a contract (FR14)
app.delete('/api/contracts/:so_hop_dong', async (req, res) => {
  const { so_hop_dong } = req.params;
  try {
    await safeQuery('DELETE FROM hop_dong WHERE so_hop_dong = $1', [so_hop_dong]);
    res.json({ success: true });
  } catch (err) {
    dbFallback.contracts = dbFallback.contracts.filter(c => c.so_hop_dong !== so_hop_dong);
    res.json({ success: true });
  }
});

// Get all faulty shipments (hang_loi) (FR45, FR46)
app.get('/api/faulty-shipments', async (req, res) => {
  try {
    const result = await safeQuery('SELECT * FROM hang_loi ORDER BY ma_loi ASC');
    res.json(result.rows);
  } catch (err) {
    res.json(dbFallback.faultyShipments);
  }
});

// Create/Register a faulty shipment (FR44)
app.post('/api/faulty-shipments', async (req, res) => {
  const { ma_loi, id_lo_hang, ma_puc, loai_loi, ngay_phat_hien, nguoi_phu_trach, trang_thai, ket_qua_kiem_tra_lai } = req.body;
  if (!ma_loi || !id_lo_hang || !ma_puc || !loai_loi || !ngay_phat_hien || !nguoi_phu_trach) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await safeQuery(
      `INSERT INTO hang_loi (ma_loi, id_lo_hang, ma_puc, loai_loi, ngay_phat_hien, nguoi_phu_trach, trang_thai, ket_qua_kiem_tra_lai) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [ma_loi, id_lo_hang, ma_puc, loai_loi, ngay_phat_hien, nguoi_phu_trach, trang_thai || 'Đang xử lý', ket_qua_kiem_tra_lai || 'Chưa kiểm tra lại']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const item = { ma_loi, id_lo_hang, ma_puc, loai_loi, ngay_phat_hien, nguoi_phu_trach, trang_thai: trang_thai || 'Đang xử lý', ket_qua_kiem_tra_lai: ket_qua_kiem_tra_lai || 'Chưa kiểm tra lại' };
    dbFallback.faultyShipments.push(item);
    res.status(201).json(item);
  }
});

// Update a faulty shipment record (FR47)
app.put('/api/faulty-shipments/:ma_loi', async (req, res) => {
  const { ma_loi } = req.params;
  const { loai_loi, nguoi_phu_trach, trang_thai, ket_qua_kiem_tra_lai } = req.body;
  try {
    await safeQuery(
      `UPDATE hang_loi SET loai_loi = $1, nguoi_phu_trach = $2, trang_thai = $3, ket_qua_kiem_tra_lai = $4 WHERE ma_loi = $5`,
      [loai_loi, nguoi_phu_trach, trang_thai, ket_qua_kiem_tra_lai, ma_loi]
    );
    res.json({ success: true, ma_loi, loai_loi, nguoi_phu_trach, trang_thai, ket_qua_kiem_tra_lai });
  } catch (err) {
    const idx = dbFallback.faultyShipments.findIndex(f => f.ma_loi === ma_loi);
    if (idx !== -1) {
      dbFallback.faultyShipments[idx] = {
        ...dbFallback.faultyShipments[idx],
        loai_loi,
        nguoi_phu_trach,
        trang_thai,
        ket_qua_kiem_tra_lai
      };
    }
    res.json({ success: true, ma_loi, loai_loi, nguoi_phu_trach, trang_thai, ket_qua_kiem_tra_lai });
  }
});

// Delete a faulty shipment record (FR48)
app.delete('/api/faulty-shipments/:ma_loi', async (req, res) => {
  const { ma_loi } = req.params;
  try {
    await safeQuery('DELETE FROM hang_loi WHERE ma_loi = $1', [ma_loi]);
    res.json({ success: true });
  } catch (err) {
    dbFallback.faultyShipments = dbFallback.faultyShipments.filter(f => f.ma_loi !== ma_loi);
    res.json({ success: true });
  }
});

// Delete a storage entry receipt (FR38)
app.delete('/api/receipts/:ma_phieu', async (req, res) => {
  const { ma_phieu } = req.params;
  try {
    await safeQuery('DELETE FROM phieu_nhap_kho WHERE ma_phieu = $1', [ma_phieu]);
    res.json({ success: true });
  } catch (err) {
    dbFallback.receipts = dbFallback.receipts.filter(r => r.ma_phieu !== ma_phieu);
    res.json({ success: true });
  }
});

// Serve static built frontend assets in production
const path = require('path');
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Return frontend index.html for non-API route hits (supporting browser history routers)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
