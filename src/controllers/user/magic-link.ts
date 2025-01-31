import { NextFunction, Request, Response } from "express";
import {
  loginWithMagicLink,
  sendSendMagicLinkEmail,
} from "../../managers/user";
import { InvalidEmailError, InvalidMagicLinkError } from "../../config/errors";
import { z, ZodError } from "zod";
import { MONCOMPTEPRO_HOST } from "../../config/env";
import { createLoggedInSession } from "../../managers/session";
import { csrfToken } from "../../middlewares/csrf-protection";
import { setBrowserAsTrustedForUser } from "../../managers/browser-authentication";

export const postSendMagicLinkController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await sendSendMagicLinkEmail(req.session.email!, MONCOMPTEPRO_HOST);

    return res.redirect(`/users/magic-link-sent`);
  } catch (error) {
    if (error instanceof InvalidEmailError) {
      return res.redirect(`/users/start-sign-in?notification=invalid_email`);
    }

    next(error);
  }
};

export const getMagicLinkSentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const email = req.session.email;
    return res.render("user/magic-link-sent", { email });
  } catch (error) {
    next(error);
  }
};

export const getSignInWithMagicLinkController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      magic_link_token: z.string().min(1),
    });

    const { magic_link_token } = await schema.parseAsync(req.query);

    if (!req.session.email) {
      // This is a robot protection mechanism.
      // There is 3 known reasons for req.session.email to be undefined:
      // 1. the user uses a different browser than the one he used to get the magic link
      // 2. the link is clicked by a robot (ex: by Outlook "safe links")
      // 3. the user is already logged in within the current browser
      // By disabling auto-submission here, we prevent robot from using the link
      // without being too annoying for legitimate users that just wanted to use a different browser.
      // Note that switching browser might not be a voluntary action from the user (ex: opening safari on macOS).
      // This mechanism also provides the user with a way to step back.
      return res.render("user/sign-in-with-magic-link", {
        csrfToken: csrfToken(req),
        magicLinkToken: magic_link_token,
      });
    }

    return res.render("autosubmit-form", {
      csrfToken: csrfToken(req),
      actionLabel: "Connexion...",
      actionPath: "/users/sign-in-with-magic-link",
      inputName: "magic_link_token",
      inputValue: magic_link_token,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.redirect(
        `/users/start-sign-in?notification=invalid_magic_link`,
      );
    }

    next(error);
  }
};

export const postSignInWithMagicLinkController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      magic_link_token: z.string().min(1),
    });

    const { magic_link_token } = await schema.parseAsync(req.body);

    const user = await loginWithMagicLink(magic_link_token);
    await createLoggedInSession(req, user);
    setBrowserAsTrustedForUser(req, res, user.id);

    next();
  } catch (error) {
    if (error instanceof InvalidMagicLinkError || error instanceof ZodError) {
      return res.redirect(
        `/users/start-sign-in?notification=invalid_magic_link`,
      );
    }

    next(error);
  }
};
