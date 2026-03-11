
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function DELETE(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new NextResponse("ID is required", { status: 400 });
        }

        await db.scan.delete({
            where: {
                id: id,
                userId: session.user.id,
            },
        });

        return new NextResponse("Scan entry deleted successfully", { status: 200 });
    } catch (error) {
        console.error("[DELETE_ONE_SCAN_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
