
import React from 'react';

const ClinicAILogo = () => (
    <div className="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-cyan-400">
            <path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3"></path>
            <path d="M8 2a2 2 0 0 0-2 2v12.5a3.5 3.5 0 0 0 3.5 3.5h0a3.5 3.5 0 0 0 3.5-3.5V4a2 2 0 0 0-2-2"></path>
            <path d="M8 6h4"></path>
            <path d="M19 10a7 7 0 0 0-7-7"></path>
            <circle cx="19" cy="10" r="2"></circle>
        </svg>
        <span className="text-2xl font-bold text-white">Clinic Care</span>
    </div>
);

const SocialIcon: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">
        {children}
    </a>
);

export function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300">
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Brand and Social */}
          <div className="space-y-6">
            <ClinicAILogo />
            <p className="text-gray-400 text-sm">
              Nền tảng chăm sóc sức khỏe thông minh, kết nối bạn với các chuyên gia y tế hàng đầu.
            </p>
            <div className="flex space-x-5">
                <SocialIcon href="#">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </SocialIcon>
                <SocialIcon href="#">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </SocialIcon>
                <SocialIcon href="#">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H6.328C3.965 1 2 2.985 2 5.355v13.29C2 21.015 3.965 23 6.328 23h11.34c2.363 0 4.328-1.985 4.328-4.355V5.355C22 2.985 20.031 1 17.668 1z" clipRule="evenodd" /></svg>
                </SocialIcon>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Khám phá</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Trang chủ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Tìm bác sĩ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Hỗ trợ</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Liên hệ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Câu hỏi thường gặp</a></li>
            </ul>
          </div>
          
          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Đăng ký để tư vấn</h3>
            <p className="text-gray-400 mb-4 text-sm">Nhân viên sẽ liên hệ với bạn sớm nhất có thể.</p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Email hoặc SĐT của bạn"
                className="w-full px-4 py-2 text-gray-800 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button 
                type="submit" 
                className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition-colors font-semibold"
              >
                Gửi
              </button>
            </form>
          </div>

        </div>
        
        {/* Bottom Bar */}
        <div className="mt-6 pt-2 border-t border-gray-800 text-center text-sm text-gray-500 flex flex-col sm:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Clinic Care. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-4 sm:mt-0">
                <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
            </div>
        </div>
      </div>
    </footer>
  );
}