import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { AllGroups } from '../components/AllGroups';
import { mockGroups } from '../data/mockData';
import { toast } from 'sonner';

export const AllGroupsPage: React.FC = () => {
  const { language } = useAppContext();
  const navigate = useNavigate();

  const handleJoinGroup = (groupId: string) => {
    const group = mockGroups.find(g => g.id === groupId);
    if (group) {
      toast.success(
        language === 'ja'
          ? `${group.name}に参加しました`
          : `Đã tham gia ${group.name}`
      );
    }
  };

  return (
    <AllGroups
      groups={mockGroups}
      language={language}
      onJoinGroup={handleJoinGroup}
      onBack={() => navigate('/')}
    />
  );
};
