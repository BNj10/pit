export interface PasswordChangeValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function validatePasswordChange(values: PasswordChangeValues) {
  const errors: Partial<Record<keyof PasswordChangeValues, string>> = {};
  if (!values.currentPassword) errors.currentPassword = "Enter your current password.";
  if (values.newPassword.length < 12) {
    errors.newPassword = "Use at least 12 characters for your new password.";
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword = "Choose a password different from your current password.";
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your new password.";
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "The passwords do not match. Re-enter your new password.";
  }
  return errors;
}
