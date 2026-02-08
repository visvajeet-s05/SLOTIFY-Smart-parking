import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { updates } = body; // Expects an array of { id, x, y, width, height }

        if (!Array.isArray(updates)) {
            return NextResponse.json(
                { error: 'Invalid body, expected "updates" array' },
                { status: 400 }
            );
        }

        // Transaction to update all slots
        const operations = updates.map((update) =>
            prisma.slot.update({
                where: { id: update.id },
                data: {
                    x: Math.round(update.x),
                    y: Math.round(update.y),
                    width: Math.round(update.width),
                    height: Math.round(update.height),
                },
            })
        );

        await prisma.$transaction(operations);

        return NextResponse.json({ success: true, count: operations.length });
    } catch (error) {
        console.error('Error updating slot coordinates:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
