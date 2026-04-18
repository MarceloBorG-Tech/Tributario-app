// ==========================================
// TRIBUTARIOCL - CONFIGURACIÓN OFICIAL AT2026
// ==========================================

export const AÑO_TRIBUTARIO = 2026;

export const TRAMOS = [
  { limite: 11265804.00,  tasa: 0,      rebaja: 0 },
  { limite: 25035120.00,  tasa: 0.04,   rebaja: 450632.16 },
  { limite: 41725200.00,  tasa: 0.08,   rebaja: 1452036.96 },
  { limite: 58415280.00,  tasa: 0.135,  rebaja: 3746922.96 },
  { limite: 75105360.00,  tasa: 0.23,   rebaja: 9296374.56 },
  { limite: 100140480.00, tasa: 0.304,  rebaja: 14854171.20 },
  { limite: 258696240.00, tasa: 0.35,   rebaja: 19460633.28 },
  { limite: Infinity,     tasa: 0.40,   rebaja: 32395445.28 }
];

export const UF_REF = 39728;
export const CREDITO_HIJO      = 4.4 * UF_REF; 
export const APV_A_TOPE_UF     = 600;         
export const APV_A_CREDITO_PCT = 0.15;        
export const APV_B_TOPE_UF     = 600;         

export const CALENDARIO = [
  { fecha: '2026-03-01', titulo: 'Inicio Declaraciones', desc: 'Apertura de plataforma SII', tipo: 'info' },
  { fecha: '2026-04-30', titulo: 'Plazo Máximo F22', desc: 'Vencimiento general', tipo: 'danger' }
];
