import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const CLASSIFY_SYSTEM = `Jesteś klasyfikatorem intencji w generatorze materiałów marketingowych LSI Software.
Dostępne szablony: cinema-hotel-base, cinema-generic-base, lsicloud-base, nogasite-base, pitch-generic, onepager-generic.
Zwróć TYLKO JSON bez żadnego tekstu poza nim:
{ "intent": "swap" | "generate", "detectedTemplate": string | null, "detectedClient": string | null, "detectedChanges": string[] }
intent="swap" gdy użytkownik chce podmienić parametry istniejącego szablonu (klient, logo, kolor).
intent="generate" gdy chce wygenerować nowy materiał od zera.`

export const GENERATE_SYSTEM = `Jesteś ekspertem od tworzenia materiałów marketingowych dla LSI Software.
Generujesz HTML landing page'y, prezentacje i one-pagery dla polskich klientów B2B.
Twórz profesjonalne, przekonujące treści po polsku. Design: minimalistyczny, nowoczesny.
Używaj inline CSS. Zwróć TYLKO kompletny HTML bez żadnego tekstu poza nim.`
