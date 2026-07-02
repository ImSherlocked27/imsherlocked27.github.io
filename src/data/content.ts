export interface Localized {
  en: string
  es: string
}

export interface ExperienceEntry {
  company: string
  role: Localized
  location: Localized
  dates: Localized
  bullets: Localized[]
}

export interface SkillGroup {
  category: Localized
  items: string[]
}

export interface EducationEntry {
  degree: Localized
  institution: string
  dates: string
  coursework: Localized
}

export interface Certification {
  name: string
  issuer: string
  status: Localized
}

export type DemoProjectId = 'logistics-analytics' | 'car-marketplace'

export interface HeroStat {
  value: string
  label: Localized
}

export interface CaseStudyMetric {
  value: string
  label: Localized
}

export interface CaseStudy {
  metrics: CaseStudyMetric[]
  problem: Localized
  approach: Localized
  results: Localized
  stack: string[]
}

export interface ProjectEntry {
  title: Localized
  teaser: Localized
  tag?: Localized
  demoId?: DemoProjectId
  caseStudy?: CaseStudy
}

export const ui = {
  nav: {
    experience: { en: 'Experience', es: 'Experiencia' } as Localized,
    skills: { en: 'Skills', es: 'Habilidades' } as Localized,
    projects: { en: 'Projects', es: 'Proyectos' } as Localized,
    education: { en: 'Education', es: 'Educación' } as Localized,
    contact: { en: 'Contact', es: 'Contacto' } as Localized,
  },
  downloadCv: { en: 'Download CV', es: 'Descargar CV' } as Localized,
  tryDemo: { en: 'Try it live', es: 'Probar en vivo' } as Localized,
  readCaseStudy: { en: 'Read case study', es: 'Leer caso de estudio' } as Localized,
  hideCaseStudy: { en: 'Hide case study', es: 'Ocultar caso de estudio' } as Localized,
  caseProblem: { en: 'Problem', es: 'Problema' } as Localized,
  caseApproach: { en: 'What I built', es: 'Qué construí' } as Localized,
  caseResults: { en: 'Results', es: 'Resultados' } as Localized,
  caseStack: { en: 'Stack', es: 'Stack' } as Localized,
  demoStartersLabel: { en: 'Try asking:', es: 'Probá preguntar:' } as Localized,
  demoInputPlaceholder: { en: 'Ask a question…', es: 'Hacé una pregunta…' } as Localized,
  demoRemaining: { en: 'messages left', es: 'mensajes restantes' } as Localized,
  demoSending: { en: 'Thinking…', es: 'Pensando…' } as Localized,
  demoEndTitle: { en: "That's the demo!", es: '¡Eso fue la demo!' } as Localized,
  demoEndCta: { en: 'Want the full version? Get in touch', es: '¿Querés la versión completa? Escribime' } as Localized,
  demoError: { en: 'Something went wrong. Try again.', es: 'Algo salió mal. Intentá de nuevo.' } as Localized,
  demoDailyLimit: {
    en: "Today's demo budget is used up — try again tomorrow.",
    es: 'El presupuesto de demos de hoy se agotó — probá mañana.',
  } as Localized,
  certifications: { en: 'Certifications', es: 'Certificaciones' } as Localized,
  coursework: { en: 'Coursework', es: 'Contenidos' } as Localized,
  footerRights: { en: 'All rights reserved.', es: 'Todos los derechos reservados.' } as Localized,
}

export const demoStarters: Record<DemoProjectId, Localized[]> = {
  'car-marketplace': [
    {
      en: 'I need a family SUV under $22,000 — what do you have?',
      es: 'Necesito una SUV familiar por menos de USD 22.000 — ¿qué tenés?',
    },
    {
      en: "What's the cheapest car with a backup camera?",
      es: '¿Cuál es el auto más barato con cámara de retroceso?',
    },
    {
      en: 'Low mileage and Bluetooth, budget around $13,000',
      es: 'Poco kilometraje y Bluetooth, presupuesto de unos USD 13.000',
    },
  ],
  'logistics-analytics': [
    {
      en: 'Show me all the late deliveries from last month',
      es: 'Mostrame todas las entregas demoradas del mes pasado',
    },
    {
      en: 'Which carrier had the best on-time rate in June?',
      es: '¿Qué transportista tuvo la mejor tasa de puntualidad en junio?',
    },
    {
      en: 'How is provider P-02 performing?',
      es: '¿Cómo viene el desempeño del proveedor P-02?',
    },
  ],
}

export const demoUnderTheHood: Record<DemoProjectId, Localized> = {
  'car-marketplace': {
    en: 'LLM concierge · grounded in a fixed demo catalog · message-capped',
    es: 'Concierge con LLM · limitado a un catálogo demo fijo · mensajes limitados',
  },
  'logistics-analytics': {
    en: 'Data-grounded answers · permission-scoped SQL shown per query · message-capped',
    es: 'Respuestas basadas en datos · SQL con permisos visible por consulta · mensajes limitados',
  },
}

export const hero = {
  name: 'Jeremias Davila',
  title: { en: 'AI Engineer / GenAI Developer', es: 'Ingeniero de IA / Desarrollador GenAI' } as Localized,
  location: 'Córdoba, Argentina',
  email: 'jeremiasdavila@hotmail.es',
  linkedin: 'https://linkedin.com/in/jeremias-davila',
  github: 'https://github.com/imsherlocked27',
  summary: {
    en: 'I build LLM products that survive contact with production: RAG systems, conversational agents over real company data, and the evaluation and observability layers that keep them honest. My work is measured in outcomes — products shipped, latency cut, inference costs reduced — not in demos. Background in data science and ML engineering, so the statistics underneath the AI actually hold up.',
    es: 'Construyo productos con LLMs que sobreviven al contacto con producción: sistemas RAG, agentes conversacionales sobre datos reales de empresas, y las capas de evaluación y observabilidad que los mantienen honestos. Mi trabajo se mide en resultados — productos lanzados, latencia reducida, costos de inferencia optimizados — no en demos. Vengo de data science e ingeniería de ML, así que la estadística debajo de la IA realmente se sostiene.',
  } as Localized,
  stats: [
    {
      value: '3',
      label: { en: 'AI products in production', es: 'productos de IA en producción' },
    },
    {
      value: '−51.8%',
      label: { en: 'agent latency, measured', es: 'latencia de agente, medida' },
    },
    {
      value: '30%+',
      label: { en: 'inference cost reduction', es: 'reducción de costos de inferencia' },
    },
  ] as HeroStat[],
}

export const experience: ExperienceEntry[] = [
  {
    company: 'Caranty',
    role: { en: 'AI Engineer', es: 'Ingeniero de IA' },
    location: { en: 'Córdoba, Argentina', es: 'Córdoba, Argentina' },
    dates: { en: 'Oct 2025 – Mar 2026', es: 'Oct 2025 – Mar 2026' },
    bullets: [
      {
        en: 'Built three AI-driven products: a document processing system, a conversational CRM agent over sales data, and an internal knowledge assistant.',
        es: 'Construí tres productos impulsados por IA: un sistema de procesamiento de documentos, un agente conversacional de CRM sobre datos de ventas, y un asistente de conocimiento interno.',
      },
      {
        en: 'Designed RAG architectures and agentic workflows integrated into existing company systems and databases.',
        es: 'Diseñé arquitecturas RAG y flujos de trabajo agénticos integrados en los sistemas y bases de datos existentes de la empresa.',
      },
      {
        en: 'Connected AI tools to REST APIs and SQL databases, handling the full integration pipeline from data access to user-facing output.',
        es: 'Conecté herramientas de IA a APIs REST y bases de datos SQL, gestionando el pipeline de integración completo desde el acceso a datos hasta la salida para el usuario final.',
      },
      {
        en: 'Managed CI/CD pipelines on Azure DevOps for deployment and iteration.',
        es: 'Gestioné pipelines de CI/CD en Azure DevOps para el despliegue e iteración.',
      },
    ],
  },
  {
    company: 'Freelance / Independent Consultant',
    role: { en: 'Lead AI Engineer', es: 'Lead AI Engineer' },
    location: { en: 'Remote', es: 'Remoto' },
    dates: { en: 'Jan 2024 – Present', es: 'Ene 2024 – Presente' },
    bullets: [
      {
        en: 'Built AI-powered applications and chatbots using LLMs, integrating generative AI APIs (OpenAI, Anthropic/Claude) into products and systems.',
        es: 'Construí aplicaciones y chatbots impulsados por IA usando LLMs, integrando APIs de IA generativa (OpenAI, Anthropic/Claude) en productos y sistemas.',
      },
      {
        en: 'Developed conversational flows, prompts, and RAG pipelines for domain-specific use cases.',
        es: 'Desarrollé flujos conversacionales, prompts, y pipelines RAG para casos de uso específicos de dominio.',
      },
      {
        en: 'Created evaluation frameworks tracking model accuracy, latency, and output quality in production.',
        es: 'Creé frameworks de evaluación para monitorear precisión del modelo, latencia, y calidad de salida en producción.',
      },
      {
        en: 'Reduced inference costs and latency **30%+** through optimization of prompts and API integration patterns.',
        es: 'Reduje costos de inferencia y latencia en **más de un 30%** optimizando prompts y patrones de integración de APIs.',
      },
      {
        en: 'Led small engineering teams (3–5 people), handling code review, architecture decisions, and sprint planning.',
        es: 'Lideré equipos de ingeniería pequeños (3–5 personas), a cargo de code review, decisiones de arquitectura, y planificación de sprints.',
      },
    ],
  },
  {
    company: 'Infolytics Argentina',
    role: { en: 'AI & Data Science Consultant', es: 'Consultor de IA y Data Science' },
    location: { en: 'Argentina', es: 'Argentina' },
    dates: { en: 'Oct 2024 – Feb 2026', es: 'Oct 2024 – Feb 2026' },
    bullets: [
      {
        en: 'Delivered ML solutions for retail and logistics clients: from exploratory analysis through model deployment and monitoring.',
        es: 'Entregué soluciones de ML para clientes de retail y logística: desde análisis exploratorio hasta despliegue y monitoreo de modelos.',
      },
      {
        en: 'Designed ETL pipelines with PySpark for large-scale data extraction and feature generation.',
        es: 'Diseñé pipelines ETL con PySpark para extracción de datos a gran escala y generación de features.',
      },
      {
        en: 'Containerized services and set up CI/CD for automated model deployments with post-deploy observability.',
        es: 'Containericé servicios y configuré CI/CD para despliegues automatizados de modelos con observabilidad post-despliegue.',
      },
    ],
  },
  {
    company: 'Baufest',
    role: { en: 'Data Scientist / ML Engineer', es: 'Data Scientist / Ingeniero de ML' },
    location: { en: 'Argentina', es: 'Argentina' },
    dates: { en: 'Jan 2022 – Mar 2024', es: 'Ene 2022 – Mar 2024' },
    bullets: [
      {
        en: 'Developed predictive models and data analysis solutions for enterprise clients across multiple industries.',
        es: 'Desarrollé modelos predictivos y soluciones de análisis de datos para clientes empresariales en múltiples industrias.',
      },
      {
        en: 'Built data processing pipelines and feature engineering workflows using Python (pandas, NumPy, scikit-learn, PySpark).',
        es: 'Construí pipelines de procesamiento de datos y flujos de feature engineering usando Python (pandas, NumPy, scikit-learn, PySpark).',
      },
      {
        en: 'Collaborated with cross-functional teams — product, engineering, and business stakeholders — to identify where data could drive the most value.',
        es: 'Colaboré con equipos multidisciplinarios — producto, ingeniería, y stakeholders de negocio — para identificar dónde los datos podían generar más valor.',
      },
      {
        en: 'Supported senior data scientists in model development and evaluation, progressively taking ownership of end-to-end project delivery.',
        es: 'Apoyé a data scientists senior en el desarrollo y evaluación de modelos, tomando progresivamente ownership de la entrega end-to-end de proyectos.',
      },
      {
        en: 'Wrote technical documentation and project reports for client-facing deliverables.',
        es: 'Redacté documentación técnica e informes de proyecto para entregables de cara al cliente.',
      },
    ],
  },
  {
    company: 'Maltería & Cervecería Quilmes',
    role: { en: 'Data Scientist — Campaign Analytics', es: 'Data Scientist — Analítica de Campañas' },
    location: { en: 'Argentina', es: 'Argentina' },
    dates: { en: 'Mar 2024 – Oct 2024', es: 'Mar 2024 – Oct 2024' },
    bullets: [
      {
        en: 'Analyzed company databases to support marketing strategy, identifying patterns in campaign performance and customer behavior.',
        es: 'Analicé bases de datos de la empresa para apoyar la estrategia de marketing, identificando patrones en el desempeño de campañas y el comportamiento de clientes.',
      },
      {
        en: 'Built A/B testing frameworks and ran statistical validation (hypothesis testing, significance analysis), contributing to **~20% uplift** in redemption rates.',
        es: 'Construí frameworks de A/B testing y corrí validaciones estadísticas (test de hipótesis, análisis de significancia), contribuyendo a un **incremento de ~20%** en tasas de canje.',
      },
      {
        en: 'Automated reporting pipelines in Python that cut manual analysis time by **~40%**, freeing the team to focus on insights instead of spreadsheets.',
        es: 'Automaticé pipelines de reporting en Python que redujeron el tiempo de análisis manual en un **~40%**, liberando al equipo para enfocarse en insights en vez de planillas.',
      },
      {
        en: 'Created dashboards and visualizations to present findings to both technical and non-technical stakeholders.',
        es: 'Creé dashboards y visualizaciones para presentar hallazgos tanto a stakeholders técnicos como no técnicos.',
      },
    ],
  },
]

export const skills: SkillGroup[] = [
  {
    category: { en: 'Languages', es: 'Lenguajes' },
    items: ['Python', 'SQL', 'R'],
  },
  {
    category: { en: 'ML & Statistics', es: 'ML y Estadística' },
    items: [
      'Regression',
      'Classification',
      'Clustering',
      'Hypothesis testing',
      'A/B testing',
      'Predictive modeling',
      'scikit-learn',
      'PyTorch',
    ],
  },
  {
    category: { en: 'Data & Pipelines', es: 'Datos y Pipelines' },
    items: ['pandas', 'NumPy', 'PySpark', 'Hive', 'ETL design', 'Data quality monitoring'],
  },
  {
    category: { en: 'Visualization', es: 'Visualización' },
    items: ['Dashboards', 'Recharts', 'Data storytelling'],
  },
  {
    category: { en: 'Cloud', es: 'Cloud' },
    items: ['Azure (DevOps, AI services)', 'AWS (S3, SageMaker)'],
  },
  {
    category: { en: 'GenAI & LLMs', es: 'GenAI y LLMs' },
    items: ['LangChain', 'LangGraph', 'RAG', 'Prompt design', 'Chatbot development', 'OpenAI API', 'Anthropic/Claude API'],
  },
  {
    category: { en: 'Engineering Practices', es: 'Prácticas de Ingeniería' },
    items: ['Docker', 'FastAPI', 'CI/CD', 'Git', 'MLflow', 'Model versioning', 'Observability'],
  },
]

export const education: EducationEntry = {
  degree: {
    en: 'Degree in Artificial Intelligence and Data Science',
    es: 'Licenciatura en Inteligencia Artificial y Ciencia de Datos',
  },
  institution: 'IES Siglo XXI',
  dates: '2020 – 2022',
  coursework: {
    en: 'Probability & Statistics, Machine Learning, Deep Learning, Python, R, SQL.',
    es: 'Probabilidad y Estadística, Machine Learning, Deep Learning, Python, R, SQL.',
  },
}

export const certifications: Certification[] = [
  { name: 'People Analytics', issuer: 'Coursera', status: { en: '2024', es: '2024' } },
  { name: 'Baufest PEI Program', issuer: 'Baufest', status: { en: '2023', es: '2023' } },
  { name: 'Microsoft AI Product Manager', issuer: 'Coursera', status: { en: 'In Progress', es: 'En curso' } },
  { name: 'Google AI', issuer: 'Coursera', status: { en: 'In Progress', es: 'En curso' } },
]

export const projects: ProjectEntry[] = [
  {
    title: { en: 'AI-First Used-Car Marketplace', es: 'Marketplace de Autos Usados AI-First' },
    tag: { en: 'Production', es: 'Producción' },
    teaser: {
      en: 'A used-car marketplace with AI woven through every surface: a buyer concierge for search, AI-generated listings and pricing for sellers, and AI-summarized leads for operations.',
      es: 'Un marketplace de autos usados con IA integrada en cada superficie: un concierge conversacional para compradores, publicaciones y valuaciones generadas por IA para vendedores, y leads resumidos por IA para el equipo de operaciones.',
    },
    demoId: 'car-marketplace',
    caseStudy: {
      metrics: [
        { value: '3', label: { en: 'AI surfaces in production', es: 'superficies de IA en producción' } },
        { value: '20+', label: { en: 'eval scenarios guarding behavior', es: 'escenarios de evaluación cuidando el comportamiento' } },
      ],
      problem: {
        en: 'The company wanted AI as a real product layer, not a gimmick: buyers struggled to narrow the inventory to a shortlist, sellers wrote weak listings and mispriced their cars, and the operations team spent hours triaging unstructured leads.',
        es: 'La empresa quería la IA como una capa real del producto, no como un truco: a los compradores les costaba reducir el inventario a una lista corta, los vendedores escribían publicaciones flojas y valuaban mal sus autos, y el equipo de operaciones perdía horas priorizando leads sin estructura.',
      },
      approach: {
        en: 'I built three AI surfaces end to end. A buyer concierge answers plain-language searches with grounded recommendations, combining retrieval over the live inventory with scoped access to the company’s APIs and databases. Sellers get AI-assisted listing text and pricing guidance. Operations receives leads already summarized and classified. Every behavior change runs through an evaluation suite of 20+ scenarios before it ships.',
        es: 'Construí tres superficies de IA de punta a punta. Un concierge para compradores responde búsquedas en lenguaje natural con recomendaciones fundamentadas, combinando retrieval sobre el inventario en vivo con acceso controlado a las APIs y bases de datos de la empresa. Los vendedores reciben texto de publicación y guía de precios asistidos por IA. Operaciones recibe los leads ya resumidos y clasificados. Cada cambio de comportamiento pasa por una suite de evaluación de más de 20 escenarios antes de salir.',
      },
      results: {
        en: 'All three surfaces run in production today. The eval suite catches behavior regressions before deploy instead of after a user complaint — the same discipline that later made a major latency fix measurable (see the post-mortem below).',
        es: 'Las tres superficies están hoy en producción. La suite de evaluación detecta regresiones de comportamiento antes del deploy y no después de la queja de un usuario — la misma disciplina que después hizo medible una mejora grande de latencia (ver el post-mortem más abajo).',
      },
      stack: ['Python', 'RAG', 'LLM agents', 'REST APIs', 'SQL', 'Azure DevOps'],
    },
  },
  {
    title: {
      en: 'Cutting Agent Latency in Half — a Production Post-Mortem',
      es: 'Reducir la Latencia del Agente a la Mitad — un Post-Mortem de Producción',
    },
    tag: { en: 'Post-mortem', es: 'Post-mortem' },
    teaser: {
      en: 'A production agent felt slow, and nobody could say why. I built a stage-by-stage latency benchmark, traced the pipeline, and found a duplicate tool call hiding in every single turn.',
      es: 'Un agente en producción se sentía lento, y nadie podía decir por qué. Construí un benchmark de latencia etapa por etapa, tracé el pipeline, y encontré una llamada a herramienta duplicada escondida en cada turno.',
    },
    caseStudy: {
      metrics: [
        { value: '−51.8%', label: { en: 'mean end-to-end latency', es: 'latencia media end-to-end' } },
        { value: '1', label: { en: 'duplicate tool call per turn, found and removed', es: 'llamada duplicada por turno, encontrada y eliminada' } },
      ],
      problem: {
        en: 'Users experienced the agent as slow, but there were no stage-level measurements — so every optimization idea was a guess, and nobody could say whether a change actually helped.',
        es: 'Los usuarios sentían al agente lento, pero no había mediciones por etapa — así que cada idea de optimización era una conjetura, y nadie podía decir si un cambio realmente ayudaba.',
      },
      approach: {
        en: 'Instead of optimizing blind, I first built a benchmark that measured latency stage by stage across representative conversations. The traces made the problem obvious: the same tool call was executing twice on every turn — invisible in code review, unmissable in the data.',
        es: 'En vez de optimizar a ciegas, primero construí un benchmark que medía la latencia etapa por etapa en conversaciones representativas. Las trazas hicieron obvio el problema: la misma llamada a herramienta se ejecutaba dos veces en cada turno — invisible en el code review, imposible de ignorar en los datos.',
      },
      results: {
        en: 'Removing the duplicate call cut mean latency by 51.8%. The benchmark stayed in the pipeline as a permanent regression guard: a slow deploy now fails loudly instead of degrading quietly.',
        es: 'Eliminar la llamada duplicada redujo la latencia media un 51,8%. El benchmark quedó en el pipeline como guardia de regresión permanente: un deploy lento ahora falla de forma visible en vez de degradarse en silencio.',
      },
      stack: ['Python', 'Tracing & observability', 'Latency benchmarking', 'LLM agents'],
    },
  },
  {
    title: { en: 'Conversational Logistics Analytics', es: 'Analítica Logística Conversacional' },
    tag: { en: 'Live demo', es: 'Demo en vivo' },
    teaser: {
      en: "A secure, chat-based analytics assistant for logistics operations — ask a plain-language question and get a data-grounded answer, with every query automatically scoped to what you're authorized to see.",
      es: 'Un asistente de analítica conversacional y seguro para operaciones logísticas — hacé una pregunta en lenguaje natural y obtené una respuesta basada en datos, con cada consulta automáticamente limitada a lo que estás autorizado a ver.',
    },
    demoId: 'logistics-analytics',
    caseStudy: {
      metrics: [
        { value: 'Row-level', label: { en: 'authorization, enforced in the query layer', es: 'autorización, aplicada en la capa de consultas' } },
        { value: '0', label: { en: 'permissions enforced by prompt alone', es: 'permisos que dependen solo del prompt' } },
      ],
      problem: {
        en: "Operations teams wanted plain-language answers over shipment data, but the data is multi-tenant: each provider must only ever see its own rows. Telling the model 'don’t show other providers’ data' in a prompt is not a security model.",
        es: 'Los equipos de operaciones querían respuestas en lenguaje natural sobre datos de envíos, pero los datos son multi-tenant: cada proveedor solo puede ver sus propias filas. Decirle al modelo en un prompt "no muestres datos de otros proveedores" no es un modelo de seguridad.',
      },
      approach: {
        en: 'I built the assistant so authorization lives in the architecture, not the prompt. The model never touches raw tables: every query it produces runs against a permission-scoped view, filtered server-side by the caller’s identity before the model sees a single row.',
        es: 'Construí el asistente para que la autorización viva en la arquitectura, no en el prompt. El modelo nunca toca tablas crudas: cada consulta que produce corre contra una vista limitada por permisos, filtrada del lado del servidor por la identidad de quien consulta antes de que el modelo vea una sola fila.',
      },
      results: {
        en: 'Users ask in natural language and get grounded answers with the underlying query made visible. Cross-tenant leakage is impossible by construction — the model physically cannot reach rows outside the caller’s scope. The live demo runs the same pattern on an anonymized dataset.',
        es: 'Los usuarios preguntan en lenguaje natural y obtienen respuestas fundamentadas con la consulta subyacente visible. La fuga entre tenants es imposible por construcción — el modelo físicamente no puede alcanzar filas fuera del alcance de quien consulta. La demo en vivo corre el mismo patrón sobre un dataset anonimizado.',
      },
      stack: ['Python', 'SQL', 'LLM agents', 'FastAPI'],
    },
  },
  {
    title: {
      en: 'Campaign A/B Testing at a Major Beverage Company',
      es: 'A/B Testing de Campañas en una Cervecería Líder',
    },
    tag: { en: 'Data science', es: 'Data science' },
    teaser: {
      en: 'Statistical rigor applied to consumer marketing: A/B testing frameworks with proper hypothesis testing, and automated reporting that replaced days of spreadsheet work.',
      es: 'Rigor estadístico aplicado al marketing de consumo: frameworks de A/B testing con test de hipótesis en serio, y reporting automatizado que reemplazó días de trabajo en planillas.',
    },
    caseStudy: {
      metrics: [
        { value: '~20%', label: { en: 'uplift in redemption rates', es: 'de incremento en tasas de canje' } },
        { value: '~40%', label: { en: 'less manual reporting time', es: 'menos tiempo de reporting manual' } },
      ],
      problem: {
        en: 'Campaign decisions leaned on gut feel and manual spreadsheet analysis: slow to produce, hard to trust, and impossible to compare across campaigns.',
        es: 'Las decisiones de campaña se apoyaban en intuición y análisis manual en planillas: lento de producir, difícil de confiar, e imposible de comparar entre campañas.',
      },
      approach: {
        en: 'I built A/B testing frameworks with proper statistical validation — hypothesis testing and significance analysis — and automated the reporting pipeline in Python, turning days of manual analysis into a repeatable process.',
        es: 'Construí frameworks de A/B testing con validación estadística en serio — test de hipótesis y análisis de significancia — y automaticé el pipeline de reporting en Python, convirtiendo días de análisis manual en un proceso repetible.',
      },
      results: {
        en: 'Campaigns validated through the framework contributed to a ~20% uplift in redemption rates, and automated reporting cut manual analysis time by ~40%.',
        es: 'Las campañas validadas con el framework contribuyeron a un incremento de ~20% en tasas de canje, y el reporting automatizado redujo el tiempo de análisis manual en ~40%.',
      },
      stack: ['Python', 'pandas', 'A/B testing', 'Hypothesis testing', 'Dashboards'],
    },
  },
  {
    title: { en: 'Neighborhood Digital Magazine Platform', es: 'Plataforma de Revista Digital de Barrio' },
    tag: { en: 'Concept', es: 'Concepto' },
    teaser: {
      en: 'A hyper-local platform connecting residents, businesses, and community organizations — local ads, neighborhood news, and staff-moderated content, with AI-powered moderation and listing generation as a natural next step.',
      es: 'Una plataforma hiperlocal que conecta vecinos, comercios y organizaciones comunitarias — anuncios locales, noticias de barrio y contenido moderado por el equipo, con moderación y generación de publicaciones por IA como un paso natural a futuro.',
    },
  },
]
