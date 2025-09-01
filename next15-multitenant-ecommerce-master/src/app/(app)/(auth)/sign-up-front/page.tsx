import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { SignUpFront } from "@/modules/auth/ui/views/sign-up-front";

export const dynamic = "force-dynamic";

const Page = async () => {
  const session = await caller.auth.session();

  if (session.user) {
    redirect("/");
  }

  return <SignUpFront />;
};

export default Page;