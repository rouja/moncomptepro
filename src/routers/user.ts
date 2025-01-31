import { Router, urlencoded } from "express";
import {
  getJoinOrganizationController,
  getOrganizationSuggestionsController,
  getUnableToAutoJoinOrganizationController,
  postJoinOrganizationMiddleware,
  postQuitUserOrganizationController,
} from "../controllers/organization";
import {
  loginRateLimiterMiddleware,
  rateLimiterMiddleware,
} from "../middlewares/rate-limiter";
import {
  checkEmailInSessionMiddleware,
  checkUserCanAccessAppMiddleware,
  checkUserHasAtLeastOneOrganizationMiddleware,
  checkUserHasNoPendingOfficialContactEmailVerificationMiddleware,
  checkUserHasPersonalInformationsMiddleware,
  checkUserHasSelectedAnOrganizationMiddleware,
  checkUserIsConnectedMiddleware,
  checkUserIsVerifiedMiddleware,
  checkUserSignInRequirementsMiddleware,
} from "../middlewares/user";
import {
  getSignInController,
  getSignUpController,
  getStartSignInController,
  postSignInMiddleware,
  postSignUpController,
  postStartSignInController,
} from "../controllers/user/signin-signup";
import {
  getVerifyEmailController,
  postSendEmailVerificationController,
  postVerifyEmailController,
} from "../controllers/user/verify-email";
import {
  getMagicLinkSentController,
  getSignInWithMagicLinkController,
  postSendMagicLinkController,
  postSignInWithMagicLinkController,
} from "../controllers/user/magic-link";
import {
  getChangePasswordController,
  getResetPasswordController,
  postChangePasswordController,
  postResetPasswordController,
} from "../controllers/user/update-password";
import {
  getPersonalInformationsController,
  postPersonalInformationsController,
} from "../controllers/user/update-personal-informations";
import { getWelcomeController } from "../controllers/user/welcome";
import { issueSessionOrRedirectController } from "../controllers/user/issue-session-or-redirect";
import {
  getChooseSponsorController,
  getNoSponsorFoundController,
  getSponsorValidationController,
  postChooseSponsorMiddleware,
  postNoSponsorFoundMiddleware,
} from "../controllers/user/choose-sponsor";
import {
  getOfficialContactEmailVerificationController,
  postOfficialContactEmailVerificationMiddleware,
} from "../controllers/user/official-contact-email-verification";
import {
  getSelectOrganizationController,
  postSelectOrganizationMiddleware,
} from "../controllers/user/select-organization";
import { csrfProtectionMiddleware } from "../middlewares/csrf-protection";
import nocache from "nocache";
import {
  getSignInWithPasskeyController,
  postVerifyAuthenticationController,
} from "../controllers/webauthn";

export const userRouter = () => {
  const userRouter = Router();

  userRouter.use(nocache());

  userRouter.use(urlencoded({ extended: false }));

  userRouter.get(
    "/start-sign-in",
    csrfProtectionMiddleware,
    getStartSignInController,
  );
  userRouter.post(
    "/start-sign-in",
    rateLimiterMiddleware,
    csrfProtectionMiddleware,
    postStartSignInController,
  );

  userRouter.get(
    "/sign-in",
    checkEmailInSessionMiddleware,
    csrfProtectionMiddleware,
    getSignInController,
  );
  userRouter.post(
    "/sign-in",
    rateLimiterMiddleware,
    checkEmailInSessionMiddleware,
    loginRateLimiterMiddleware,
    csrfProtectionMiddleware,
    postSignInMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.get(
    "/sign-up",
    checkEmailInSessionMiddleware,
    csrfProtectionMiddleware,
    getSignUpController,
  );
  userRouter.post(
    "/sign-up",
    rateLimiterMiddleware,
    checkEmailInSessionMiddleware,
    csrfProtectionMiddleware,
    postSignUpController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/verify-email",
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    getVerifyEmailController,
  );
  userRouter.post(
    "/verify-email",
    rateLimiterMiddleware,
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    postVerifyEmailController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.post(
    "/send-email-verification",
    rateLimiterMiddleware,
    checkUserIsConnectedMiddleware,
    csrfProtectionMiddleware,
    postSendEmailVerificationController,
  );
  userRouter.post(
    "/send-magic-link",
    rateLimiterMiddleware,
    checkEmailInSessionMiddleware,
    csrfProtectionMiddleware,
    postSendMagicLinkController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.get("/magic-link-sent", getMagicLinkSentController);
  userRouter.get(
    "/sign-in-with-magic-link",
    rateLimiterMiddleware,
    csrfProtectionMiddleware,
    getSignInWithMagicLinkController,
  );
  userRouter.post(
    "/sign-in-with-magic-link",
    rateLimiterMiddleware,
    csrfProtectionMiddleware,
    postSignInWithMagicLinkController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.get(
    "/sign-in-with-passkey",
    rateLimiterMiddleware,
    checkEmailInSessionMiddleware,
    csrfProtectionMiddleware,
    getSignInWithPasskeyController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/sign-in-with-passkey",
    rateLimiterMiddleware,
    checkEmailInSessionMiddleware,
    csrfProtectionMiddleware,
    postVerifyAuthenticationController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );
  userRouter.get(
    "/reset-password",
    csrfProtectionMiddleware,
    getResetPasswordController,
  );
  userRouter.post(
    "/reset-password",
    rateLimiterMiddleware,
    csrfProtectionMiddleware,
    postResetPasswordController,
  );
  userRouter.get(
    "/change-password",
    csrfProtectionMiddleware,
    getChangePasswordController,
  );
  userRouter.post(
    "/change-password",
    rateLimiterMiddleware,
    csrfProtectionMiddleware,
    postChangePasswordController,
  );

  userRouter.get(
    "/personal-information",
    checkUserIsVerifiedMiddleware,
    csrfProtectionMiddleware,
    getPersonalInformationsController,
  );
  userRouter.post(
    "/personal-information",
    rateLimiterMiddleware,
    checkUserIsVerifiedMiddleware,
    csrfProtectionMiddleware,
    postPersonalInformationsController,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/organization-suggestions",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getOrganizationSuggestionsController,
  );

  userRouter.get(
    "/join-organization",
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    getJoinOrganizationController,
  );
  userRouter.post(
    "/join-organization",
    rateLimiterMiddleware,
    checkUserHasPersonalInformationsMiddleware,
    csrfProtectionMiddleware,
    postJoinOrganizationMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/unable-to-auto-join-organization",
    getUnableToAutoJoinOrganizationController,
  );

  userRouter.get(
    "/select-organization",
    checkUserHasAtLeastOneOrganizationMiddleware,
    csrfProtectionMiddleware,
    getSelectOrganizationController,
  );

  userRouter.post(
    "/select-organization",
    rateLimiterMiddleware,
    checkUserHasAtLeastOneOrganizationMiddleware,
    csrfProtectionMiddleware,
    postSelectOrganizationMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/official-contact-email-verification/:organization_id",
    rateLimiterMiddleware,
    checkUserHasSelectedAnOrganizationMiddleware,
    csrfProtectionMiddleware,
    getOfficialContactEmailVerificationController,
  );

  userRouter.post(
    "/official-contact-email-verification/:organization_id",
    rateLimiterMiddleware,
    checkUserHasSelectedAnOrganizationMiddleware,
    csrfProtectionMiddleware,
    postOfficialContactEmailVerificationMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/choose-sponsor/:organization_id",
    rateLimiterMiddleware,
    checkUserHasNoPendingOfficialContactEmailVerificationMiddleware,
    csrfProtectionMiddleware,
    getChooseSponsorController,
  );

  userRouter.post(
    "/choose-sponsor/:organization_id",
    rateLimiterMiddleware,
    checkUserHasNoPendingOfficialContactEmailVerificationMiddleware,
    csrfProtectionMiddleware,
    postChooseSponsorMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get("/sponsor-validation", getSponsorValidationController);

  userRouter.get(
    "/no-sponsor-found/:organization_id",
    checkUserHasNoPendingOfficialContactEmailVerificationMiddleware,
    csrfProtectionMiddleware,
    getNoSponsorFoundController,
  );

  userRouter.post(
    "/no-sponsor-found/:organization_id",
    rateLimiterMiddleware,
    checkUserHasNoPendingOfficialContactEmailVerificationMiddleware,
    csrfProtectionMiddleware,
    postNoSponsorFoundMiddleware,
    checkUserSignInRequirementsMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.get(
    "/welcome/:organization_id",
    checkUserSignInRequirementsMiddleware,
    csrfProtectionMiddleware,
    getWelcomeController,
  );
  userRouter.post(
    "/welcome",
    rateLimiterMiddleware,
    checkUserSignInRequirementsMiddleware,
    csrfProtectionMiddleware,
    issueSessionOrRedirectController,
  );

  userRouter.post(
    "/quit-organization/:id",
    checkUserCanAccessAppMiddleware,
    csrfProtectionMiddleware,
    postQuitUserOrganizationController,
  );

  return userRouter;
};

export default userRouter;
