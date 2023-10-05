import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

// `host/api/revalidate?what=<what>&secret=<token>`
export async function POST(request: NextRequest) {
  const what = request.nextUrl.searchParams.get('what');
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATE_SECRET_KEY)
    return Response.json({ message: 'Invalid secret' }, { status: 401 });

  switch (what) {
    case 'post':
      revalidatePath('/post/[id]', 'page');
      revalidatePath('/post', 'page');
      break;
    case 'introduction':
      revalidatePath('/', 'page');
      break;
    default:
      return Response.json({ message: 'Missing what param' }, { status: 400 });
  }

  return Response.json({ revalidated: true, now: Date.now() });
}
