import { NextRequest, NextResponse } from 'next/server';
import { invalidateDataCache, getCategories, getSites } from '@/lib/dataService';

export async function GET(request: NextRequest) {
  try {
    const startTime = performance.now();
    invalidateDataCache();
    
    // Warm up cache immediately
    const [categories, sites] = await Promise.all([getCategories(), getSites()]);
    const durationMs = (performance.now() - startTime).toFixed(2);

    return NextResponse.json({
      status: 'success',
      message: 'Supabase cache refreshed successfully!',
      categoriesCount: categories.length,
      sitesCount: sites.length,
      duration: `${durationMs}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: err.message || 'Failed to refresh cache',
      },
      { status: 500 }
    );
  }
}
