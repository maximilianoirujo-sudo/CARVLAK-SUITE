/**
 * DetailVlak - Datos Oficiales de Tarifas, Servicios y Turnos
 * Taller Shangrilá, Canelones - Maximiliano & Romina
 */

window.DETAILVLAK_DATA = {
  shopInfo: {
    name: "DetailVlak",
    address: "Av. Giannattasio y, 15000 Shangrilá, Canelones",
    phone: "59899123456",
    instagram: "@detailvlak"
  },

  tariffs: [
    {
      id: "interior",
      name: "Limpieza profunda de interiores",
      shortName: "Limpieza Interior Full",
      description: "Inyección y extracción de tapizados, limpieza profunda a vapor, techo, alfombras y desinfección total de conductos.",
      durationHours: 5,
      prices: { chico: 3500, mediano: 4200, suv: 4900, pickup: 5800, moto: 2000 }
    },
    {
      id: "cuero",
      name: "Nutrición y restauración de cuero",
      shortName: "Tratamiento de Cuero",
      description: "Limpieza técnica de poros y nutrición profunda con acondicionadores mate pH neutro que devuelven suavidad y protegen de grietas.",
      durationHours: 3,
      prices: { chico: 2200, mediano: 2600, suv: 3200, pickup: 3800, moto: 1500 }
    },
    {
      id: "motor",
      name: "Lavado y detallado técnico de motor",
      shortName: "Detallado de Motor",
      description: "Limpieza técnica segura con vapor, desengrasante dieléctrico y acondicionamiento satinado de mangueras y plásticos.",
      durationHours: 2.5,
      prices: { chico: 1800, mediano: 1800, suv: 2000, pickup: 2200, moto: 1500 }
    },
    {
      id: "opticas",
      name: "Pulido y restauración de ópticas",
      shortName: "Restauración de Ópticas",
      description: "Lijado al agua en varios pasos, pulido de alta transparencia y sellado de protección contra rayos UV.",
      durationHours: 2,
      prices: { chico: 2000, mediano: 2000, suv: 2000, pickup: 2000, moto: 1200 }
    },
    {
      id: "lavado_exterior",
      name: "Lavado técnico exterior & descontaminado",
      shortName: "Lavado Técnico Exterior",
      description: "Lavado con guante de microfibra en 2 baldes, descontaminado químico y mecánico con clay bar.",
      durationHours: 2.5,
      prices: { chico: 1800, mediano: 2200, suv: 2600, pickup: 3200, moto: 1400 }
    },
    {
      id: "pulido",
      name: "Corrección de pintura (Pulido 2 Pasos)",
      shortName: "Pulido Corrección (2 Pasos)",
      description: "Corte, pulido y abrillantado técnico para devolver el brillo espejo y eliminar micro-rayones y marcas de lavado.",
      durationHours: 8,
      prices: { chico: 5000, mediano: 6200, suv: 7500, pickup: 9000, moto: 3500 }
    },
    {
      id: "ceramico",
      name: "Tratamiento Cerámico (Vidrio Líquido 3 Años)",
      shortName: "Tratamiento Cerámico 3 Años",
      description: "Coating cerámico nanotecnológico con protección de 3 años, repelencia extrema, protección UV y brillo hidrofóbico permanente.",
      durationHours: 10,
      prices: { chico: 10000, mediano: 12500, suv: 15000, pickup: 18000, moto: 6500 }
    },
    {
      id: "llantas",
      name: "Limpieza y sellado de llantas",
      shortName: "Sellado de Llantas",
      description: "Descontaminación férrica profunda y sellado térmico antiadherente de polvo de freno para fácil limpieza.",
      durationHours: 2,
      prices: { chico: 1200, mediano: 1200, suv: 1500, pickup: 1500, moto: 900 }
    }
  ],

  combos: [
    {
      id: "combo-reventa",
      name: "🔥 Combo Preparación para Venta",
      services: ["interior", "lavado_exterior", "motor"],
      discountPercent: 15,
      description: "Ideal para autos que van a entrar al stock de CARVLAK o reventa particular."
    },
    {
      id: "combo-espejo",
      name: "💎 Combo Brillo Espejo & Protección",
      services: ["pulido", "ceramico", "opticas"],
      discountPercent: 10,
      description: "El tratamiento más completo para lucir y proteger la carrocería como un 0km."
    },
    {
      id: "combo-interior-full",
      name: "✨ Combo Restauración Interior Total",
      services: ["interior", "cuero"],
      discountPercent: 12,
      description: "Limpieza profunda de tapizados y alfombras con nutrición intensiva de cuero."
    }
  ],

  initialTurnos: [
    {
      id: "dt-101",
      customerName: "Nicolás Varela",
      phone: "59899456789",
      vehicle: "BMW Serie 3 320i 2021",
      size: "mediano",
      services: ["pulido", "ceramico"],
      totalAmount: 18700,
      discount: 2500,
      status: "AGENDADO",
      operator: "Maximiliano",
      date: "2026-09-25",
      time: "09:00",
      notes: "Auto color negro, quiere que quede con brillo espejo para evento el fin de semana."
    },
    {
      id: "dt-102",
      customerName: "Camila Rodríguez",
      phone: "59898123456",
      vehicle: "Jeep Renegade Trailhawk 2022",
      size: "suv",
      services: ["interior", "lavado_exterior"],
      totalAmount: 7500,
      discount: 0,
      status: "COTIZADO",
      operator: "Romina",
      date: "2026-09-26",
      time: "14:00",
      notes: "Consulta por limpieza de tapizados manchados y lavado exterior completo."
    },
    {
      id: "dt-103",
      customerName: "Martín Méndez",
      phone: "59891234890",
      vehicle: "Toyota Hilux SRV 2023",
      size: "pickup",
      services: ["interior", "motor", "llantas"],
      totalAmount: 9500,
      discount: 1000,
      status: "FINALIZADO",
      operator: "Maximiliano",
      date: "2026-09-22",
      time: "10:30",
      notes: "Retiró impecable, abonó con transferencia bancaria BROU."
    },
    {
      id: "dt-104",
      customerName: "Sebastián Acosta",
      phone: "59894789123",
      vehicle: "Audi A4 S-Line 2019",
      size: "mediano",
      services: ["pulido", "opticas"],
      totalAmount: 8200,
      discount: 0,
      status: "POR_COTIZAR",
      operator: "Romina",
      date: "2026-09-27",
      time: "11:00",
      notes: "Envió fotos por WhatsApp, requiere restauración de faros delanteros con laca UV."
    }
  ]
};
