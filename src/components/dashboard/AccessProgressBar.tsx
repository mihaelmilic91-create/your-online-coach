import { Progress } from "@/components/ui/progress";
import { Calendar } from "lucide-react";

interface AccessProgressBarProps {
  daysRemaining: number;
  totalDays?: number;
}

const AccessProgressBar = ({ daysRemaining, totalDays = 365 }: AccessProgressBarProps) => {
  const isUnlimited = daysRemaining >= 999;
  const percentage = isUnlimited ? 100 : Math.min((daysRemaining / totalDays) * 100, 100);
  
  const getProgressColor = () => {
    if (isUnlimited) return "bg-accent";
    if (percentage > 50) return "bg-accent";
    if (percentage > 25) return "bg-yellow-500";
    return "bg-destructive";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {isUnlimited 
              ? "Unbegrenzter Zugang"
              : `Dein Zugang läuft in ${daysRemaining} Tagen ab`
            }
          </span>
        </div>
        {!isUnlimited && (
          <span className="font-medium text-foreground">
            {Math.round(percentage)}% verbleibend
          </span>
        )}
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div 
          className={`h-full transition-all duration-500 ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default AccessProgressBar;
