'use client';

import * as React from 'react';
import DashboardWorkspace from '@/components/admin/analytics/builder/DashboardWorkspace';

export default function IntelligenceHub() {
    return (
        <div className="p-8 pb-40 min-h-screen bg-slate-50">
            <DashboardWorkspace slug="product-war-room" />
        </div>
    );
}
