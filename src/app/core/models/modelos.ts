/** Producto del inventario (tabla relacional `productos`, expuesta por la API REST). */
export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
}

/** Usuario del sistema tal y como lo ve la API (nunca incluye el hash de la contraseña). */
export interface UsuarioPublico {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'user';
}

/** Documento de la colección `movimientos` (almacén NoSQL en tiempo real). */
export interface Movimiento {
  id: string;
  productoId: number;
  producto: string;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  fecha: string;
  usuario: string;
}

/** Datos consolidados que devuelve `/api/informes/resumen`. */
export interface ResumenInventario {
  totalProductos: number;
  unidadesEnStock: number;
  valorInventario: number;
  productosSinStock: number;
}
