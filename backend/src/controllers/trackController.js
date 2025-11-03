import { Campaign } from '../models/Campaign.js';
import { Click } from '../models/Click.js';
import crypto from 'crypto';

export const trackClick = async (req, res) => {
  const { campaignId, email } = req.params;

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).send("Không tìm thấy chiến dịch");

    const decodedEmail = decodeURIComponent(email);
    const token = crypto.randomBytes(32).toString('hex');
    const timestamp = new Date();


    // Lấy thông tin từ headers
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || req.headers['referrer'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const xForwardedFor = req.headers['x-forwarded-for'] || '';

    // Ghi click vào Campaign (backwards compatibility)
    campaign.clicks.push({ email: decodedEmail, clickedAt: timestamp });
    await campaign.save();

    // Ghi log chi tiết vào collection Click
    await Click.create({
      campaignId,
      email: decodedEmail,
      token,
      timestamp,
      ip,
      userAgent,
      referrer,
      acceptLanguage,
      xForwardedFor,
    });

    // Hiển thị landing page giáo dục
    const educationalPage = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cảnh báo Phishing - Mô phỏng nhận thức bảo mật</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 700px;
            width: 100%;
            padding: 40px;
            animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .icon {
            width: 80px;
            height: 80px;
            background: #fef3c7;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }
        .icon svg {
            width: 50px;
            height: 50px;
            color: #f59e0b;
        }
        h1 {
            color: #1f2937;
            font-size: 28px;
            text-align: center;
            margin-bottom: 20px;
        }
        .alert-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .alert-box p {
            color: #92400e;
            font-size: 16px;
            line-height: 1.6;
            font-weight: 500;
        }
        .info-section {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .info-section h2 {
            color: #1e40af;
            font-size: 20px;
            margin-bottom: 15px;
        }
        .info-section ul {
            list-style: none;
            padding-left: 0;
        }
        .info-section li {
            color: #1e3a8a;
            padding: 8px 0;
            padding-left: 30px;
            position: relative;
            line-height: 1.6;
        }
        .info-section li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #3b82f6;
            font-weight: bold;
        }
        .download-btn {
            display: block;
            width: 100%;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            font-size: 18px;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-bottom: 20px;
        }
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        .disclaimer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .warning-badge {
            display: inline-block;
            background: #fee2e2;
            color: #991b1b;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
        </div>
        
        <h1>Đây là mô phỏng Phishing Awareness!</h1>
        
        <div class="alert-box">
            <span class="warning-badge">⚠️ CẢNH BÁO</span>
            <p><strong>Bạn vừa nhấp vào một liên kết giả mạo.</strong> Đây là bài kiểm tra mô phỏng để nâng cao nhận thức về an toàn thông tin.</p>
        </div>
        
        <div class="info-section">
            <h2>🔒 Cách nhận biết email phishing:</h2>
            <ul>
                <li>Kiểm tra địa chỉ email người gửi (không phải từ domain chính thức)</li>
                <li>URL liên kết khác với tên hiển thị khi hover chuột</li>
                <li>Yêu cầu cấp bách tạo cảm giác căng thẳng</li>
                <li>Lỗi chính tả và ngữ pháp trong nội dung email</li>
                <li>Yêu cầu cung cấp thông tin nhạy cảm hoặc đăng nhập</li>
            </ul>
        </div>
        
        <div class="info-section">
            <h2>📧 Cách báo cáo email phishing:</h2>
            <ul>
                <li>Không xóa email ngay, giữ lại làm bằng chứng</li>
                <li>Báo cáo cho bộ phận IT hoặc quản trị viên hệ thống</li>
                <li>Chuyển tiếp email đến phòng an toàn thông tin</li>
                <li>Cảnh báo đồng nghiệp về chiến dịch phishing này</li>
            </ul>
        </div>
        
        <a href="https://mega.nz/file/EU0nhIhJ#MmVjmB6c0XoYO1Ac09vSp-QLxSaQDK2S6Jcmb4gYgRw" 
           target="_blank" 
           class="download-btn"
           onclick="this.innerHTML='⏳ Đang tải...'">
            📥 Tôi hiểu rồi - Tải tài liệu hướng dẫn
        </a>
        
        <div class="disclaimer">
            <p>Đây là một hoạt động giáo dục được thiết kế để nâng cao nhận thức về an toàn thông tin.</p>
        </div>
    </div>
</body>
</html>
    `;

    res.send(educationalPage);
  } catch (err) {
    console.error("Lỗi khi theo dõi nhấp chuột: ", err);
    return res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Lỗi hệ thống</h1>
          <p>Vui lòng thử lại sau.</p>
        </body>
      </html>
    `);
  }
};
