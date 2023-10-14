const { z } = require("zod");

const registerValidator = z
  .object({
    firstname: z.string().min(1, { message: "firstname is required." }),
    lastname: z.string().min(1, { message: "lastname is required." }),
    email: z.string().min(1, { message: "lastname is required." }).email(),
    password: z
      .string()
      .min(1, { message: "password is required." })
      .min(6, { message: "password must have at least 6 character" }),
    confirmPassword: z
      .string()
      .min(1, { message: "confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password don't match",
    path: ["confirmPassword"],
  });

const loginValidator = z.object({
  email: z.string().min(1, { message: "lastname is required." }).email(),
  password: z
    .string()
    .min(1, { message: "password is required." })
    .min(6, { message: "password must have at least 6 character" }),
});

const emailValidator = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Email is invalid." }),
});

const passwordsValidator = z
  .object({
    password: z
      .string()
      .min(1, { message: "password is required." })
      .min(6, { message: "password must be at least 6 character" }),
    confirmPassword: z
      .string()
      .min(1, { message: "confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password don't match",
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
