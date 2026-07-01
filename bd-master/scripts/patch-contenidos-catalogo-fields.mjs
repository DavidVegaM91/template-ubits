#!/usr/bin/env node
/**
 * Añade catalogoId, conCertificacion y plantillaCertificado* a todos los ítems.
 * ~80 % con certificado; Fiqsha → plantillas Creator; UBITS → plantilla «UBITS».
 * Regenerar React: cd Ubits-React && npm run sync:bd-master
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BD_DIR = path.resolve(__dirname, '..')

const FIQSHA_CERTIFICATE_TEMPLATES = [
  { id: 'tpl-doble-firma', nombre: 'Cursos empresariales con doble firma' },
  { id: 'tpl-estandar', nombre: 'Certificado estándar Fiqsha' },
  { id: 'tpl-onboarding', nombre: 'Onboarding colaboradores' },
]

const UBITS_CERTIFICATE_TEMPLATE = { id: 'tpl-ubits', nombre: 'UBITS' }

const NIVEL_INGLES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function loadBd(filename, exportName) {
  const g = {}
  const code = fs.readFileSync(path.join(BD_DIR, filename), 'utf8').replace(/window\./g, 'g.')
  eval(code)
  return g[exportName]
}

function readHeader(filename) {
  const src = fs.readFileSync(path.join(BD_DIR, filename), 'utf8')
  const idx = src.indexOf('window.')
  return idx >= 0 ? src.slice(0, idx) : ''
}

function writeBd(filename, exportName, data, header) {
  const body = JSON.stringify(data, null, 2)
  fs.writeFileSync(path.join(BD_DIR, filename), `${header}window.${exportName} = ${body};\n`, 'utf8')
}

function numericSeed(id) {
  return parseInt(String(id).replace(/\D/g, ''), 10) || 0
}

/** ~80 % con certificado (4 de cada 5). */
function hasCertificado(id, salt = 0) {
  return (numericSeed(id) + salt) % 5 !== 0
}

function applyCertificadoFields(item, salt, isFiqsha) {
  const cert = hasCertificado(item.id, salt)
  item.conCertificacion = cert
  if (cert) {
    if (isFiqsha) {
      const tpl = FIQSHA_CERTIFICATE_TEMPLATES[numericSeed(item.id) % FIQSHA_CERTIFICATE_TEMPLATES.length]
      item.plantillaCertificadoId = tpl.id
      item.plantillaCertificado = tpl.nombre
    } else {
      item.plantillaCertificadoId = UBITS_CERTIFICATE_TEMPLATE.id
      item.plantillaCertificado = UBITS_CERTIFICATE_TEMPLATE.nombre
    }
  } else {
    item.plantillaCertificadoId = null
    item.plantillaCertificado = null
  }
}

function patchUbitsItem(item, index) {
  item.catalogoId = 'catalogo_ubits'
  applyCertificadoFields(item, 1, false)

  const num = numericSeed(item.id) || index
  if (num >= 78) {
    item.idioma = 'Inglés'
    item.nivelIngles = NIVEL_INGLES[(num - 78) % NIVEL_INGLES.length]
  } else if (num >= 75 && num <= 77) {
    item.idioma = 'Portugués'
    item.nivelIngles = null
  } else if (item.nivelIngles == null && item.idioma !== 'Inglés') {
    item.nivelIngles = null
  }

  return item
}

function patchFiqshaItem(item, index) {
  item.catalogoId = 'catalogo_fiqsha'
  applyCertificadoFields(item, 2, true)
  return item
}

const ubitsHeader = readHeader('bd-contenidos-ubits.js')
const ubits = loadBd('bd-contenidos-ubits.js', 'BDS_CONTENIDOS_UBITS')
ubits.version = '2.2'
ubits.contents = ubits.contents.map(patchUbitsItem)
writeBd('bd-contenidos-ubits.js', 'BDS_CONTENIDOS_UBITS', ubits, ubitsHeader)

const fiqHeader = readHeader('bd-contenidos-fiqsha.js')
const fiq = loadBd('bd-contenidos-fiqsha.js', 'BDS_CONTENIDOS_FIQSHA')
fiq.version = '2.3'
fiq.contents = fiq.contents.map(patchFiqshaItem)
if (Array.isArray(fiq.contentsCreatorOnly)) {
  fiq.contentsCreatorOnly = fiq.contentsCreatorOnly.map(patchFiqshaItem)
}
writeBd('bd-contenidos-fiqsha.js', 'BDS_CONTENIDOS_FIQSHA', fiq, fiqHeader)

const uCert = ubits.contents.filter((c) => c.conCertificacion).length
const fCert = fiq.contents.filter((c) => c.conCertificacion).length
console.log(
  'OK — UBITS:',
  ubits.contents.length,
  `(${uCert} con certificado, ${ubits.contents.length - uCert} sin)`,
  'Fiqsha:',
  fiq.contents.length,
  `(${fCert} con certificado, ${fiq.contents.length - fCert} sin)`
)
