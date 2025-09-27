import { LoaderCircle } from "lucide-react";

export default function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <LoaderCircle className="animate-spin h-16 w-16 text-purple-600 drop-shadow-md" />
      <p className="mt-6 text-lg font-semibold text-purple-700 animate-pulse">
        {text}
      </p>
    </div>
  );
}
