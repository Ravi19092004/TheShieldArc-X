
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function DELETE() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await db.scan.deleteMany({
            where: {
                userId: session.user.id,
            },
        });

        return new NextResponse("All scans cleared successfully", { status: 200 });
    } catch (error) {
        console.error("[CLEAR_ALL_SCANS_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
