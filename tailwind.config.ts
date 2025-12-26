import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			void: '#000000',
  			shadow: '#0a0a0a',
  			deep: '#1a1a1a',
  			abyss: '#050505',
  			ember: '#8b4513',
  			'ember-glow': '#cd853f',
  			earth: '#3d2817',
  			'earth-glow': '#6b4423',
  			'shadow-purple': '#2d1b2e',
  			'shadow-purple-glow': '#4a2d4a',
  			bone: '#8b7d6b',
  			'bone-glow': '#c4b5a0',
  			'text-primary': '#e8e6e3',
  			'text-secondary': '#b8b5b0',
  			'text-muted': '#7a7875',
  			'text-glow': '#d4a574',
  			border: 'hsl(var(--border))',
  			'border-glow': '#4a4a4a',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		boxShadow: {
  			'ember-glow': '0 0 20px rgba(139, 69, 19, 0.4)',
  			'earth-glow': '0 0 20px rgba(61, 40, 23, 0.4)',
  			'purple-glow': '0 0 20px rgba(74, 45, 74, 0.4)',
  			'neobrutal': '8px 8px 0px 0px rgba(0, 0, 0, 0.8)',
  			'neobrutal-sm': '4px 4px 0px 0px rgba(0, 0, 0, 0.8)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;
