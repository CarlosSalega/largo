import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-bold">
              LARGO
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Tu tienda de tecnología de confianza. Productos premium de las
              marcas líderes a nivel mundial.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Tienda</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/catalog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Categorías
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Marcas
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Empresa</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Contacto</h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-muted-foreground">
                hello@largo.com
              </li>
              <li className="text-sm text-muted-foreground">
                +54 11 1234-5678
              </li>
              <li className="text-sm text-muted-foreground">
                Lun-Vie 9am-6pm
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Largo. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
