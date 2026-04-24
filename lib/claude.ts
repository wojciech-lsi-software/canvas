import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const CLASSIFY_SYSTEM = `Jesteś klasyfikatorem intencji w generatorze materiałów marketingowych LSI Software.
Dostępne szablony: cinema-hotel-base, cinema-generic-base, lsicloud-base, nogasite-base, pitch-generic, onepager-generic.
Zwróć TYLKO JSON bez żadnego tekstu poza nim:
{ "intent": "swap" | "generate", "detectedTemplate": string | null, "detectedClient": string | null, "detectedChanges": string[] }
intent="swap" gdy użytkownik chce podmienić parametry istniejącego szablonu (klient, logo, kolor).
intent="generate" gdy chce wygenerować nowy materiał od zera.`

export const ANALYZE_CLIENT_SYSTEM = `Jesteś ekspertem od analizy stron internetowych firm.
Otrzymasz HTML strony klienta. Wyodrębnij i zwróć TYLKO JSON (bez żadnego tekstu poza nim):
{
  "name": "nazwa firmy",
  "industry": "branża (np. Horeca, E-commerce, Przemysł)",
  "description": "1-2 zdania o firmie i tym co robi",
  "logoUrl": "URL logo jeśli znaleziono w HTML (src z img z logo/brand w nazwie lub alt), lub null",
  "primaryColor": "hex kolor dominujący z CSS/inline styles jeśli znaleziono, lub null",
  "tagline": "hasło firmy jeśli jest widoczne na stronie, lub null"
}
Jeśli czegoś nie możesz ustalić pewnie, wstaw null.`

export const GENERATE_SYSTEM = `Jesteś ekspertem od tworzenia materiałów sprzedażowych HTML dla LSI Software.
Zwróć TYLKO kompletny standalone HTML. Żaden tekst poza nim. Wszystkie style w <style>.

DESIGN — ZAWSZE:
• Font: @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); body { font-family: 'Inter', sans-serif; }
• :root { --accent: [kolor z parametrów]; --navy: #0f1729; --text: #111827; --muted: #6b7280; --border: #e5e7eb; --bg: #f9fafb; --radius: 12px; }
• Karty: white bg, 1px solid var(--border), border-radius var(--radius), subtle box-shadow
• Ikony: inline SVG (stroke-based, fill:none, strokeWidth:1.5), NIE emoji
• Copy: po polsku, benefit-focused, konkretne liczby, zero korpo-żargonu

━━━ LANDING PAGE ━━━
Sekcje (wszystkie widoczne od razu, BEZ animacji opacity:0):
1) NAV sticky: rgba(255,255,255,0.92) backdrop-blur, logo LSI + produkt po lewej, CTA button po prawej
2) HERO: min-height:80vh, gradient background z --accent, H1 benefit-focused (<10 słów), podtytuł, 2 CTA buttony, adnotacja "Bezpłatna prezentacja · Bez zobowiązań"
3) TRUST BAR: 4 liczby z dużą czcionką (np. "850+ klientów", "99,9% SLA")
4) PROBLEMY: 3 karty, border-left:3px solid var(--border)
5) ROZWIĄZANIE: grid 3 kolumny, ikona + H3 + opis
6) JAK DZIAŁA: 4 kroki numerowane
7) PROOF: ciemne tło (--navy), cytat lub wynik liczbowy
8) CTA: gradient --accent, H2 + przycisk
9) FOOTER: --navy, kontakt sprzedaz@lsisoftware.pl

━━━ PRESENTATION ━━━
WAŻNE: Scrollowalna strona, NIE height:100vh slides, NIE JavaScript do nawigacji (powoduje pusty ekran w iframe).
Każdy slajd to section.slide z padding:80px 60px, min-height:auto, page-break-after:always.
Ciemny motyw: background:#0a0f1e, color:white.
Struktura: Cover → Agenda → Problem → Rozwiązanie → Produkt → Case Study → Cennik → Kolejne kroki.
Dodaj @media print { .slide { page-break-after: always; } }
Przyciski "Poprzedni / Następny" OPCJONALNIE, tylko jeśli nie psują layoutu.

━━━ ONE-PAGER ━━━
max-width:800px, margin:0 auto, print-friendly.
Sekcje: header → problem → rozwiązanie → 3 korzyści → proof → CTA + kontakt.
Kompaktowo, 1-2 ekrany.

━━━ SCRIPT ━━━
max-width:720px, format dokumentu.
Sekcje color-coded: OTWARCIE(niebieski), PYTANIA(żółty), WARTOŚĆ(zielony), OBIEKCJE(pomarańczowy), ZAMKNIĘCIE(fioletowy).
Każda sekcja: nagłówek + gotowe frazy + [wskazówki w nawiasach klamrowych].

━━━ EMAIL SEQUENCE ━━━
3 emaile w jednym pliku, każdy w karcie max-width:600px.
Email 1(Dzień 1): nawiązanie + pain point + CTA.
Email 2(Dzień 7): follow-up + case study/liczba + propozycja czasu.
Email 3(Dzień 21): krótki, bezpośredni, pytanie zamknięte.`

export const REMIX_SYSTEM = `Jesteś ekspertem od personalizacji materiałów sprzedażowych.
Otrzymasz gotowy plik HTML z materiałem dla jednego klienta i parametry nowego klienta.
Twoim zadaniem jest zamiana WSZYSTKICH danych klienta (nazwa firmy, branża, logo, kolory, specyficzne szczegóły) na dane nowego klienta.
Zachowaj strukturę, design i układ. Zmień tylko treść specyficzną dla klienta.
Pisz po polsku. Zwróć TYLKO kompletny HTML bez żadnego tekstu poza nim.`
