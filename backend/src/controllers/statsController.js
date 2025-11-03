import { Click } from '../models/Click.js';
import { Campaign } from '../models/Campaign.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Tổng hợp clicks theo thời gian (7 ngày gần nhất)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const clicksByTime = await Click.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $addFields: {
          vietnamTime: {
            $dateAdd: {
              startDate: '$timestamp',
              unit: 'hour',
              amount: 7
            }
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$vietnamTime' },
            month: { $month: '$vietnamTime' },
            day: { $dayOfMonth: '$vietnamTime' },
            hour: { $hour: '$vietnamTime' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 }
      }
    ]);
        
    // Định nghĩa thứ tự sắp xếp
    const periods = {
    '00:00 - 05:59 (Đêm)': 0,
    '06:00 - 11:59 (Sáng)': 0,
    '12:00 - 17:59 (Chiều)': 0,
    '18:00 - 23:59 (Tối)': 0
    };

    clicksByTime.forEach(item => {
      const hour = item._id.hour;
      
      if (hour >= 0 && hour < 6) {
        periods['00:00 - 05:59 (Đêm)'] += item.count;
      } else if (hour >= 6 && hour < 12) {
        periods['06:00 - 11:59 (Sáng)'] += item.count;
      } else if (hour >= 12 && hour < 18) {
        periods['12:00 - 17:59 (Chiều)'] += item.count;
      } else {
        periods['18:00 - 23:59 (Tối)'] += item.count;
      }
    });

    const timeSeriesData = Object.entries(periods).map(([time, clicks]) => ({
      time,
      clicks
    }));

    // Top 5 browsers từ User-Agent
    const topBrowsers = await Click.aggregate([
      {
        $match: {
          userAgent: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$userAgent',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Format browser data from user-agent
    const browserData = topBrowsers.map(item => {
      const userAgent = item._id;
      let browserName = 'Unknown';

      // Kiểm tra 
      if (userAgent.includes('Edg')) browserName = 'Microsoft Edge';
      else if (userAgent.includes('OPR') || userAgent.includes('Opera')) browserName = 'Opera';
      else if (userAgent.includes('Chrome')) browserName = 'Chrome';
      else if (userAgent.includes('Firefox')) browserName = 'Firefox';
      else if (userAgent.includes('Safari')) browserName = 'Safari';
      else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) browserName = 'Internet Explorer';
      
      return {
        browser: browserName,
        count: item.count,
        fullUserAgent: userAgent
      };
    });
    
    // Tổng hợp stats tổng quan
    const totalCampaigns = await Campaign.countDocuments();
    const totalRecipients = await Campaign.aggregate([
      { $unwind: '$recipients' },
      { $count: 'total' }
    ]);
    const totalClicks = await Click.countDocuments();
    
    const totalRecipientsCount = totalRecipients.length > 0 ? totalRecipients[0].total : 0;
    const totalClickRate = totalRecipientsCount > 0 
      ? ((totalClicks / totalRecipientsCount) * 100).toFixed(2) 
      : 0;
    
    res.json({
      timeSeriesData,
      browserData,
      overallStats: {
        totalCampaigns,
        totalRecipients: totalRecipientsCount,
        totalClicks,
        totalClickRate: parseFloat(totalClickRate)
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
};

