import { CapsuleForm } from "@/components/capsule-form";

export default function CapsulePage() {
  return (
    <main className="flex-1 flex flex-col items-center p-6 pt-36 md:pt-48 relative min-h-screen">
      <div className="w-full max-w-2xl relative z-10 my-8">
        <CapsuleForm />
      </div>
    </main>
  );
}
