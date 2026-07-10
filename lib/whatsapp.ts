import type { Cliente, Movimiento } from "./types"
import { obtenerVentasConSaldoPendiente } from "./deuda"
import { formatARS, formatFecha } from "./storage"

export function prepararTelefonoWhatsApp(telefono: string) {
  const digits = telefono.replace(/[^\d]/g, "")
  if (!digits) return ""
  if (digits.startsWith("54")) return digits
  if (digits.startsWith("0")) return `54${digits.slice(1)}`
  return `54${digits}`
}

export function crearMensajeDeuda(cliente: Cliente, movimientos: Movimiento[]) {
  const deuda = cliente.saldo < 0 ? -cliente.saldo : 0
  const ventasPendientes = obtenerVentasConSaldoPendiente(cliente.id, movimientos).slice(0, 12)

  const detalleProductos =
    ventasPendientes.length > 0
      ? ventasPendientes
          .map(({ movimiento: mov, saldoPendiente }) => {
            const productos =
              mov.productos?.length > 0
                ? mov.productos
                    .map((item) => `${item.cantidad} ${item.nombre}`)
                    .join(", ")
                : `${mov.bidonesEntregados} unidad(es)`
            return `- ${formatFecha(mov.fechaVenta ?? mov.fecha)}: ${productos} (pendiente ${formatARS(saldoPendiente)})`
          })
          .join("\n")
      : "- Sin ventas pendientes detalladas."

  return `Hola ${cliente.nombre}, te enviamos el resumen de tu cuenta:

Detalle:
${detalleProductos}

Total adeudado: ${formatARS(deuda)}

Fecha del resumen: ${formatFecha(new Date().toISOString())}

Podés abonar al repartidor o coordinar el pago por este medio.
Gracias.`
}

export function crearMensajeClienteInactivo(cliente: Cliente) {
  return `Hola, ${cliente.nombre}. ¿Cómo estás? Te escribimos de Agüita. Hace varios meses que no registramos entregas y queríamos coordinar la devolución de los envases que puedan haber quedado en tu domicilio. Cuando tengas un momento, escribinos y coordinamos. ¡Muchas gracias!`
}

export function crearUrlWhatsApp(telefono: string, mensaje: string) {
  const numero = prepararTelefonoWhatsApp(telefono)
  if (!numero) return ""
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}
