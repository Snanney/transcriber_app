type ProgressBarProps = {
  label: string;
  percent: number | null; // null = unknown duration, show an animated bar
};

export function ProgressBar({ label, percent }: ProgressBarProps) {
  return (
    <div className="progress" role="status">
      <p className="progress-label">
        {label}
        {percent !== null && ` ${percent}%`}
      </p>
      <div className="progress-track">
        <div
          className={percent === null ? "progress-fill indeterminate" : "progress-fill"}
          style={percent === null ? undefined : { width: `${percent}%` }}
        />
      </div>
    </div>
  );
}