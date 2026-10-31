import { describe, expect, it } from 'vitest';
import { construirCsv } from './exportar.util';
import { hashContrasena } from './hash.util';
import {
  emitirAcceso, existeEmail, iniciarSesionServidor, listarProductos, refrescarServidor, registrarUsuario,
} from './servidor-falso';
import { PERMISOS_POR_ROL, decodificar, haCaducado } from './token.util';

describe('token.util', () => {
  const usuario = { id: 1, nombre: 'Ana', email: 'a@b.test', rol: 'admin' as const };

  it('el token emitido se decodifica con rol y permisos', () => {
    const claims = decodificar(emitirAcceso(usuario));
    expect(claims?.roles).toEqual(['admin']);
    expect(claims?.permisos).toEqual(PERMISOS_POR_ROL.admin);
  });

  it('un token con exp en el pasado está caducado y uno basura también', () => {
    expect(haCaducado(emitirAcceso(usuario, -10))).toBe(true);
    expect(haCaducado('basura')).toBe(true);
    expect(haCaducado(emitirAcceso(usuario, 60))).toBe(false);
  });

  it('el usuario estándar no recibe permisos de administración', () => {
    expect(PERMISOS_POR_ROL.user).not.toContain('informes:ver');
    expect(PERMISOS_POR_ROL.user).not.toContain('usuarios:gestionar');
  });
});

describe('hash y servidor simulado', () => {
  it('el hash es determinista y depende de la sal', async () => {
    expect(await hashContrasena('s1', 'x')).toBe(await hashContrasena('s1', 'x'));
    expect(await hashContrasena('s1', 'x')).not.toBe(await hashContrasena('s2', 'x'));
  });

  it('rechaza credenciales incorrectas y usuarios inexistentes', async () => {
    expect(await iniciarSesionServidor('admin@gestion.test', 'mal')).toBeNull();
    expect(await iniciarSesionServidor('nadie@gestion.test', 'mal')).toBeNull();
  });

  it('el alta pública crea siempre rol estándar, guarda el hash y el refresh funciona', async () => {
    const nuevo = await registrarUsuario('Prueba Test', 'Prueba@Gestion.test', 'Clave-1234');
    expect(nuevo.rol).toBe('user');
    expect(existeEmail('prueba@gestion.test')).toBe(true);
    const sesion = await iniciarSesionServidor('prueba@gestion.test', 'Clave-1234');
    expect(sesion).not.toBeNull();
    expect(decodificar(refrescarServidor(sesion!.refreshToken))?.roles).toEqual(['user']);
    expect(refrescarServidor('refresh-falso')).toBeNull();
  });

  it('devuelve copias de los productos (no deja mutar la tabla)', () => {
    const lista = listarProductos();
    lista[0].stock = -999;
    expect(listarProductos()[0].stock).not.toBe(-999);
  });
});

describe('construirCsv', () => {
  type Fila = { n: string; v: number };
  const cols = [
    { titulo: 'Nombre', valor: (f: Fila) => f.n },
    { titulo: 'Valor', valor: (f: Fila) => f.v },
  ];

  it('usa punto y coma, BOM y comillas cuando hace falta', () => {
    const csv = construirCsv(cols, [{ n: 'Cable "HDMI"; 2 m', v: 7.9 }]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('Nombre;Valor');
    expect(csv).toContain('"Cable ""HDMI""; 2 m";7.9');
  });

  it('neutraliza formulas que empiezan por igual', () => {
    expect(construirCsv(cols, [{ n: '=SUMA(A1)', v: 1 }])).toContain("'=SUMA(A1)");
  });
});
