import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const credentials = {
    admin: { pass: 'admin123', role: 'admin', label: 'Bộ phận quản lý' },
    technical: { pass: 'tech123', role: 'technical', label: 'Bộ phận kỹ thuật' },
    production: { pass: 'prod123', role: 'production', label: 'Bộ phận sản xuất' },
    qaqc: { pass: 'qaqc123', role: 'qaqc', label: 'Bộ phận QA/QC' },
    logistics: { pass: 'logistics123', role: 'logistics', label: 'Bộ phận kho vận' }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim().toLowerCase();
    const user = credentials[trimmedUser];

    if (user && user.pass === password) {
      onLogin(user.role);
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-backdrop-decor">
        <div className="decor-circle circle-1"></div>
        <div className="decor-circle circle-2"></div>
      </div>
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">🍇</span>
            <span className="logo-text">NAM ĐÔ GROUP</span>
          </div>
          <h2>Hệ thống Truy xuất nguồn gốc</h2>
          <p>Đăng nhập cổng thông tin chuỗi cung ứng nông sản</p>
        </div>

        {error && <div className="login-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label htmlFor="username">Tên đăng nhập / Bộ phận</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="username"
                placeholder="Ví dụ: admin, technical, production, qaqc"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn">
            Đăng nhập hệ thống
          </button>
        </form>

        <div className="login-helper-info">
          <h4>Tài khoản demo thử nghiệm:</h4>
          <ul>
            <li><strong>Quản lý:</strong> admin / admin123</li>
            <li><strong>Kỹ thuật:</strong> technical / tech123</li>
            <li><strong>Sản xuất:</strong> production / prod123</li>
            <li><strong>QA/QC:</strong> qaqc / qaqc123</li>
            <li><strong>Kho vận:</strong> logistics / logistics123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
