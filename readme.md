# Hướng dẫn cài đặt

1. Chạy lệnh `docker-compose up -d` để khởi động server

2. Đổi `name` và `account_id` trong `./client/wrangler.toml`

   - `name` là tên ứng dụng muốn hiển thị trên `cloudflare worker`

   - `account_id` là account id trong cloudflare

     - ![account_id](./img/guide_client.png).

3. Nếu chưa cài đặt `wrangler` chạy lệnh `npm i @cloudflare/wrangler -g`
4. Chạy lệnh `wrangler config` để config xác thực. [Link hướng dẫn](https://developers.cloudflare.com/workers/cli-wrangler/authentication)
5. Cài đặt các package trong client `npm install` và build source client `npm run build`
6. Chạy lệnh `wrangler publish` để public ứng dụng lên `cloudflare worker`

## Error while running app

- Trong khi app đang chạy server có thể bị lỗi do chạy thêm một app khác mà có cùng port làm cho ứng dụng hiện tại bị crash.

- Hoặc có thể do khi chạy ứng dụng khác bằng docker thì gây xung đột với ứng dụng này.
