import { formatPhone } from "@/components/modal/types";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function PhoneInput({ value, onChange, placeholder = "+7 (___) ___-__-__", disabled, className, style }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(formatPhone(e.target.value));
  };

  return (
    <input
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      style={style}
      autoComplete="tel"
    />
  );
}
