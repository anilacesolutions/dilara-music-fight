/** Shapes returned by Server Actions to their forms. Shared by server and client. */

export type SignupField =
  | "firstName"
  | "lastName"
  | "nickname"
  | "email"
  | "birthDate"
  | "password"
  | "passwordConfirm"
  | "genres"
  | "form";

export interface SignupState {
  errors: Partial<Record<SignupField, string>>;
  /** Echoed back so a failed submit doesn't wipe what the player typed. Never passwords. */
  values: {
    firstName: string;
    lastName: string;
    nickname: string;
    email: string;
    birthDate: string;
    genres: string[];
  };
}

export const initialSignupState: SignupState = {
  errors: {},
  values: { firstName: "", lastName: "", nickname: "", email: "", birthDate: "", genres: [] },
};

export interface LoginState {
  error: string | null;
  nickname: string;
}

export interface ProfileState {
  status: "idle" | "saved" | "error";
  message: string;
}

export const initialProfileState: ProfileState = { status: "idle", message: "" };

export interface ContactState {
  status: "idle" | "sent";
  errors: Partial<Record<"name" | "email" | "subject" | "message" | "form", string>>;
  /** Echoed back so a rejected note isn't lost. */
  values: { name: string; email: string; subject: string; message: string };
}

export const initialContactState: ContactState = {
  status: "idle",
  errors: {},
  values: { name: "", email: "", subject: "", message: "" },
};
