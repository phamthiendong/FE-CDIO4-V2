import React, { useState, useEffect, useRef } from 'react';
import type { Appointment, User } from '@/types/types';
import { MicrophoneIcon } from '@/components/icons/MicrophoneIcon';
import { MicrophoneSlashIcon } from '@/components/icons/MicrophoneSlashIcon';
import { VideoCameraIcon } from '@/components/icons/VideoCameraIcon';
import { VideoCameraSlashIcon } from '@/components/icons/VideoCameraSlashIcon';
import { PhoneXMarkIcon } from '@/components/icons/PhoneXMarkIcon';
import { PaperAirplaneIcon } from '@/components/icons/PaperAirplaneIcon';
import { ArrowUpTrayIcon } from '@/components/icons/ArrowUpTrayIcon';

interface VideoCallPageProps {
  appointment: Appointment;
  currentUser: User;
  patient: User | null;
  onEndCall: (transcript: string) => void;
  onFileUpload: (file: {name: string, url: string}) => void;
}

interface ChatMessage {
    sender: 'user' | 'other';
    text: string;
}

export const VideoCallPage: React.FC<VideoCallPageProps> = ({ appointment, currentUser, patient, onEndCall, onFileUpload }) => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPatient = currentUser.role === 'patient';
  const otherParty = isPatient ? appointment.doctor : { name: patient?.name || "Bệnh nhân", imageUrl: 'https://picsum.photos/seed/patient1/200/200' };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        localStreamRef.current = stream;
      })
      .catch(err => {
        console.error("Error accessing media devices.", err);
        alert("Không thể truy cập camera và micro. Vui lòng cấp quyền để bắt đầu cuộc gọi.");
      });

    const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleMic = () => {
    if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsMicMuted(prev => !prev);
    }
  };

  const toggleCamera = () => {
     if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsCameraOff(prev => !prev);
    }
  };

  const handleEndCall = () => {
    const transcript = messages.map(msg => {
        const speaker = msg.sender === 'user' ? (isPatient ? 'Bệnh nhân' : `${currentUser.name}`) : (isPatient ? `${otherParty.name}` : 'Bệnh nhân');
        return `${speaker}: ${msg.text}`;
    }).join('\n\n');
    onEndCall(transcript);
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');

    setTimeout(() => {
        const replyText = isPatient ? "Tôi hiểu rồi, bạn có thể nói rõ hơn không?" : "Vâng, tôi đang nghe đây bác sĩ.";
        setMessages(prev => [...prev, { sender: 'other', text: replyText}]);
    }, 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload({ name: file.name, url: '#' }); // Simulate upload
      setMessages(prev => [...prev, { sender: 'user', text: `Đã đính kèm tệp: ${file.name}` }]);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 h-[85vh]">
      <div className="lg:col-span-2 bg-slate-900 rounded-2xl flex flex-col relative overflow-hidden">
        <div className="flex-grow flex items-center justify-center relative">
           <img src={otherParty.imageUrl} alt={otherParty.name} className="w-40 h-40 rounded-full object-cover opacity-50" />
           <p className="absolute bottom-1/2 translate-y-28 text-white text-xl font-bold">{otherParty.name}</p>
           <div className="absolute top-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                {formatDuration(callDuration)}
           </div>
        </div>

        <video ref={localVideoRef} autoPlay playsInline muted className={`absolute bottom-5 right-5 w-48 h-36 bg-black rounded-lg object-cover border-2 ${isCameraOff ? 'hidden' : 'block'}`}></video>
        <div className={`absolute bottom-5 right-5 w-48 h-36 bg-slate-800 rounded-lg flex items-center justify-center border-2 ${isCameraOff ? 'flex' : 'hidden'}`}>
            <p className="text-white text-sm">Camera tắt</p>
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 p-3 rounded-full">
            <button onClick={toggleMic} className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${isMicMuted ? 'bg-red-500 text-white' : 'bg-slate-600 text-white hover:bg-slate-700'}`}>
                {isMicMuted ? <MicrophoneSlashIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
            </button>
             <button onClick={toggleCamera} className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${isCameraOff ? 'bg-red-500 text-white' : 'bg-slate-600 text-white hover:bg-slate-700'}`}>
                {isCameraOff ? <VideoCameraSlashIcon className="w-6 h-6" /> : <VideoCameraIcon className="w-6 h-6" />}
            </button>
             <button onClick={handleEndCall} className="w-16 h-12 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors">
                <PhoneXMarkIcon className="w-6 h-6" />
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col h-full">
        <div className="p-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-800 text-center">Trò chuyện trực tiếp</h2>
        </div>
         <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-xl ${msg.sender === 'user' ? 'bg-cyan-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                       <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                </div>
            ))}
         </div>
         <div className="p-4 border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300"
                title="Đính kèm tệp"
            >
                <ArrowUpTrayIcon className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-grow p-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:bg-slate-400"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};