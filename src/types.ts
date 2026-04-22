export type RiskLevel = 'critical' | 'warning' | 'safe';

export interface AuditFinding {
  id: string;
  category: string;
  title: string;
  description: string;
  level: RiskLevel;
  color: 'red' | 'amber' | 'blue';
  lawRef: string;
  recommendation: string;
}

export interface AuditResult {
  score: number;
  summary: string;
  findings: AuditFinding[];
  iaTraining: boolean;
  jurisdiction: string;
  timestamp: string;
  url?: string;
  fileName?: string;
  error?: string;
}
