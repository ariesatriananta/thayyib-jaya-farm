import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
      role?: "admin" | "staff";
    };
  }

  interface User {
    id: string;
    username: string;
    role: "admin" | "staff";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: "admin" | "staff";
  }
}
