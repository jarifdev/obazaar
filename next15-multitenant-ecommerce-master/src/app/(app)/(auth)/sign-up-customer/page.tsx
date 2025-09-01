import { redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { CustomerSignUpView } from "@/modules/auth/ui/views/customer-sign-up-view";

export const dynamic = "force-dynamic";

const Page = async () => {
  const session = await caller.auth.session();

  if (session.user) {
    redirect("/");
  }

  return <CustomerSignUpView />;
};

export default Page;
