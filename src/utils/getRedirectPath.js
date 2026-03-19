export const getRedirectPath = (user) => {
  if (!user) return "/signup";

  if (user.isGuest) return "/home";

  switch (user.onboardingStep) {
    case "employee_profile":
      return "/signup/employee";

    case "hirer_profile":
      return "/signup/hirer";

    case "completed":
      return "/home";

    default:
      return "/signup";
  }
};
