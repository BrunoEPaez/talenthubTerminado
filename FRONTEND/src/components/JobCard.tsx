import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JobCardProps {
  job: any;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, isFavorite, onToggleFavorite }) => {
  const navigate = useNavigate();

  return (
    <div className="job-card-premium" onClick={() => navigate(`/job/${job.id}`)}>
      <div className="job-info-main">
        <h3>{job.title}</h3>
        <p>{job.company} — {job.location}</p>
        <div className="job-tags">
          <span className="badge">{job.job_type}</span>
          <span className="badge">{job.modality}</span>
        </div>
      </div>
      <div className="job-card-actions">
        <button 
          className={`btn-favorite ${isFavorite ? 'active' : ''}`} 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(job.id); }}
        >
          <Heart fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "#64748b"} />
        </button>
      </div>
    </div>
  );
};

export default JobCard;