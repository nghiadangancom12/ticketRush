// src/services/email.service.js
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
require('dotenv').config(); // Load biến môi trường từ file .env

class EmailService {
  constructor() {
    // Khởi tạo Transporter (Người vận chuyển) với cấu hình từ Mailtrap
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
  }

  /**
   * Hàm cốt lõi để gửi email
   * @param {Object} options - Chứa email người nhận, tiêu đề và nội dung
   */
  async sendEmail(options) {
    try {
      // 1. Cấu hình gói hàng (Email options)
      const mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS, // Tên người gửi (TicketRush)
        to: options.email,                   // Email khách hàng
        subject: options.subject,            // Tiêu đề email
        text: options.message,               // Nội dung dạng Text thuần
        html: options.html                   // Nội dung dạng HTML (Giao diện đẹp)
      };

      // 2. Bắt đầu gửi
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Đã gửi email thành công tới:', options.email);
      //console.log('🔗 Link xem trước Mailtrap:', nodemailer.getTestMessageUrl(info));
      
      return info;
    } catch (error) {
      console.error('❌ Lỗi gửi email:', error);
      throw new Error('Đã có lỗi xảy ra khi gửi email xác nhận.');
    }
  }
  async sendWelcomeEmail(userEmail, userName) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #E50914; text-align: center;">Chào mừng đến với TicketRush! 🎉</h2>
        <p>Xin chào <strong>${userName}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại TicketRush. Chúng tôi rất vui mừng được đồng hành cùng bạn trong những sự kiện giải trí đỉnh cao sắp tới.</p>
        <p>Bây giờ bạn đã có thể đăng nhập và bắt đầu săn cho mình những tấm vé ưng ý nhất!</p>
        <br>
        <p>Trân trọng,</p>
        <p><strong>Đội ngũ TicketRush</strong></p>
      </div>
    `;

    return await this.sendEmail({
      email: userEmail,
      subject: 'Chào mừng bạn gia nhập TicketRush! 🎉',
      html: htmlContent
    });
    console.log("send email roi")
  }
  // Bạn có thể viết thêm các hàm chuyên biệt ở đây (ví dụ gửi vé)
  async sendTicket(userEmail, eventName, ticketCode) {
    const htmlContent = `
      <h2>Chúc mừng bạn đã đặt vé thành công!</h2>
      <p>Sự kiện: <strong>${eventName}</strong></p>
      <p>Mã vé của bạn là: <b style="color: red;">${ticketCode}</b></p>
    `;

    return await this.sendEmail({
      email: userEmail,
      subject: `[TicketRush] Vé điện tử sự kiện ${eventName}`,
      html: htmlContent
    });
  }

  async sendPasswordResetEmail(userEmail, resetUrl) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #E50914; text-align: center;">Yêu cầu cấp lại mật khẩu 🔐</h2>
        <p>Xin chào,</p>
        <p>Chúng tôi nhận được yêu cầu cấp lại mật khẩu cho tài khoản TicketRush của bạn.</p>
        <p>Vui lòng nhấn vào nút bên dưới để tiến hành đặt lại mật khẩu của bạn. Liên kết này sẽ hết hạn sau 10 phút.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #E50914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
        </div>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        <p>Nếu nút trên không hoạt động, bạn có thể copy link sau dán vào trình duyệt: ${resetUrl}</p>
        <br>
        <p>Trân trọng,</p>
        <p><strong>Đội ngũ TicketRush</strong></p>
      </div>
    `;

    return await this.sendEmail({
      email: userEmail,
      subject: '[TicketRush] Yêu cầu cấp lại mật khẩu 🔐',
      html: htmlContent
    });
  }

  async sendTicketEmail(order) {
    const { users, tickets } = order;
    
    // 1. Tạo QR codes cho tất cả các vé
    const ticketDetailsWithQR = await Promise.all(
      tickets.map(async (ticket) => {
        const qrCodeDataUrl = await QRCode.toDataURL(ticket.qr_code);
        return {
          ...ticket,
          qrCodeDataUrl,
          cid: `qr-${ticket.id}`
        };
      })
    );

    // 2. Chuẩn bị attachments để nhúng CID
    const attachments = ticketDetailsWithQR.map(t => ({
      filename: `ticket-${t.id}.png`,
      content: t.qrCodeDataUrl.split(',')[1],
      encoding: 'base64',
      cid: t.cid
    }));

    // 3. Lấy thông tin sự kiện từ vé đầu tiên
    const event = tickets[0]?.seats?.zones?.events;
    const eventName = event?.title || 'Sự kiện TicketRush';
    const eventLocation = event?.location || 'Địa điểm chưa cập nhật';
    const eventTime = event?.start_time ? new Date(event.start_time).toLocaleString('vi-VN') : 'Sắp diễn ra';

    let ticketsHtml = '';
    ticketDetailsWithQR.forEach(t => {
      ticketsHtml += `
        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 8px; background-color: #fff;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="flex: 1;">
              <p style="margin: 0; font-weight: bold; color: #E50914; font-size: 1.1em;">Mã vé: ${t.qr_code}</p>
              <p style="margin: 8px 0; font-size: 1em;"><b>Khu vực:</b> ${t.seats.zones.name}</p>
              <p style="margin: 5px 0;"><b>Hàng:</b> ${t.seats.row_label} | <b>Số ghế:</b> ${t.seats.seat_number}</p>
              <p style="margin: 5px 0; font-size: 0.9em; color: #666;">Giá vé: ${Number(t.seats.zones.price).toLocaleString('vi-VN')} VND</p>
            </div>
            <div style="text-align: center; margin-left: 20px;">
              <img src="cid:${t.cid}" width="130" height="130" style="display: block;" alt="QR Code" />
            </div>
          </div>
        </div>
      `;
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #E50914; text-align: center; margin-top: 0;">Vé điện tử của bạn! 🎫</h2>
          <p>Xin chào <strong>${users.full_name}</strong>,</p>
          <p>Đơn hàng <strong>#${order.id.substring(0, 8).toUpperCase()}</strong> của bạn đã thanh toán thành công. Dưới đây là thông tin vé của bạn:</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #E50914; margin-bottom: 30px;">
            <h3 style="margin-top: 0; color: #111; font-size: 1.2em;">${eventName}</h3>
            <p style="margin: 8px 0;">📅 <strong>Thời gian:</strong> ${eventTime}</p>
            <p style="margin: 8px 0;">📍 <strong>Địa điểm:</strong> ${eventLocation}</p>
          </div>

          ${ticketsHtml}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #666;">
            <p>* Vui lòng xuất trình mã QR này tại cửa soát vé.</p>
            <p>* Mỗi mã QR chỉ có giá trị cho một lần vào cổng.</p>
          </div>
          
          <p style="text-align: center; margin-top: 40px; color: #999; font-size: 0.8em;">
            © 2026 TicketRush. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return await this.transporter.sendMail({
      from: process.env.MAIL_FROM_ADDRESS,
      to: users.email,
      subject: `[TicketRush] Vé điện tử thành công - ${eventName}`,
      html: htmlContent,
      attachments
    });
  }
}

module.exports = new EmailService();