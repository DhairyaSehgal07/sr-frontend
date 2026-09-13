export function blurTargetOnNumberWheel(e: React.WheelEvent<HTMLInputElement>) {
  e.currentTarget.blur();
}

export const businessNumberSpinnerClassName =
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

export function preventArrowUpDownOnNumericInput(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
  }
}
