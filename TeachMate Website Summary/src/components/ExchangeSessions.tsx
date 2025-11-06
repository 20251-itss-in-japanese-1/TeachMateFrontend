import { ExchangeSession, Teacher } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { translations, Language } from '../translations';

interface ExchangeSessionsProps {
  sessions: ExchangeSession[];
  teachers: Teacher[];
  language: Language;
}

export function ExchangeSessions({ sessions, teachers, language }: ExchangeSessionsProps) {
  const t = translations[language];
  const getTeacher = (id: string) => teachers.find(t => t.id === id);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-7 h-7" />
        <h2>{t.upcomingSessions}</h2>
      </div>
      
      {sessions.length === 0 ? (
        <Card className="p-12 text-center border-2">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">{t.noSessions}</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => {
            const teacher1 = getTeacher(session.teacher1Id);
            const teacher2 = getTeacher(session.teacher2Id);
            
            if (!teacher1 || !teacher2) return null;
            
            return (
              <Card key={session.id} className="p-6 border-2">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      <Avatar className="w-14 h-14 border-4 border-white">
                        <AvatarImage src={teacher1.avatar} alt={teacher1.name} />
                        <AvatarFallback>{teacher1.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Avatar className="w-14 h-14 border-4 border-white">
                        <AvatarImage src={teacher2.avatar} alt={teacher2.name} />
                        <AvatarFallback>{teacher2.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="text-gray-700">
                        {teacher1.name} & {teacher2.name}
                      </p>
                      <p className="text-gray-500">
                        {teacher1.nationality === 'Japanese' ? t.japanese : t.vietnamese} × {teacher2.nationality === 'Japanese' ? t.japanese : t.vietnamese}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t.confirmed}
                  </Badge>
                </div>
                
                <h3 className="mb-4">{session.topic}</h3>
                
                <div className="flex items-center gap-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{session.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
