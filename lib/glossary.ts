// Central glossary. Every financial term shown in the UI should have an entry here.
// Keep definitions in Spanish (Argentinian neutral), friendly and example-driven.

export type GlossaryEntry = {
  term: string;
  label: string; // short display name (e.g. "P/E")
  short: string; // 1-line definition
  long?: string; // extended explanation
  good?: string; // what's considered a good value
  example?: string;
  category:
    | "concepto"
    | "fundamental"
    | "tecnico"
    | "valuation"
    | "riesgo"
    | "portfolio"
    | "macro"
    | "cripto";
};

export const GLOSSARY: Record<string, GlossaryEntry> = {
  accion: {
    term: "accion",
    label: "Acción",
    short: "Una porción chiquita de propiedad de una empresa.",
    long: "Cuando comprás una acción, te volvés dueño de una parte mínima del negocio. Si la empresa crece, tu parte vale más; si le va mal, vale menos.",
    example: "Comprar 1 acción de Apple te hace dueño de 1/15.000.000.000 de Apple.",
    category: "concepto",
  },
  etf: {
    term: "etf",
    label: "ETF",
    short: "Un paquete de muchas acciones que cotiza como si fuera una sola.",
    long: "En vez de comprar 500 acciones por separado, comprás un ETF (ej: SPY) y ya tenés todas adentro. Simplifica diversificación.",
    example: "SPY replica al S&P 500 (las 500 empresas más grandes de EEUU).",
    category: "concepto",
  },
  bono: {
    term: "bono",
    label: "Bono",
    short: "Un préstamo que le hacés a un gobierno o empresa, que te pagan con intereses.",
    long: "El emisor devuelve el capital al vencimiento y paga intereses cada tanto (cupón). Menos volátil que acciones, pero rinde menos.",
    category: "concepto",
  },
  ticker: {
    term: "ticker",
    label: "Ticker",
    short: "El código corto que identifica a una acción en la bolsa.",
    example: "AAPL = Apple. TSLA = Tesla. BRK-B = Berkshire Hathaway clase B.",
    category: "concepto",
  },
  cripto: {
    term: "cripto",
    label: "Cripto",
    short: "Activo digital que vive en una red descentralizada (blockchain).",
    long: "A diferencia de las acciones, las cripto no representan propiedad de una empresa. Su valor depende de oferta, demanda y utilidad de la red.",
    category: "cripto",
  },
  marketcap: {
    term: "marketcap",
    label: "Market Cap",
    short: "Cuánto vale la empresa entera en la bolsa: precio × acciones totales.",
    example: "Si AAPL vale $180 y hay 15B de acciones, su market cap es $2.7T.",
    category: "fundamental",
  },
  pe: {
    term: "pe",
    label: "P/E",
    short: "Cuántos años de ganancia actual pagás al comprar la acción.",
    long: "Precio / Earnings. Un P/E de 20 significa que pagás 20 dólares por cada 1 dólar de ganancia anual. Hay que compararlo con el sector.",
    good: "En general: < 15 barato, 15-25 razonable, 25-40 caro, > 40 muy caro (salvo crecimiento alto).",
    category: "fundamental",
  },
  forwardpe: {
    term: "forwardpe",
    label: "Forward P/E",
    short: "Igual al P/E pero usando la ganancia esperada del próximo año.",
    category: "fundamental",
  },
  pb: {
    term: "pb",
    label: "P/B",
    short: "Cuánto pagás por cada peso de patrimonio contable de la empresa.",
    long: "Price / Book. Útil para bancos y empresas con muchos activos físicos. Menos útil para tech (patrimonio mayormente intangible).",
    good: "< 1 barato (contable); 1-3 razonable; > 3 caro.",
    category: "fundamental",
  },
  ps: {
    term: "ps",
    label: "P/S",
    short: "Cuánto pagás por cada peso de facturación (ventas).",
    long: "Price / Sales. Se usa cuando la empresa todavía no tiene ganancias. Útil para startups y growth.",
    category: "fundamental",
  },
  evebitda: {
    term: "evebitda",
    label: "EV/EBITDA",
    short: "Valor total de la empresa dividido por su ganancia operativa antes de amortizaciones.",
    long: "Como el P/E pero incluyendo la deuda. Más comparable entre empresas con estructuras de capital distintas.",
    good: "< 8 barato, 8-15 razonable, > 15 caro (depende del sector).",
    category: "valuation",
  },
  dividendyield: {
    term: "dividendyield",
    label: "Div Yield",
    short: "Porcentaje anual que la empresa te paga en dividendos sobre el precio actual.",
    example: "Un yield del 3% significa que por cada $100 invertidos, te pagan $3 al año en dividendos.",
    category: "fundamental",
  },
  payoutratio: {
    term: "payoutratio",
    label: "Payout Ratio",
    short: "Qué porcentaje de sus ganancias reparte en dividendos.",
    good: "< 60% saludable; > 80% puede no ser sostenible.",
    category: "fundamental",
  },
  eps: {
    term: "eps",
    label: "EPS",
    short: "Ganancia por acción. Net Income / acciones en circulación.",
    category: "fundamental",
  },
  revenue: {
    term: "revenue",
    label: "Revenue",
    short: "La facturación total de la empresa. Cuánto vendió.",
    category: "fundamental",
  },
  grossprofit: {
    term: "grossprofit",
    label: "Gross Profit",
    short: "Revenue menos el costo directo de producir lo que vendió.",
    category: "fundamental",
  },
  grossmargin: {
    term: "grossmargin",
    label: "Gross Margin",
    short: "Gross Profit / Revenue. Cuánto queda después del costo directo.",
    good: "Depende del sector. Software > 70%, retail 20-40%, commodities 5-15%.",
    category: "fundamental",
  },
  operatingmargin: {
    term: "operatingmargin",
    label: "Operating Margin",
    short: "Ganancia operativa / Revenue. Mide eficiencia del negocio core.",
    category: "fundamental",
  },
  netmargin: {
    term: "netmargin",
    label: "Net Margin",
    short: "Ganancia neta / Revenue. Cuánto queda al final, después de todo.",
    category: "fundamental",
  },
  roe: {
    term: "roe",
    label: "ROE",
    short: "Ganancia neta / Patrimonio. Cuánto genera por cada peso de los accionistas.",
    good: "> 15% bueno; > 20% excelente.",
    category: "fundamental",
  },
  roa: {
    term: "roa",
    label: "ROA",
    short: "Ganancia neta / Activos totales. Cuánto gana con cada peso de activos.",
    category: "fundamental",
  },
  roic: {
    term: "roic",
    label: "ROIC",
    short: "Retorno sobre el capital invertido. Mide si la empresa genera valor con la plata prestada + de accionistas.",
    good: "> WACC significa que la empresa crea valor.",
    category: "fundamental",
  },
  ebitda: {
    term: "ebitda",
    label: "EBITDA",
    short: "Ganancia antes de intereses, impuestos, depreciación y amortización.",
    long: "Aproximación a la ganancia operativa 'en efectivo', ignorando cómo se financia y su política contable. Ojo: no es cash flow real.",
    category: "fundamental",
  },
  fcf: {
    term: "fcf",
    label: "Free Cash Flow",
    short: "La plata real que genera el negocio después de mantener las operaciones.",
    long: "Operating CF menos inversiones necesarias (CapEx). Es la plata que la empresa puede usar para deuda, dividendos, recompras o crecer.",
    category: "fundamental",
  },
  fcfyield: {
    term: "fcfyield",
    label: "FCF Yield",
    short: "Free Cash Flow / Market Cap. Cuánto cash genera por cada peso invertido.",
    good: "> 5% atractivo, > 8% muy bueno.",
    category: "fundamental",
  },
  debtequity: {
    term: "debtequity",
    label: "Debt / Equity",
    short: "Cuánta deuda tiene vs cuánto patrimonio propio.",
    good: "< 1 saludable; > 2 apalancada (depende del sector).",
    category: "fundamental",
  },
  currentratio: {
    term: "currentratio",
    label: "Current Ratio",
    short: "Activos de corto plazo / Pasivos de corto plazo. Capacidad de pagar lo inmediato.",
    good: "> 1.5 saludable.",
    category: "fundamental",
  },
  quickratio: {
    term: "quickratio",
    label: "Quick Ratio",
    short: "Como current ratio pero sin contar inventario. Más conservador.",
    category: "fundamental",
  },
  beta: {
    term: "beta",
    label: "Beta",
    short: "Cuánto se mueve la acción vs el mercado. 1 = igual, 2 = el doble, 0.5 = la mitad.",
    long: "Beta > 1: más volátil que el mercado. Beta < 1: más estable. Beta negativo: se mueve al revés del mercado.",
    category: "riesgo",
  },
  volatilidad: {
    term: "volatilidad",
    label: "Volatilidad",
    short: "Qué tan oscilantes son los retornos. Más alta = más riesgo de corto plazo.",
    category: "riesgo",
  },
  sharpe: {
    term: "sharpe",
    label: "Sharpe Ratio",
    short: "Retorno ajustado por riesgo. Cuánto ganás por cada unidad de volatilidad.",
    good: "> 1 decente, > 2 muy bueno, > 3 excelente.",
    category: "riesgo",
  },
  sortino: {
    term: "sortino",
    label: "Sortino Ratio",
    short: "Como Sharpe pero solo mide la volatilidad mala (caídas). Más justo que Sharpe.",
    category: "riesgo",
  },
  maxdrawdown: {
    term: "maxdrawdown",
    label: "Max Drawdown",
    short: "La peor caída histórica, de pico a valle.",
    example: "Si algo cayó 40% desde su máximo, su max drawdown fue -40%.",
    category: "riesgo",
  },
  shortinterest: {
    term: "shortinterest",
    label: "Short Interest",
    short: "Porcentaje de las acciones apostadas a la baja.",
    long: "Si es muy alto (> 20%) hay mucha gente esperando que baje. Puede haber short squeeze si suben de golpe.",
    category: "riesgo",
  },
  rsi: {
    term: "rsi",
    label: "RSI",
    short: "Índice de fuerza relativa. Mide si la acción está sobrecomprada o sobrevendida.",
    long: "RSI > 70: sobrecomprada (posible corrección). RSI < 30: sobrevendida (posible rebote). Va de 0 a 100.",
    category: "tecnico",
  },
  macd: {
    term: "macd",
    label: "MACD",
    short: "Indicador de momentum que cruza dos promedios móviles.",
    long: "Cuando la línea MACD cruza por arriba la señal: momentum alcista. Por abajo: bajista. Sirve para timing de entrada/salida.",
    category: "tecnico",
  },
  ema: {
    term: "ema",
    label: "EMA",
    short: "Promedio móvil exponencial: da más peso a los precios recientes.",
    long: "EMA 50 y 200 son las más miradas. Cuando la de 50 cruza por arriba la de 200 se llama 'golden cross' (alcista).",
    category: "tecnico",
  },
  sma: {
    term: "sma",
    label: "SMA",
    short: "Promedio móvil simple del precio en N días.",
    category: "tecnico",
  },
  goldencross: {
    term: "goldencross",
    label: "Golden Cross",
    short: "La EMA 50 cruza por encima de la EMA 200. Señal alcista de largo plazo.",
    category: "tecnico",
  },
  deathcross: {
    term: "deathcross",
    label: "Death Cross",
    short: "La EMA 50 cruza por debajo de la EMA 200. Señal bajista.",
    category: "tecnico",
  },
  bollinger: {
    term: "bollinger",
    label: "Bollinger Bands",
    short: "Bandas alrededor del precio que marcan volatilidad.",
    long: "Cuando el precio toca la banda superior, puede estar caro; la inferior, barato. Un breakout indica movimiento fuerte.",
    category: "tecnico",
  },
  atr: {
    term: "atr",
    label: "ATR",
    short: "Rango promedio de precio. Sirve para calcular stop loss razonables.",
    example: "Si el ATR es $2 y comprás a $100, un stop a $96 (2×ATR) es razonable.",
    category: "tecnico",
  },
  adx: {
    term: "adx",
    label: "ADX",
    short: "Fuerza de la tendencia. > 25: tendencia fuerte. < 20: mercado lateral.",
    category: "tecnico",
  },
  support: {
    term: "support",
    label: "Soporte",
    short: "Nivel de precio donde históricamente el activo deja de caer.",
    category: "tecnico",
  },
  resistance: {
    term: "resistance",
    label: "Resistencia",
    short: "Nivel de precio donde históricamente deja de subir.",
    category: "tecnico",
  },
  dcf: {
    term: "dcf",
    label: "DCF",
    short: "Modelo que calcula cuánto vale hoy la plata que la empresa va a generar en el futuro.",
    long: "Discounted Cash Flow. Proyectás los flujos de caja futuros, los 'traés al presente' con una tasa de descuento (WACC), y eso te da un valor justo por acción.",
    category: "valuation",
  },
  wacc: {
    term: "wacc",
    label: "WACC",
    short: "Costo promedio del capital que usa la empresa (deuda + patrimonio).",
    long: "Es la tasa que se usa para descontar flujos futuros. Típicamente entre 7% y 12% para empresas maduras.",
    category: "valuation",
  },
  terminalvalue: {
    term: "terminalvalue",
    label: "Terminal Value",
    short: "Valor asumido de la empresa al final del período de proyección, creciendo a tasa perpetua.",
    category: "valuation",
  },
  fairvalue: {
    term: "fairvalue",
    label: "Valor Justo",
    short: "El precio teórico que debería tener la acción según el modelo.",
    long: "Si está muy por debajo del precio actual, la acción puede estar barata. Ojo con asumir certeza — depende de supuestos.",
    category: "valuation",
  },
  moat: {
    term: "moat",
    label: "Moat (ventaja competitiva)",
    short: "Qué tan difícil es para un competidor robarle el negocio a esta empresa.",
    long: "Un moat fuerte (marca, costos, red, switching costs) protege márgenes a largo plazo. Concepto popularizado por Warren Buffett.",
    category: "concepto",
  },
  moatIntangibles: {
    term: "moatIntangibles",
    label: "Moat: Intangibles",
    short: "Marcas, patentes, licencias, regulación que protegen al negocio.",
    example: "Coca-Cola tiene marca; Merck tiene patentes; las AFPs tienen licencia.",
    category: "concepto",
  },
  moatNetwork: {
    term: "moatNetwork",
    label: "Moat: Efecto Red",
    short: "Cuantos más usuarios hay, más valiosa es la red para los siguientes.",
    example: "Facebook, Visa, Uber.",
    category: "concepto",
  },
  moatCost: {
    term: "moatCost",
    label: "Moat: Costos",
    short: "Producir más barato que la competencia por escala o proceso único.",
    example: "Walmart, Costco, Amazon.",
    category: "concepto",
  },
  moatSwitching: {
    term: "moatSwitching",
    label: "Moat: Switching Costs",
    short: "Cambiarse de proveedor sale caro, difícil o lento.",
    example: "Microsoft Office, Salesforce, sistemas ERP.",
    category: "concepto",
  },
  insiderTrading: {
    term: "insiderTrading",
    label: "Insider Trading",
    short: "Compras y ventas que hacen los ejecutivos y directores de la empresa.",
    long: "Si los insiders compran fuerte, suele ser buena señal. Si venden masivamente, vale investigar por qué.",
    category: "fundamental",
  },
  institutional: {
    term: "institutional",
    label: "Propiedad Institucional",
    short: "Porcentaje de la empresa en manos de fondos (pension, ETFs, hedge funds).",
    category: "fundamental",
  },
  earnings: {
    term: "earnings",
    label: "Earnings",
    short: "Resultados trimestrales que la empresa reporta.",
    long: "4 veces al año las empresas publicamos ingresos, ganancias y guidance. Es el evento con mayor movimiento de precio.",
    category: "concepto",
  },
  tenK: {
    term: "tenK",
    label: "10-K",
    short: "Informe anual obligatorio que las empresas US presentan a la SEC.",
    long: "Contiene estados financieros, riesgos, estrategia y competidores. La fuente más completa de información.",
    category: "fundamental",
  },
  cpi: {
    term: "cpi",
    label: "CPI",
    short: "Índice de precios al consumidor. Mide inflación.",
    category: "macro",
  },
  fedfunds: {
    term: "fedfunds",
    label: "Fed Funds Rate",
    short: "Tasa de interés de referencia de la Fed (EEUU).",
    category: "macro",
  },
  yieldcurve: {
    term: "yieldcurve",
    label: "Yield Curve",
    short: "Curva que muestra la tasa de interés de los bonos según su plazo.",
    long: "Cuando se invierte (tasas cortas > largas), suele preceder a una recesión.",
    category: "macro",
  },
  dxy: {
    term: "dxy",
    label: "DXY",
    short: "Índice del dólar vs canasta de monedas principales. Termómetro del dólar.",
    category: "macro",
  },
  vix: {
    term: "vix",
    label: "VIX",
    short: "Índice de miedo: volatilidad implícita del S&P 500 a 30 días.",
    good: "< 20 calma, 20-30 tensión, > 30 pánico.",
    category: "macro",
  },
  stoploss: {
    term: "stoploss",
    label: "Stop Loss",
    short: "Precio al que vendés automáticamente para limitar pérdidas.",
    category: "portfolio",
  },
  positionsize: {
    term: "positionsize",
    label: "Position Size",
    short: "Cuánta plata ponés en cada posición. Clave para manejar riesgo.",
    good: "Típicamente 1-5% por posición para inversores cautos.",
    category: "portfolio",
  },
  fomo: {
    term: "fomo",
    label: "FOMO",
    short: "Fear Of Missing Out: comprar por miedo a quedarse afuera, no por análisis.",
    long: "Es el enemigo del inversor. Si te sale comprar algo solo porque 'todos están ganando', pará y revisá la tesis.",
    category: "concepto",
  },
  sentiment: {
    term: "sentiment",
    label: "Sentiment",
    short: "El tono general de una noticia o del mercado: positivo, neutro o negativo.",
    category: "concepto",
  },
};

export function getTerm(term: string): GlossaryEntry | undefined {
  return GLOSSARY[term];
}

export function listGlossary(): GlossaryEntry[] {
  return Object.values(GLOSSARY).sort((a, b) => a.label.localeCompare(b.label, "es"));
}
