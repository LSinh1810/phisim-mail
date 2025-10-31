import { Campaign } from '../models/Campaign.js';
import nodemailer from 'nodemailer';

export const createCampaign = async (req, res) => {
  const { name, subject, message, recipients } = req.body;


  try {
    const campaign = await Campaign.create({
      name,
      subject,
      message,
      recipients,
      sentAt: new Date(),
    });

    // cấu hình gửi mail với Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Tắt kiểm tra chứng chỉ SSL/TLS
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000
    });

    // gửi mail tới từng người nhận
    const emailResults = [];
    for (let email of recipients) {
      try {
        // URL tracking click XONG redirect tới Google Drive
        const redirectUrl = encodeURIComponent('https://drive.google.com/drive/folders/11Nbt_T8IyBnUdf7VRWoIGwCAhVF2A7ki?usp=drive_link');
        const trackUrl = `${process.env.BASE_URL}/api/track/${campaign._id}/${encodeURIComponent(email)}?redirect=${redirectUrl}`;
        // Nội dung email quảng cáo TOEIC free + hướng dẫn
        const htmlMessage = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Bạn đang cần nâng cao kỹ năng tiếng Anh giao tiếp, luyện thi TOEIC? Chúng tôi gửi tặng bạn bộ tài liệu luyện thi TOEIC mới nhất, hoàn toàn miễn phí!</h2>
            <ul>
              <li>Đề thi mẫu TOEIC chuẩn quốc tế</li>
              <li>File hướng dẫn và phần mềm hỗ trợ giải đề</li>
            </ul>
            <p style="color:#d62828;"><b>Hãy tải tất cả file, mở file <b>password-exe.png</b> để lấy mật khẩu giải nén!</b></p>
            <a href="${trackUrl}" style="display:inline-block;margin:10px 0;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Tải trọn bộ giáo trình TOEIC & phần mềm miễn phí</a>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">Ưu đãi chỉ dành cho 100 người đầu tiên.</p>
          </div>
        `;
        // Cấu hình trường From
        const fromEmail = process.env.GMAIL_FROM || process.env.GMAIL_USER;
        const fromName = process.env.GMAIL_FROM_NAME || 'PhishSim (Quảng cáo TOEIC)';
        
        const mailOptions = {
          from: `"${fromName}" <${fromEmail}>`,
          to: email,
          subject: "Tặng giáo trình TOEIC + Đề thi chuẩn + Phần mềm miễn phí!",
          html: htmlMessage
        };
        const result = await transporter.sendMail(mailOptions);
        emailResults.push({ email, status: 'success', messageId: result.messageId });
        console.log(`Email sent successfully to ${email}:`, result.messageId);
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError);
        emailResults.push({ email, status: 'failed', error: emailError.message });
      }
    }

    // Đếm số email gửi thành công và thất bại
    const successCount = emailResults.filter(r => r.status === 'success').length;
    const failedCount = emailResults.filter(r => r.status === 'failed').length;


    return res.json({ 
      message: `Đã gửi ${successCount}/${recipients.length} email thành công`, 
      campaign,
      emailResults: {
        total: recipients.length,
        success: successCount,
        failed: failedCount,
        details: emailResults
      }
    });
  } catch (error) {
    console.error("Lỗi khi tạo chiến dịch: ", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ sentAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chiến dịch: ", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({ message: "Không tìm thấy chiến dịch" });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết chiến dịch: ", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByIdAndDelete(id);
    
    if (!campaign) {
      return res.status(404).json({ message: "Không tìm thấy chiến dịch" });
    }
    
    res.json({ message: "Đã xóa chiến dịch thành công", campaign });
  } catch (error) {
    console.error("Lỗi khi xóa chiến dịch: ", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// testEmail endpoint đã được loại bỏ trong build production
