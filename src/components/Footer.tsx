import chatIcon from '../assets/images/chat.png';

// Componente simple para el botón de chat flotante
const ChatButton = () => {
    return (
        // Posicionamiento fijo en la esquina inferior derecha
        <div 
            className="fixed bottom-8 right-8 z-50 cursor-pointer" 
            // Esto replica el estilo circular y el color de fondo de la captura
        >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-neutral-100 rounded-full shadow-lg flex items-center justify-center border border-neutral-200 hover:bg-neutral-200 transition-colors">
                {/* SVG simplificado para el ícono de dos burbujas de chat */}
                <img src={chatIcon} alt="Chat" className="w-7 h-7" />
            </div>
        </div>
    );
};

export default function Footer() {
  return (
    <>
      <footer className="bg-white py-16 px-6 md:px-12 border-t border-neutral-200">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Columna 1: Logo y redes sociales */}
            <div className="md:col-span-1">
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" stroke="black" strokeWidth="2"/>
                    <circle cx="16" cy="16" r="3.5" fill="black"/>
                    <line x1="16" y1="2" x2="16" y2="7" stroke="black" strokeWidth="1.5"/>
                    <line x1="16" y1="25" x2="16" y2="30" stroke="black" strokeWidth="1.5"/>
                    <line x1="2" y1="16" x2="7" y2="16" stroke="black" strokeWidth="1.5"/>
                    <line x1="25" y1="16" x2="30" y2="16" stroke="black" strokeWidth="1.5"/>
                  </svg>
                  <span className="text-2xl font-semibold text-black">Villanet</span>
                </div>
                <p className="text-sm text-neutral-600">Find your happy place ®</p>
              </div>
              
              {/* Social media icons */}
              <div className="flex items-center gap-5">
                <a href="#" className="text-black hover:text-neutral-600 transition" aria-label="X">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" className="text-black hover:text-neutral-600 transition" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-black hover:text-neutral-600 transition" aria-label="TikTok">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
                <a href="#" className="text-black hover:text-neutral-600 transition" aria-label="YouTube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="#" className="text-black hover:text-neutral-600 transition" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Columna vacía (espaciador) */}
            <div className="hidden md:block md:col-span-1"></div>
            
            {/* Columna 3: FOR GUESTS */}
            <div className="md:col-span-1">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-5">FOR GUESTS</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">Blog</a></li>
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">Events</a></li>
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">Privacy</a></li>
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">Terms</a></li>
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">Contact</a></li>
              </ul>
            </div>
            
            {/* Columna 4: FOR PARTNERS */}
            <div className="md:col-span-1">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-5">FOR PARTNERS</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">Villanet Operated</a></li>
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">List on Villanet</a></li>
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">Ambassadors</a></li>
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">Travel Agents</a></li>
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">Villanet Store</a></li>
              </ul>
            </div>
            
            {/* Columna 5: FOR EVERYONE */}
            <div className="md:col-span-1">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-5">FOR EVERYONE</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">About Villanet</a></li>
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">Customer reviews</a></li>
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">Join the team</a></li>
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">Licensing</a></li>
                <li><a href="#" className="text-black font-medium hover:text-neutral-600 transition text-sm">See more</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      {/* Añadimos el componente del botón flotante fuera del footer */}
      <ChatButton />
    </>
  );
}