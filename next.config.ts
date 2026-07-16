import type { NextConfig } from "next";
// @ts-ignore
import withPWA from "next-pwa";
const nextConfig: NextConfig = {
  // أي إعدادات إضافية كانت عندك في ملف الـ config الأصلي تقدر تسيبها هنا
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);