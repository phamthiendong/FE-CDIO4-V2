
import React from 'react';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { StethoscopeIcon } from './icons/StethoscopeIcon';

const steps = [
  {
    icon: PencilSquareIcon,
    title: 'Mô tả triệu chứng',
    description: 'Cung cấp thông tin chi tiết về các triệu chứng bạn đang gặp phải một cách an toàn và bảo mật.',
  },
  {
    icon: SparklesIcon,
    title: 'Nhận gợi ý từ AI',
    description: 'Công nghệ AI tiên tiến của chúng tôi sẽ phân tích các triệu chứng và đề xuất chuyên khoa phù hợp.',
  },
  {
    icon: UserGroupIcon,
    title: 'Chọn bác sĩ',
    description: 'Xem danh sách các bác sĩ được đề xuất, xem thông tin và chọn người phù hợp nhất với bạn.',
  },
  {
    icon: StethoscopeIcon,
    title: 'Bắt đầu tư vấn',
    description: 'Bắt đầu một buổi tư vấn mô phỏng và nhận tóm tắt chi tiết để hiểu rõ hơn về tình trạng sức khỏe của bạn.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 bg-white rounded-2xl shadow-lg border border-slate-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Quy trình hoạt động</h2>
          <p className="mt-4 text-lg text-slate-600">Chăm sóc sức khỏe chỉ với 4 bước đơn giản.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center p-6">
              <div className="flex items-center justify-center h-16 w-16 bg-cyan-100 text-cyan-600 rounded-full mx-auto mb-6">
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
              <p className="text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
