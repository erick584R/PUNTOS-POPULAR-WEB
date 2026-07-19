export interface RegexErrorProps {
  regex: RegExp;
  errorMessage?: string;
  blocked?: boolean;
}

export interface EventTargetProps {
  target: {
    name: string;
    value: string;
    checked?: boolean;
  };
}

export interface PopularInputProps {
  label: string;
  name: string;
  placeholder?: string;
  className?: string;
  isPassword?: boolean;
  type?: string;
  value?: string | number;
  regex: RegexErrorProps[];
  disabled?: boolean;
  onChange?: (e: EventTargetProps, validation: boolean) => void;
  onFocus?: (e: EventTargetProps) => void;
  onBlur?: (e: EventTargetProps) => void;
  onClick?: () => void;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}