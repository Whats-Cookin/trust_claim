interface IDropdownProps {
  label: string;
  value: string;
  setter: (value: string) => void;
  options: string[];
  sx?: any;
  variant?: "filled" | "standard" | "outlined" | undefined;
}

export default IDropdownProps;
