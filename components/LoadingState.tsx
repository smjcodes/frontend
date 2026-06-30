type LoadingStateProps = {
  label?: string;
};

export default function LoadingState({ label = 'Loading...' }: LoadingStateProps) {
  return <div className="card muted">{label}</div>;
}
