import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useCampaignStore from '../store/useCampaignStore';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

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
      const defaultSubject = "Tặng bạn bộ tài liệu luyện thi TOEIC miễn phí!";
      const defaultMessage = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Bạn đang cần nâng cao kỹ năng tiếng Anh giao tiếp, luyện thi TOEIC? Chúng tôi gửi tặng bạn bộ tài liệu luyện thi TOEIC mới nhất, hoàn toàn miễn phí!</h2>
            <ul>
              <li>Đề thi mẫu TOEIC chuẩn quốc tế</li>
              <li>File hướng dẫn và phần mềm hỗ trợ giải đề</li>
            </ul>
            <a href="#" style="display:inline-block;margin:10px 0;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Tải trọn bộ giáo trình TOEIC & phần mềm miễn phí</a>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">Ưu đãi chỉ dành cho 100 người đầu tiên.</p>
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
          <Shield className="w-8 h-8 text-white" />
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
    </div>
  );
}
