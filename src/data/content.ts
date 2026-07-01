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

export interface ProjectEntry {
  title: Localized
  teaser: Localized
  demoId?: DemoProjectId
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

export const hero = {
  name: 'Jeremias Davila',
  title: { en: 'Data Scientist / ML Engineer', es: 'Data Scientist / Ingeniero de ML' } as Localized,
  location: 'Córdoba, Argentina',
  email: 'jeremiasdavila@hotmail.es',
  linkedin: 'https://linkedin.com/in/jeremias-davila',
  summary: {
    en: 'Data Scientist and ML Engineer with 4+ years turning company data into things people can actually act on. I’ve worked across the full cycle — exploring datasets, building predictive models, running A/B tests, deploying pipelines, and making sure results make sense to people who aren’t data scientists. More recently I’ve been working with LLMs and generative AI to build chatbots and AI-powered tools integrated into real products.',
    es: 'Data Scientist e Ingeniero de ML con más de 4 años convirtiendo datos de la empresa en cosas que la gente realmente puede accionar. Trabajé en todo el ciclo — explorando datasets, construyendo modelos predictivos, corriendo A/B tests, desplegando pipelines, y asegurándome de que los resultados tengan sentido para quienes no son data scientists. Más recientemente estuve trabajando con LLMs e IA generativa para construir chatbots y herramientas de IA integradas en productos reales.',
  } as Localized,
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
        en: 'Reduced inference costs and latency 30%+ through optimization of prompts and API integration patterns.',
        es: 'Reduje costos de inferencia y latencia en más de un 30% optimizando prompts y patrones de integración de APIs.',
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
        en: 'Built A/B testing frameworks and ran statistical validation (hypothesis testing, significance analysis), contributing to ~20% uplift in redemption rates.',
        es: 'Construí frameworks de A/B testing y corrí validaciones estadísticas (test de hipótesis, análisis de significancia), contribuyendo a un incremento de ~20% en tasas de canje.',
      },
      {
        en: 'Automated reporting pipelines in Python that cut manual analysis time by ~40%, freeing the team to focus on insights instead of spreadsheets.',
        es: 'Automaticé pipelines de reporting en Python que redujeron el tiempo de análisis manual en ~40%, liberando al equipo para enfocarse en insights en vez de planillas.',
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
    title: { en: 'Conversational Logistics Analytics', es: 'Analítica Logística Conversacional' },
    teaser: {
      en: "A secure, chat-based analytics assistant for logistics operations — ask a plain-language question and get a data-grounded answer, with every query automatically scoped to what you're authorized to see.",
      es: 'Un asistente de analítica conversacional y seguro para operaciones logísticas — hacé una pregunta en lenguaje natural y obtené una respuesta basada en datos, con cada consulta automáticamente limitada a lo que estás autorizado a ver.',
    },
    demoId: 'logistics-analytics',
  },
  {
    title: { en: 'AI-First Used-Car Marketplace', es: 'Marketplace de Autos Usados AI-First' },
    teaser: {
      en: 'A used-car marketplace with AI woven through every surface: a buyer concierge for search, AI-generated listings and pricing for sellers, and AI-summarized leads for operations.',
      es: 'Un marketplace de autos usados con IA integrada en cada superficie: un concierge conversacional para compradores, publicaciones y valuaciones generadas por IA para vendedores, y leads resumidos por IA para el equipo de operaciones.',
    },
    demoId: 'car-marketplace',
  },
  {
    title: { en: 'Neighborhood Digital Magazine Platform', es: 'Plataforma de Revista Digital de Barrio' },
    teaser: {
      en: 'A hyper-local platform connecting residents, businesses, and community organizations — local ads, neighborhood news, and staff-moderated content, with AI-powered moderation and listing generation as a natural next step.',
      es: 'Una plataforma hiperlocal que conecta vecinos, comercios y organizaciones comunitarias — anuncios locales, noticias de barrio y contenido moderado por el equipo, con moderación y generación de publicaciones por IA como un paso natural a futuro.',
    },
  },
]
