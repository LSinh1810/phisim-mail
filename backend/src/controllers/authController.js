import { generateToken } from '../middleware/auth.js';

export const login = async (req, res) => {
  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123qwe!@#';
  
  try {
    if (!password) {
      return res.status(400).json({ message: 'Vui lòng nhập mật khẩu' });
    }

    if (password === ADMIN_PASSWORD) {
      const token = generateToken({ role: 'admin', auth: true });
      
      return res.json({
        message: 'Đăng nhập thành công',
        token,
        expiresIn: '30 phút',
      });
    } else {
      return res.status(401).json({ message: 'Mật khẩu không đúng' });
    }
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống' });
  }
};

export const verify = (req, res) => {
  return res.json({
    authenticated: true,
    user: req.user,
  });
};

