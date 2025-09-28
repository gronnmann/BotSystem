import {User} from "lucide-react"
import {COLOR_CLASSES} from "@/lib/profile-colors"
import {Tables} from "@/lib/database.types";

export default function ProfileDisplay({profile}: { profile: Tables<"profiles"> }) {
    const bgColor =
        (profile.color ? COLOR_CLASSES[profile.color] : "bg-gray-500") || "bg-gray-500"
    const name = profile.display_name?.trim() || profile.email

    return (
        <div className="flex items-center gap-2">
            <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${bgColor}`}>
                <User className="h-5 w-5"/>
            </div>
            <span className="text-lg font-semibold">{name}</span>
        </div>
    )
}
