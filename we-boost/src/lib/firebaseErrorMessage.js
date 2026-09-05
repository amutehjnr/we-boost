// Maps Firebase Auth error codes to plain, user-facing messages —
// never surfaces the word "Firebase" or raw SDK text to the user.
export function friendlyAuthError(err) {
  const code = err?.code || "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password. Please try again.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error — please check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}