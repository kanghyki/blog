import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

enum What {
  POST = 'post',
  INTRO = 'intro',
}
// `host/api/revalidate?what=<what>&secret=<token>`
export async function POST(request: NextRequest) {
  const what = request.nextUrl.searchParams.get('what');
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATE_SECRET_KEY)
    return Response.json({ message: 'Invalid secret' }, { status: 401 });
  if (!what) return Response.json({ message: 'Missing what param' }, { status: 400 });

  if (what == What.POST) {
    revalidatePath(`${process.env.NEXT_PUBLIC_POST_PATH}/[id]`, 'page');
    revalidatePath(`${process.env.NEXT_PUBLIC_POSTS_PATH}`, 'page');
  } else if (what == What.INTRO) {
    revalidatePath(`${process.env.NEXT_PUBLIC_ABOUT_PATH}`, 'page');
  } else {
    return Response.json({ message: 'Invalid what param' }, { status: 400 });
  }

  return Response.json({ revalidated: true, now: Date.now() });
}
