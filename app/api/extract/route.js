import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CATEGORIES = ['Klær', 'Sko', 'Vesker', 'Smykker', 'Annet'];

export async function POST(req) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Ikke innlogget.' }, { status: 401 });
  }

  const { itemImage, receiptImage } = await req.json();
  if (!itemImage) {
    return NextResponse.json({ error: 'Mangler bilde av varen.' }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const content = [
    {
      type: 'text',
      text: `Dagens dato er ${today}. Se på bildet av varen${receiptImage ? ' og kvitteringen' : ''}. Svar KUN med et JSON-objekt, ingen markdown, ingen forklaring, med nøyaktig disse feltene: name, category (en av: ${CATEGORIES.join(', ')}), brand, size, color, buyPrice (tall), vat (tall), dateBought (ISO-dato YYYY-MM-DD).`
    },
    { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: itemImage.split(',')[1] } }
  ];
  if (receiptImage) {
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: receiptImage.split(',')[1] } });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content }]
      })
    });

    const data = await res.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({
      name: parsed.name || '',
      category: CATEGORIES.includes(parsed.category) ? parsed.category : 'Annet',
      brand: parsed.brand || '',
      size: parsed.size || '',
      color: parsed.color || '',
      buyPrice: Number(parsed.buyPrice) || 0,
      vat: Number(parsed.vat) || 0,
      dateBought: parsed.dateBought || today
    });
  } catch (e) {
    return NextResponse.json({ error: 'Kunne ikke lese ut data automatisk.' }, { status: 500 });
  }
}
