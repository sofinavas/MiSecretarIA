# MiSecretarIA - Landing Page

Landing page moderna y responsive para MiSecretarIA, una agencia de automatización con un toque humano.

## 🚀 Tecnologías

- **Astro** - Framework web moderno
- **TailwindCSS** - Estilos utilitarios
- **TypeScript** - Tipado estático
- **Google Fonts** - Bricolage Grotesque y Rubik

## 🎨 Colores de marca

- Azul: `#476eae`
- Celeste: `#48b3af`
- Verde: `#a7e399`
- Amarillo: `#f6ff99`
- Fondo claro: `#f8f7f4`
- Gris claro: `#e5e7eb`
- Negro: `#2e2d2d`

## 📦 Instalación

```bash
npm install
```

## 🧞 Comandos

| Comando           | Acción                                               |
| :---------------- | :--------------------------------------------------- |
| `npm install`     | Instala las dependencias                             |
| `npm run dev`     | Inicia el servidor de desarrollo en `localhost:4321` |
| `npm run build`   | Construye el sitio para producción en `./dist/`      |
| `npm run preview` | Vista previa del build local antes de desplegar      |

## 📂 Estructura del proyecto

```
/
├── public/
│   └── assets/          # Recursos estáticos (imágenes, etc.)
├── src/
│   ├── components/      # Componentes de Astro
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── Services.astro
│   │   ├── HowItWorks.astro
│   │   ├── Benefits.astro
│   │   ├── ContactForm.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── MainLayout.astro
│   └── pages/
│       └── index.astro  # Página principal
├── astro.config.mjs     # Configuración de Astro
├── tailwind.config.mjs  # Configuración de Tailwind
└── package.json
```

## 🎯 Características

- ✅ Diseño 100% responsive (mobile-first)
- ✅ Animaciones suaves y modernas
- ✅ Optimizado para SEO
- ✅ Tipografías personalizadas
- ✅ Paleta de colores de marca
- ✅ Componentes modulares y reutilizables

## 📄 Secciones

1. **Hero** - Título principal con CTA
2. **Servicios** - 4 servicios principales con íconos
3. **Cómo trabajamos** - Proceso de 3 pasos
4. **Beneficios** - Cuadrícula con métricas
5. **Contacto** - Formulario y datos de contacto
6. **Footer** - Enlaces y redes sociales

## 🚀 Despliegue

El sitio está listo para ser desplegado en:

- Vercel
- Netlify
- GitHub Pages
- Cualquier hosting estático

```bash
npm run build
```

El contenido generado estará en `./dist/` listo para ser desplegado.
