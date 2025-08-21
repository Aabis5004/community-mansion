import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, Home, UserPlus, Crown, Star, MapPin } from 'lucide-react';

const CommunityMansion = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'resident' });
  const [mansion, setMansion] = useState([]);
  const [loading, setLoading] = useState(false);

  // Backend API base URL - Change this to your domain when backend is ready
  const API_BASE = 'https://your-vps-domain.com/api';

  useEffect(() => {
    loadMembers();
    loadMansion();
  }, []);

  const loadMembers = async () => {
    try {
      const response = await fetch(`${API_BASE}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      // Demo data for testing without backend
      setMembers([
        { id: 1, name: 'Alexandra Sterling', email: 'alex@mansion.com', role: 'founder' },
        { id: 2, name: 'Marcus Thompson', email: 'marcus@mansion.com', role: 'moderator' },
        { id: 3, name: 'Sofia Rodriguez', email: 'sofia@mansion.com', role: 'resident' },
        { id: 4, name: 'James Chen', email: 'james@mansion.com', role: 'resident' }
      ]);
    }
  };

  const loadMansion = async () => {
    try {
      const response = await fetch(`${API_BASE}/mansion`);
      if (response.ok) {
        const data = await response.json();
        setMansion(data);
      }
    } catch (error) {
      console.error('Error loading mansion:', error);
      // Demo data
      setMansion([
        { id: 1, name: 'Alexandra Sterling', role: 'founder', joinedAt: '2025-01-15', room: 'penthouse', source: 'manual' },
        { id: 2, name: 'Marcus Thompson', role: 'moderator', joinedAt: '2025-02-01', room: 'library', source: 'search' },
        { id: 3, name: 'Sofia Rodriguez', role: 'resident', joinedAt: '2025-02-15', room: 'garden', source: 'manual' }
      ]);
    }
  };

  const searchMembers = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const searchResults = await response.json();
        const newMembers = searchResults.filter(result => 
          !members.some(member => member.email === result.email)
        );
        setMembers(prev => [...prev, ...newMembers.map(member => ({...member, role: 'guest'}))]);
      }
    } catch (error) {
      console.error('Error searching members:', error);
      // Demo search
      const demoResults = [
        { id: Date.now(), name: `${query} Newcomer`, email: `${query.toLowerCase()}@email.com`, role: 'guest' }
      ];
      setMembers(prev => [...prev, ...demoResults]);
    }
    setLoading(false);
  };

  const addManualMember = async () => {
    if (!newMember.name.trim() || !newMember.email.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });

      if (response.ok) {
        const savedMember = await response.json();
        setMembers(prev => [...prev, savedMember]);
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      const member = { id: Date.now(), ...newMember };
      setMembers(prev => [...prev, member]);
    }

    setNewMember({ name: '', email: '', role: 'resident' });
    setIsAddingMember(false);
  };

  const addToMansion = async (member) => {
    const rooms = ['penthouse', 'library', 'garden', 'workshop', 'lounge', 'study'];
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];

    try {
      const mansionEntry = {
        memberId: member.id,
        name: member.name,
        role: member.role,
        room: randomRoom,
        source: member.role === 'guest' ? 'search' : 'manual',
        joinedAt: new Date().toISOString().split('T')[0]
      };

      const response = await fetch(`${API_BASE}/mansion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mansionEntry)
      });

      if (response.ok) {
        const savedEntry = await response.json();
        setMansion(prev => [...prev, savedEntry]);
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.error('Error adding to mansion:', error);
      setMansion(prev => [...prev, { 
        id: Date.now(), 
        name: member.name, 
        role: member.role,
        room: randomRoom,
        joinedAt: new Date().toISOString().split('T')[0], 
        source: member.role === 'guest' ? 'search' : 'manual'
      }]);
    }
  };

  const removeFromMansion = async (mansionId) => {
    try {
      const response = await fetch(`${API_BASE}/mansion/${mansionId}`, {
        method: 'DELETE'
      });

      if (response.ok || response.status === 404) {
        setMansion(prev => prev.filter(item => item.id !== mansionId));
      }
    } catch (error) {
      console.error('Error removing from mansion:', error);
      setMansion(prev => prev.filter(item => item.id !== mansionId));
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role) => {
    switch(role) {
      case 'founder': return <Crown className="text-yellow-500" size={20} />;
      case 'moderator': return <Star className="text-blue-500" size={20} />;
      case 'resident': return <Home className="text-green-500" size={20} />;
      default: return <Users className="text-gray-500" size={20} />;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'founder': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderator': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resident': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Your elegant logo component
  const MansionLogo = ({ size = 60, animated = false }) => (
    <div className={`relative ${animated ? 'animate-pulse' : ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className="text-amber-800"
        style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}
      >
        <path
          d="M20 25 Q60 10, 100 25"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M25 35 Q60 25, 95 35"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M30 50 Q35 40, 45 50 Q55 60, 65 50 Q75 40, 85 50 Q90 60, 85 70"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M85 50 Q90 40, 85 30"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M35 50 Q30 40, 35 30"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M20 85 Q60 95, 100 85"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M25 75 Q60 85, 95 75"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: `
          linear-gradient(135deg, 
            rgba(251, 239, 210, 0.9) 0%, 
            rgba(245, 230, 195, 0.9) 25%,
            rgba(240, 220, 180, 0.9) 50%,
            rgba(235, 210, 165, 0.9) 75%,
            rgba(230, 200, 150, 0.9) 100%
          ),
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `
      }}
    >
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 opacity-20">
          <MansionLogo size={100} animated={true} />
        </div>
        <div className="absolute top-40 right-32 opacity-15">
          <MansionLogo size={80} animated={true} />
        </div>
        <div className="absolute bottom-32 left-40 opacity-10">
          <MansionLogo size={120} animated={true} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <MansionLogo size={80} />
            <div>
              <h1 className="text-5xl font-bold text-amber-900 mb-2 tracking-wide">
                Community Mansion
              </h1>
              <p className="text-xl text-amber-700 font-medium">
                Where exceptional minds gather and flourish
              </p>
            </div>
            <MansionLogo size={80} />
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-amber-600 to-amber-800 mx-auto rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Members Discovery Section */}
          <div 
            className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl p-8 border border-amber-200"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-amber-900 flex items-center gap-3">
                <Users className="text-amber-700" size={32} />
                Discover Members
              </h2>
              <button
                onClick={() => setIsAddingMember(!isAddingMember)}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus size={20} />
                Invite Member
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600" size={24} />
              <input
                type="text"
                placeholder="Search for distinguished members..."
                className="w-full pl-14 pr-16 py-4 border-2 border-amber-200 rounded-xl focus:ring-4 focus:ring-amber-300 focus:border-amber-400 transition-all duration-300 bg-white/80 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchMembers(searchTerm)}
              />
              <button
                onClick={() => searchMembers(searchTerm)}
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {loading ? '...' : 'Search'}
              </button>
            </div>

            {/* Add Member Form */}
            {isAddingMember && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl mb-8 border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-3 text-lg">
                  <UserPlus size={24} />
                  Extend Personal Invitation
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Distinguished Name"
                    className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:ring-4 focus:ring-amber-300 focus:border-amber-400 transition-all duration-300"
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({...prev, name: e.target.value}))}
                  />
                  <input
                    type="email"
                    placeholder="Private Correspondence"
                    className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:ring-4 focus:ring-amber-300 focus:border-amber-400 transition-all duration-300"
                    value={newMember.email}
                    onChange={(e) => setNewMember(prev => ({...prev, email: e.target.value}))}
                  />
                  <select
                    className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:ring-4 focus:ring-amber-300 focus:border-amber-400 transition-all duration-300"
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({...prev, role: e.target.value}))}
                  >
                    <option value="resident">Resident</option>
                    <option value="moderator">Moderator</option>
                    <option value="founder">Founder</option>
                  </select>
                  <div className="flex gap-3">
                    <button
                      onClick={addManualMember}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Send Invitation
                    </button>
                    <button
                      onClick={() => setIsAddingMember(false)}
                      className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {filteredMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-white/60 to-amber-50/60 rounded-xl hover:from-amber-50 hover:to-orange-50 transition-all duration-300 border border-amber-100 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-900 text-lg">{member.name}</h3>
                      <p className="text-amber-700">{member.email}</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getRoleColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => addToMansion(member)}
                    disabled={mansion.some(m => m.name === member.name)}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                  >
                    {mansion.some(m => m.name === member.name) ? 'In Mansion' : 'Invite to Mansion'}
                  </button>
                </div>
              ))}
              {filteredMembers.length === 0 && (
                <div className="text-center py-12 text-amber-600">
                  <Users size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xl">No members found. Begin your search or extend an invitation.</p>
                </div>
              )}
            </div>
          </div>

          {/* Mansion Residents Section */}
          <div 
            className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl p-8 border border-amber-200"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            <h2 className="text-3xl font-bold text-amber-900 mb-8 flex items-center gap-3">
              <Home className="text-amber-700" size={32} />
              Mansion Residents ({mansion.length})
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {mansion.map(resident => (
                <div key={resident.id} className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {resident.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-green-900 text-lg">{resident.name}</h3>
                        <div className="flex items-center gap-2 text-green-700 mb-1">
                          <MapPin size={16} />
                          <span className="capitalize">{resident.room} Suite</span>
                        </div>
                        <p className="text-sm text-green-600">
                          Joined: {new Date(resident.joinedAt).toLocaleDateString()}
                        </p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border mt-2 ${getRoleColor(resident.role)}`}>
                          {getRoleIcon(resident.role)}
                          {resident.role.charAt(0).toUpperCase() + resident.role.slice(1)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromMansion(resident.id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <Users size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {mansion.length === 0 && (
                <div className="text-center py-12 text-amber-600">
                  <Home size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xl">The mansion awaits its first distinguished residents.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-amber-700">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-24 h-0.5 bg-amber-600"></div>
            <MansionLogo size={40} />
            <div className="w-24 h-0.5 bg-amber-600"></div>
          </div>
          <p className="text-lg font-medium">Community Mansion - Where Excellence Resides</p>
          <p className="text-sm mt-2 opacity-75">
            🎯 Demo Mode: Add members and try the mansion features!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityMansion;
