import { UserProfile } from "@clerk/clerk-react";
import { PageWrapper } from "@/components/PageWrapper";
import { AppHeader } from "@/components/AppHeader";

export default function ProfilePage() {
    return (
        <PageWrapper className="bg-background font-sans flex flex-col min-h-screen">
            <AppHeader title="My Profile" />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 flex items-start justify-center overflow-y-auto">
                <div className="w-full flex justify-center shadow-md rounded-xl overflow-hidden border">
                    <UserProfile
                        appearance={{
                            elements: {
                                rootBox: "w-full focus:outline-none",
                                card: "w-full shadow-none sm:rounded-none bg-card text-foreground border-0",
                                navbar: "bg-muted/30 border-r",
                                navbarButton: "text-foreground hover:bg-muted/50",
                                headerTitle: "text-foreground",
                                headerSubtitle: "text-muted-foreground",
                                profileSectionTitleText: "text-foreground",
                                profileSectionPrimaryButton: "text-primary hover:bg-primary/10",
                                badge: "bg-primary/20 text-primary",
                                userPreviewMainIdentifier: "text-foreground",
                                userPreviewSecondaryIdentifier: "text-muted-foreground",
                            }
                        }}
                    />
                </div>
            </main>
        </PageWrapper>
    );
}
