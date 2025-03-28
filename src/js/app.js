import { Share } from '@capacitor/share';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Device } from '@capacitor/device';

// Lấy thông tin pin
async function getBatteryStatus() {
    try {
        const batteryInfo = await Device.getBatteryInfo();
        if (batteryInfo.batteryLevel !== undefined) {
            document.getElementById("battery").innerText = `🔋 Pin còn: ${batteryInfo.batteryLevel * 100}%`;
        } else {
            document.getElementById("battery").innerText = "Không thể lấy thông tin pin!";
        }
    } catch (error) {
        console.error("Lỗi lấy pin:", error);
        document.getElementById("battery").innerText = "Không thể lấy thông tin pin!";
    }
}

// Gọi hàm lấy pin khi trang tải
document.addEventListener("DOMContentLoaded", () => {
    getBatteryStatus();
    requestNotificationPermission();
});

// Yêu cầu quyền thông báo
async function requestNotificationPermission() {
    const permission = await LocalNotifications.requestPermissions();
    console.log("Notification Permission:", permission);
}

// Xử lý sự kiện khi nhấn "Tính toán"
document.getElementById("calculate").addEventListener("click", async () => {
    const input = document.getElementById("birthdate").value.trim();
    const regex = /^(\d{1,2})\/(\d{1,2})$/; 

    const match = input.match(regex);
    if (!match) {
        alert("Vui lòng nhập đúng định dạng dd/mm (ví dụ: 28/03)!");
        return;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);

    if (day < 1 || day > 31 || month < 1 || month > 12) {
        alert("Ngày hoặc tháng không hợp lệ!");
        return;
    }

    const today = new Date();
    let nextBirthday = new Date(today.getFullYear(), month - 1, day);

    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const daysLeft = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    document.getElementById("result").innerText = `Còn ${daysLeft} ngày đến sinh nhật tiếp theo!`;

    // Gửi thông báo
    await sendNotification(daysLeft);
});

// Chia sẻ nội dung
document.getElementById("share").addEventListener("click", async () => {
    try {
        await Share.share({
            title: "Đếm ngược sinh nhật",
            text: document.getElementById("result").innerText,
            url: window.location.href,
            dialogTitle: "Chia sẻ ngày sinh nhật của bạn!",
        });
    } catch (error) {
        alert("Trình duyệt không hỗ trợ chia sẻ!");
    }
});

// Gửi thông báo đếm ngược sinh nhật
async function sendNotification(daysLeft) {
    try {
        await LocalNotifications.schedule({
            notifications: [
                {
                    id: 1,
                    title: "Đếm ngược sinh nhật",
                    body: `Còn ${daysLeft} ngày đến sinh nhật tiếp theo! 🎂`,
                    schedule: { at: new Date(Date.now() + 5000) }, // Hiển thị thông báo sau 5 giây
                    sound: null,
                    attachments: null,
                    actionTypeId: "",
                    extra: null
                }
            ]
        });
    } catch (error) {
        console.error("Lỗi khi gửi thông báo:", error);
    }
}
