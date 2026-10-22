export type Language = "es" | "en";

export const translations = {
  es: {
    nav: {
      home: "Home",
      squadTool: "Squad Tool",
      levelCalculator: "Calculadora por Nivel",
      rules: "Reglamentos",
      hangar: "Hangar",
    },
    home: {
      welcomePrefix: "¡Bienvenido,",
      welcomeHighlight: "Piloto!",
      description:
        "Aquí tienes el equipo de soporte que necesitas antes de despegar. Explora nuestra suite de herramientas diseñadas para darte la ventaja competitiva en combate. Selecciona una opción a continuación para empezar y mantente atento:",
      descriptionStrong:
        "¡nuestra base de ingeniería está preparando nuevas funciones para tu próxima misión!",
    },
    levelCalculator: {
      title: "Calculadoras de Mejora",
      subtitle:
        "Calcula exactamente los recursos que necesitas para subir de nivel tus aviones y sistemas.",
      planeSectionTitle: "Nivel del Avión",
      currentLevel: "Nivel Actual",
      targetLevel: "Nivel Deseado",
      levelOption: "Nivel",
      planeCostTitle: "Costo del Avión",
      pieces: "Piezas",
      silver: "Plata",
      systemsSectionTitle: "Sistemas del Avión",
      tabsSystemsLabel: "Pestañas / Sistemas",
      tabsSystemsTooltip:
        'Número total de sistemas principales que tiene el avión (Fuselaje, Motores, Aviónica, Cañones, etc.). No cuentes la primera pestaña "Aeronave" porque no usa piezas de sistema.',
      secondaryBranchesLabel: "Ramas Sec. (Nvl 5+)",
      secondaryBranchesTooltip:
        "Cantidad de armas secundarias (usualmente misiles) que tiene tu avión. Estas mejoras aparecen a partir del Nivel 5 del avión y tienen un costo de recursos ligeramente distinto.",
      systemsCostTitle: "Costo de Sistemas",
      systemParts: "System Parts",
      advancedParts: "Advanced Parts",
      systemsSilver: "Plata (Sistemas)",
    },
    loading: {
      title: "Cargando Base de Datos",
      subtitle: "Sincronizando información de pilotos...",
    },
    hangarPage: {
      title: "Hangar",
      subtitlePart1:
        "Catálogo completo de aeronaves disponibles por rol de combate. En algunos aviones te dejo una guía opcional",
      subtitlePart2: "si es que no sabes qué mejora subir.",
      filterAndSort: "FILTRAR Y ORDENAR",
      roleFilter: "FILTRO DE ROL",
      allAircraft: "TODAS LAS AERONAVES",
      tacticalGuides: "Guías Tácticas",
      imageLabel: "Imagen",
      ofLabel: "de",
      roles: {
        "Light Fighter": "CAZA LIGERO",
        "Medium Fighter": "CAZA INTERMEDIO",
        "Heavy Fighter": "CAZA PESADO",
        Interceptor: "INTERCEPTOR",
        Attack: "ATAQUE",
      },
    },
  },
  en: {
    nav: {
      home: "Home",
      squadTool: "Squad Tool",
      levelCalculator: "Level Calculator",
      rules: "Rules",
      hangar: "Hangar",
    },
    home: {
      welcomePrefix: "Welcome,",
      welcomeHighlight: "Pilot!",
      description:
        "Here is the support gear you need before takeoff. Explore our suite of tools designed to give you the competitive edge in combat. Select an option to get started and stay tuned:",
      descriptionStrong:
        "our engineering base is preparing new features for your next mission!",
    },
    levelCalculator: {
      title: "Upgrade Calculators",
      subtitle:
        "Calculate the exact resources you need to level up your aircraft and systems.",
      planeSectionTitle: "Aircraft Level",
      currentLevel: "Current Level",
      targetLevel: "Target Level",
      levelOption: "Level",
      planeCostTitle: "Aircraft Cost",
      pieces: "Aircraft Parts",
      silver: "Silver",
      systemsSectionTitle: "Aircraft Systems",
      tabsSystemsLabel: "Tabs / Systems",
      tabsSystemsTooltip:
        'Total number of main systems your aircraft has (Airframe, Engines, Avionics, Cannons, etc.). Do not count the first "Aircraft" tab as it does not use system parts.',
      secondaryBranchesLabel: "Sec. Branches (Lvl 5+)",
      secondaryBranchesTooltip:
        "Number of secondary weapons (usually missiles) your aircraft has. These upgrades appear starting at Aircraft Level 5 and have a slightly different resource cost.",
      systemsCostTitle: "Systems Cost",
      systemParts: "System Parts",
      advancedParts: "Advanced Parts",
      systemsSilver: "Silver (Systems)",
    },
    loading: {
      title: "Loading Database",
      subtitle: "Syncing pilot data...",
    },
    hangarPage: {
      title: "Hangar",
      subtitlePart1:
        "Full catalog of available aircraft by combat role. On some aircraft you'll find an optional guide",
      subtitlePart2: "in case you don't know which upgrade to level up.",
      filterAndSort: "FILTER AND SORT",
      roleFilter: "ROLE FILTER",
      allAircraft: "ALL AIRCRAFT",
      tacticalGuides: "Tactical Guides",
      imageLabel: "Image",
      ofLabel: "of",
      roles: {
        "Light Fighter": "LIGHT FIGHTER",
        "Medium Fighter": "MEDIUM FIGHTER",
        "Heavy Fighter": "HEAVY FIGHTER",
        Interceptor: "INTERCEPTOR",
        Attack: "ATTACK",
      },
    },
  },
} as const;

export type TranslationDictionary = (typeof translations)[Language];
