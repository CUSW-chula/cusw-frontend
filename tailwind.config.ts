import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: '#FFFCF2',
  			foreground: 'var(--foreground)',
  			white: '#FFFFFF',
  			black: '#000000',
  			cream: '#FFFCF2',
  			brown: '#6B5C56',
  			purple: '#7E5BEA',
  			blue: '#489CFF',
  			yellow: '#F4BE38',
  			orange: '#F79939',
  			greenLight: '#94D0BC',
  			green: '#69BCA0',
  			red: '#EF4444'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			BaiJamjuree: [
  				'var(--font-bai_jamjuree)'
  			],
  			Anuphan: [
  				'var(--font-anuphan)'
  			]
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
