import React from "react";
import { FileText, Download, Eye } from "lucide-react";

interface PastPaperCardProps {
  paper: {
    id: number;
    title: string;
    year: string;
    subject?: string;
  };
  onDownload?: (id: number) => void;
  onView?: (id: number) => void;
}

const PastPaperCard = ({ paper, onDownload, onView }: PastPaperCardProps) => {
  return (
    <div className="content-card past-paper-card">
      <div className="card-header">
        <div className="card-icon">
          <FileText size={20} />
        </div>
        <div className="card-info">
          <h3 className="card-title">{paper.title}</h3>
          <p className="card-subtitle">{paper.subject || "General"} • {paper.year}</p>
        </div>
      </div>
      
      <div className="card-actions">
        <button 
          className="action-button view"
          onClick={() => onView?.(paper.id)}
          title="View Paper"
        >
          <Eye size={16} />
          <span>View</span>
        </button>
        <button 
          className="action-button download"
          onClick={() => onDownload?.(paper.id)}
          title="Download Paper"
        >
          <Download size={16} />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};

export default PastPaperCard;
