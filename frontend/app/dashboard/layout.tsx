import LoadingScreen from "@/components/loading-screen";
import { useBotSystems } from "@/queries/botQueries";

export default function DashboardLayout({children}: {children: React.ReactNode}) {

    const {isLoading, isError} = useBotSystems();

    if (isLoading ){ 
        return <LoadingScreen text="Laster inn botsystemer..." />
    }

    if (isError) {
        return <div>Kunne ikke laste inn botsystemer...</div>
    }

    return children;
}