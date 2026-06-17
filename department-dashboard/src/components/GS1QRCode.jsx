import React from 'react';
import QRCode from 'qrcode';

const GS1QRCode = ({ shipment }) => {
  const canvasRef = React.useRef(null);
  
  const getGS1Data = (s) => {
    if (!s) return null;
    
    // AI(01): GTIN (14 digits)
    let gtin = '08930000000018'; // Trái tươi xuất khẩu (mặc định)
    if (s.loai === 'Nguyên trái đông lạnh') {
      gtin = '08930000000025';
    } else if (s.loai === 'Lột múi cơm') {
      gtin = '08930000000032';
    } else if (s.loai === 'Sấy khô') {
      gtin = '08930000000049';
    }

    // AI(13): Harvest Date (YYMMDD)
    let yyMMdd = '260617';
    if (s.ngay_thu_hoach) {
      const parts = s.ngay_thu_hoach.split('-');
      if (parts.length === 3) {
        yyMMdd = parts[0].substring(2) + parts[1] + parts[2];
      } else if (s.ngay_thu_hoach.length === 8 && !s.ngay_thu_hoach.includes('-')) {
        yyMMdd = s.ngay_thu_hoach.substring(2);
      }
    }

    // AI(3102): Net Weight (kg, 2 decimal places in tons, which translates to kilograms)
    let weightKgStr = '000000';
    if (s.khoi_luong_lo_hang !== null && s.khoi_luong_lo_hang !== undefined && s.khoi_luong_lo_hang !== '') {
      const parsed = parseFloat(s.khoi_luong_lo_hang);
      if (!isNaN(parsed)) {
        const kg = Math.round(parsed * 1000);
        weightKgStr = kg.toString().padStart(6, '0').substring(0, 6);
      }
    }

    const lot = (s.id || '').replace(/[^a-zA-Z0-9-]/g, '');

    // Digital Link URI
    const digitalLink = `https://id.namdogroup.vn/01/${gtin}/10/${lot}?13=${yyMMdd}&3102=${weightKgStr}`;
    
    // Traditional GS1 Element String
    const encodedElement = `01${gtin}13${yyMMdd}3102${weightKgStr}10${lot}`;
    const humanReadable = `(01)${gtin}(13)${yyMMdd}(3102)${weightKgStr}(10)${lot}`;

    return {
      digitalLink,
      encodedElement,
      humanReadable,
      gtin,
      yyMMdd,
      weightKgStr,
      lot
    };
  };

  const gs1 = getGS1Data(shipment);

  React.useEffect(() => {
    if (canvasRef.current && gs1) {
      QRCode.toCanvas(
        canvasRef.current, 
        gs1.digitalLink, 
        {
          width: 140,
          margin: 1,
          color: {
            dark: '#1e293b',
            light: '#ffffff'
          }
        }, 
        (error) => {
          if (error) console.error("Error generating QR code:", error);
        }
      );
    }
  }, [gs1]);

  if (!gs1) return null;

  return (
    <div className="gs1-qr-container" style={{
      display: 'flex',
      gap: '20px',
      backgroundColor: 'var(--bg-body)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '16px',
      marginTop: '16px',
      alignItems: 'center',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="qr-code-wrapper" style={{
        backgroundColor: '#ffffff',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '156px',
        height: '156px',
        flexShrink: 0
      }}>
        <canvas ref={canvasRef} style={{ width: '140px', height: '140px' }}></canvas>
      </div>
      <div className="qr-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📦 Mã QR Chuẩn GS1 (Digital Link)</span>
        </h4>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Mã QR chứa thông tin nguồn gốc sản phẩm theo tiêu chuẩn quốc tế GS1. Thích hợp quét bằng máy quét chuyên dụng hoặc ứng dụng di động.
        </p>
        
        <div className="gs1-info-row" style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mã hóa GS1 (Nhân dạng được)</div>
          <code style={{ 
            fontSize: '11px', 
            fontWeight: '600', 
            color: 'var(--text-main)', 
            backgroundColor: 'var(--bg-surface)', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            border: '1px solid var(--border-color)',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            overflowX: 'auto'
          }}>
            {gs1.humanReadable}
          </code>
        </div>

        <div className="gs1-info-row" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GS1 Digital Link URL</div>
          <a href={gs1.digitalLink} target="_blank" rel="noopener noreferrer" style={{ 
            fontSize: '11px', 
            color: 'var(--primary)', 
            textDecoration: 'none',
            wordBreak: 'break-all',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            display: 'block'
          }} title={gs1.digitalLink}>
            {gs1.digitalLink}
          </a>
        </div>
      </div>
    </div>
  );
};

export default GS1QRCode;
