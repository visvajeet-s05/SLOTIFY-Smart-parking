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

        // Notify Python service to reload config for the lot
        // We need the lotId. We'll get it from the first slot update.
        if (updates.length > 0) {
            const firstSlot = await prisma.slot.findUnique({
                where: { id: updates[0].id },
                select: { lotId: true }
            });

            if (firstSlot) {
                const pythonServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:5000';
                try {
                    // Try to trigger a restart/reload on the python service
                    await fetch(`${pythonServiceUrl}/start/${firstSlot.lotId}`, { method: 'POST' });
                } catch (e) {
                    console.error('Failed to notify Python service:', e);
                }
            }
        }

        return NextResponse.json({ success: true, count: operations.length });
    } catch (error) {
        console.error('Error updating slot coordinates:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
