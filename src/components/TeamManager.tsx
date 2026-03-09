"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Mail, Crown, User } from "lucide-react";

interface Team {
  id: string;
  name: string;
  owner_id: string;
  max_seats: number;
  status: string;
  role?: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export default function TeamManager() {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  
  // Form states
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await fetch('/api/team');
      if (response.ok) {
        const data = await response.json();
        setTeam(data.team);
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) return;

    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName, maxSeats: 5 })
      });

      if (response.ok) {
        await fetchTeam();
        setShowCreate(false);
        setTeamName("");
      }
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !team) return;

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: team.id, email: inviteEmail })
      });

      if (response.ok) {
        alert(`Invitation sent to ${inviteEmail}`);
        setInviteEmail("");
        setShowInvite(false);
      }
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <p className="text-slate-400">Loading team...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">No Team Yet</h3>
          <p className="text-slate-400 mb-4">
            Create a team to share TypeSmart with your colleagues
          </p>
          
          {showCreate ? (
            <form onSubmit={handleCreateTeam} className="max-w-sm mx-auto">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 mb-3"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 py-2 rounded-lg font-medium"
                >
                  Create Team
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="bg-indigo-500 hover:bg-indigo-600 px-6 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Create Team
            </button>
          )}
        </div>
      </div>
    );
  }

  const isOwner = team.role === 'owner';

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{team.name}</h3>
            <p className="text-sm text-slate-400">
              {members.length + 1} / {team.max_seats} members
            </p>
          </div>
        </div>
        
        {isOwner && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Mail className="h-4 w-4" />
            Invite Member
          </button>
        )}
      </div>

      {showInvite && isOwner && (
        <form onSubmit={handleInvite} className="mb-6 p-4 bg-slate-700/50 rounded-xl">
          <h4 className="font-medium mb-3">Invite Team Member</h4>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2"
              required
            />
            <button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg font-medium"
            >
              Send
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {/* Owner */}
        <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
          <div className="h-10 w-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
            <Crown className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Team Owner</p>
            <p className="text-sm text-slate-400">You</p>
          </div>
          <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full">
            Owner
          </span>
        </div>

        {/* Members */}
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl"
          >
            <div className="h-10 w-10 bg-slate-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Team Member</p>
              <p className="text-sm text-slate-400">
                Joined {new Date(member.joined_at).toLocaleDateString()}
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => {/* Remove member */}}
                className="p-2 bg-slate-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-6 text-slate-500">
            <p>No team members yet</p>
            <p className="text-sm">Invite colleagues to collaborate</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-slate-700/30 rounded-xl">
        <h4 className="font-medium mb-2">Team Benefits</h4>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>✓ Unlimited generations for all members</li>
          <li>✓ Shared custom tones</li>
          <li>✓ Centralized billing</li>
          <li>✓ Up to {team.max_seats} team members</li>
        </ul>
      </div>
    </div>
  );
}
