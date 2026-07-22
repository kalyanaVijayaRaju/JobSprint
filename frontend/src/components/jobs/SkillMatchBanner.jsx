import { Sparkles } from 'lucide-react';

/**
 * Banner promoting profile skill completion for candidate job matching.
 */
export default function SkillMatchBanner({ onUpdateProfile }) {
  return (
    <div className="match-guidance">
      <Sparkles size={18} aria-hidden="true" />
      <div>
        <strong>Unlock personalized job matches</strong>
        <span>Add skills to your profile to rank roles by fit.</span>
      </div>
      <button type="button" onClick={onUpdateProfile}>
        Update profile
      </button>
    </div>
  );
}
