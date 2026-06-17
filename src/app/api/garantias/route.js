import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dias = searchParams.get("dias") || 15;
    
    const res = await fetch(`http://localhost:3000/ordens-servico/garantia/vencendo?dias=${dias}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Erro do backend" }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json({ value: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
