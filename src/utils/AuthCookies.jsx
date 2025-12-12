import Cookies from "js-cookie";

export const AuthCookies = {
  set(token) {
    Cookies.set("token", token, {
      httpOnly: false,       // frontend library – true only in server response
      secure: true,
      sameSite: "Strict",
      expires: 7,
      path: "/",
    });
  },
  get() {
    return Cookies.get("token") || null;
  },
  remove() {
    Cookies.remove("token", { path: "/" });
  }
};
