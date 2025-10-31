import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useCampaignStore from '../store/useCampaignStore';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(3, "Tên chiến dịch phải có ít nhất 3 ký tự"),
  recipients: z.string().optional()
});

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { addCampaignLocally } = useCampaignStore();
  const [uploadedEmails, setUploadedEmails] = useState([]);
  const [fileError, setFileError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  // Hàm xử lý upload file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFileError('');
    
    if (!file) return;
    
    // Kiểm tra loại file
    if (!file.name.toLowerCase().endsWith('.txt')) {
      setFileError('Chỉ chấp nhận file .txt');
      return;
    }
    
    // Kiểm tra kích thước file (tối đa 1MB)
    if (file.size > 1024 * 1024) {
      setFileError('File quá lớn. Kích thước tối đa 1MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const emails = content
          .split('\n')
          .map(email => email.trim())
          .filter(email => {
            // Kiểm tra format email cơ bản
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return email && emailRegex.test(email);
          });
        
        if (emails.length === 0) {
          setFileError('Không tìm thấy email hợp lệ trong file');
          return;
        }
        
        setUploadedEmails(emails);
        toast.success(`Đã tải lên ${emails.length} email từ file`);
      } catch (error) {
        setFileError('Lỗi khi đọc file');
      }
    };
    
    reader.readAsText(file);
  };

  const onSubmit = async (data) => {
    try {
      // Sử dụng email từ file upload hoặc từ textarea
      let recipients = [];
      if (uploadedEmails.length > 0) {
        recipients = uploadedEmails;
      } else if (data.recipients) {
        recipients = data.recipients.split(',').map(s => s.trim()).filter(Boolean);
      }
      
      if (recipients.length === 0) {
        toast.error('Vui lòng nhập email hoặc tải lên file danh sách email');
        return;
      }
      
      // Nội dung mặc định
      const defaultSubject = "Cảnh báo bảo mật";
      const defaultMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <p>Xin chào,</p>
          
          <p>Chúng tôi phát hiện tài khoản của bạn đã được đăng nhập từ một thiết bị hoặc vị trí khác thường. Nếu đây không phải là bạn, vui lòng thực hiện các bước sau ngay lập tức:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #d32f2f; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Thông tin đăng nhập:</p>
            <p style="margin: 5px 0 0 0;">• Thời gian: ${new Date().toLocaleString()}</p>
            <p style="margin: 5px 0 0 0;">• Địa chỉ IP: 192.168.1.100</p>
            <p style="margin: 5px 0 0 0;">• Vị trí: Hà Nội, Việt Nam</p>
          </div>
          
          <p>Để bảo vệ tài khoản của bạn, vui lòng:</p>
          <ol>
            <li>Nhấn vào liên kết bên dưới để đổi mật khẩu</li>
            <li>Kích hoạt xác thực 2 yếu tố (2FA)</li>
            <li>Kiểm tra các hoạt động đăng nhập gần đây</li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #d32f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              ĐỔI MẬT KHẨU NGAY
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Nếu bạn không thực hiện đăng nhập này, vui lòng bỏ qua email này và liên hệ với bộ phận IT ngay lập tức.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 11px; text-align: center;">
            Email này được gửi tự động từ hệ thống bảo mật. Vui lòng không trả lời email này.
          </p>
        </div>
      `;
      
      const payload = {
        name: data.name,
        subject: defaultSubject,
        message: defaultMessage,
        recipients,
      };
      const res = await api.post('/campaigns', payload);
      toast.success('Chiến dịch đã được gửi thành công');
      addCampaignLocally(res.data.campaign);
      
      // Chuyển hướng về trang chủ sau 2 giây
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Tạo chiến dịch phishing</h1>
        <p className="text-gray-400">Thiết kế và triển khai một cuộc tấn công phishing mô phỏng để kiểm tra nhận thức bảo mật của tổ chức.</p>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campaign Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Tên chiến dịch
            </label>
            <input 
              {...register('name')} 
              placeholder="Ví dụ: Chiến dịch đào tạo bảo mật Q4"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {errors.name && (
              <p className="text-red-400 text-sm flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          {/* Recipients */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white">
              Danh sách email
            </label>
            
            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-300">
                Tải lên file .txt (mỗi email một dòng)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-full px-4 py-3 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-gray-300">Chọn file .txt hoặc kéo thả vào đây</span>
                  </div>
                </div>
              </div>
              {fileError && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{fileError}</span>
                </p>
              )}
              {uploadedEmails.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-green-400 text-sm">
                    ✅ Đã tải lên {uploadedEmails.length} email từ file
                  </p>
                  <div className="mt-2 max-h-20 overflow-y-auto">
                    {uploadedEmails.slice(0, 5).map((email, index) => (
                      <span key={index} className="text-xs text-gray-300 block">
                        {email}
                      </span>
                    ))}
                    {uploadedEmails.length > 5 && (
                      <span className="text-xs text-gray-400">
                        ... và {uploadedEmails.length - 5} email khác
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Manual Input */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-300">
                Hoặc nhập thủ công (phân cách bằng dấu phẩy)
              </label>
              <textarea 
                {...register('recipients')} 
                rows={4}
                placeholder="user1@company.com, user2@company.com, user3@company.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                disabled={uploadedEmails.length > 0}
              />
              {uploadedEmails.length > 0 && (
                <p className="text-blue-400 text-xs">
                  💡 Đang sử dụng email từ file. Xóa file để nhập thủ công.
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              <span className="font-medium">⚠️</span> Email thật sẽ được gửi đến các địa chỉ đã chỉ định.
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang gửi chiến dịch...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Khởi động chiến dịch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-8 card bg-blue-500/10 border-blue-500/20">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-400 mb-1">Mẹo chuyên nghiệp</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Sử dụng tên người gửi và chủ đề thực tế để tăng hiệu quả</li>
              <li>• Bao gồm lời kêu gọi hành động rõ ràng trong tin nhắn</li>
              <li>• Thử nghiệm với nhóm nhỏ trước khi triển khai cho tất cả người nhận</li>
              <li>• Theo dõi tỷ lệ nhấp để đo lường mức độ nhận thức bảo mật</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
