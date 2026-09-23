-- WhatsApp deixa de ser uma plataforma de "Rede social" e vira um tipo próprio.
-- QRs antigos de SOCIAL/whatsapp continuam como estão (não há migração de dados).
ALTER TYPE "QrKind" ADD VALUE 'WHATSAPP';
