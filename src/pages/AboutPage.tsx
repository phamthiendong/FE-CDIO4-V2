import React from "react";
import { INITIAL_DOCTORS } from "../constants";
import { HeartIcon } from "@/components/icons/HeartIcon";
import { LightBulbIcon } from "@/components/icons/LightBulbIcon";

interface AboutPageProps {
  onStart: () => void;
}

const teamMembers = INITIAL_DOCTORS.slice(0, 4); // Showcase first 4 doctors as our team

const TeamMemberCard: React.FC<{ member: (typeof teamMembers)[0] }> = ({
  member,
}) => (
  <div className="text-center">
    <img
      src={member.imageUrl}
      alt={member.name}
      className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-lg object-cover"
    />
    <h3 className="text-xl font-bold text-slate-800">{member.name}</h3>
    <p className="text-cyan-700">{member.specialty}</p>
  </div>
);

export const AboutPage: React.FC<AboutPageProps> = ({ onStart }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Về <span className="text-cyan-600">ClinicAI</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
          Chúng tôi đang định hình lại tương lai của ngành chăm sóc sức khỏe
          bằng cách kết hợp chuyên môn y tế với sức mạnh của trí tuệ nhân tạo,
          giúp mọi người tiếp cận dịch vụ y tế dễ dàng và thông minh hơn.
        </p>
      </section>

      {/* Mission and Technology */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 flex items-start gap-6">
          <div className="flex-shrink-0 bg-cyan-100 p-3 rounded-full">
            <HeartIcon className="w-8 h-8 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Sứ mệnh của chúng tôi
            </h2>
            <p className="text-slate-600">
              Sứ mệnh của ClinicAI là phá bỏ rào cản trong việc tiếp cận dịch vụ
              chăm sóc sức khỏe. Chúng tôi tin rằng mọi người đều xứng đáng nhận
              được sự tư vấn y tế kịp thời và đáng tin cậy, dù họ ở bất cứ đâu.
            </p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 flex items-start gap-6">
          <div className="flex-shrink-0 bg-cyan-100 p-3 rounded-full">
            <LightBulbIcon className="w-8 h-8 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Công nghệ của chúng tôi
            </h2>
            <p className="text-slate-600">
              Nền tảng của chúng tôi được xây dựng trên mô hình AI tiên tiến của
              Google Gemini, có khả năng phân tích thông tin để cung cấp những
              gợi ý ban đầu, giúp định hướng người dùng đến đúng chuyên gia y
              tế.
            </p>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
          Đội ngũ chuyên gia
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Đứng sau ClinicAI là đội ngũ các bác sĩ và chuyên gia tận tâm.
        </p>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-cyan-600 text-white text-center py-16 rounded-2xl">
        <h2 className="text-3xl font-bold">
          Sẵn sàng trải nghiệm tương lai của y tế?
        </h2>
        <p className="mt-4 max-w-2xl mx-auto">
          Bắt đầu hành trình chăm sóc sức khỏe của bạn ngay hôm nay. Chỉ cần mô
          tả triệu chứng và để AI của chúng tôi hỗ trợ bạn.
        </p>
        <div className="mt-8">
          <button
            onClick={onStart}
            className="px-10 py-4 bg-white text-cyan-700 font-bold text-lg rounded-full hover:bg-cyan-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-200 shadow-lg"
          >
            Bắt đầu ngay
          </button>
        </div>
      </section>
    </div>
  );
};
