type AlertOnButtonProps ={
  onClick: () => void;
  disabled?: boolean;
}

export default function AlertOnButton({
  onClick,
  disabled,
}: AlertOnButtonProps) {
  return (
    <button className="alert-on-btn" onClick={onClick} disabled={disabled}>
      הפעל נכס"ל
    </button>
  );
}
