const { z } = require("zod");

const registerValidator = (t) =>
  z
    .object({
      firstname: z.string().min(1, { message: t("firstname is required") }),
      lastname: z.string().min(1, { message: t("lastname is required") }),
      email: z
        .string()
        .min(1, { message: t("email is required") })
        .email({ message: t("invalid email address") }),
      password: z
        .string()
        .min(1, { message: t("password is required") })
        .min(6, { message: t("password must have at least 6 character") }),
      confirmPassword: z
        .string()
        .min(1, { message: t("confirm password is required") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("Password and confirm password don't match"),
      path: ["confirmPassword"],
    });

const loginValidator = (t) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t("lastname is required") })
      .email({ message: t("invalid email address") }),
    password: z
      .string()
      .min(1, { message: t("password is required") })
      .min(6, { message: t("password must have at least 6 character") }),
  });

const emailValidator = (t) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t("email is required") })
      .email({ message: t("invalid email address") }),
  });

const passwordsValidator = (t) =>
  z
    .object({
      password: z
        .string()
        .min(1, { message: t("password is required") })
        .min(6, { message: t("password must be at least 6 character") }),
      confirmPassword: z
        .string()
        .min(1, { message: t("confirm password is required") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("Password and confirm password don't match"),
      path: ["confirmPassword"],
    });

const updateUserInfo = z.object({
  firstname: z.string().min(1, { message: "firstname is required." }),
  lastname: z.string().min(1, { message: "lastname is required." }),
  about: z
    .string()
    .max(100, { message: "About must have less than 100 characters." })
    .nullable(),
  avatar: z.string().nullable(),
});

module.exports = {
  registerValidator,
  loginValidator,
  emailValidator,
  passwordsValidator,
  updateUserInfo,
};
