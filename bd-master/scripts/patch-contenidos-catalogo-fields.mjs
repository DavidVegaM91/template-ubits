#!/usr/bin/env node
/**
 * Añade catalogoId + conCertificacion a todos los ítems.
 * UBITS: diversifica idioma/nivelIngles en una muestra para filtros del playground.
 * Regenerar React: cd Ubits-React && npm run sync:bd-master
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BD_DIR = path.resolve(__dirname, '..')

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

function hashCert(id, salt = 0) {
  const n = parseInt(String(id).replace(/\D/g, ''), 10) || 0
  return (n + salt) % 3 === 0
}

const NIVEL_INGLES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function patchUbitsItem(item, index) {
  item.catalogoId = 'catalogo_ubits'
  item.conCertificacion = hashCert(item.id, 1)

  // Muestra para filtros: últimos 8 ítems en Inglés con nivel CEFR; 3 en Portugués
  const num = parseInt(String(item.id).replace(/\D/g, ''), 10) || index
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
  item.conCertificacion =
    item.categoriaFiqshaId === 'cfq-002' || item.categoriaFiqshaId === 'cfq-003' || hashCert(item.id, 2)
  return item
}

const ubitsHeader = readHeader('bd-contenidos-ubits.js')
const ubits = loadBd('bd-contenidos-ubits.js', 'BDS_CONTENIDOS_UBITS')
ubits.version = '2.1'
ubits.contents = ubits.contents.map(patchUbitsItem)
writeBd('bd-contenidos-ubits.js', 'BDS_CONTENIDOS_UBITS', ubits, ubitsHeader)

const fiqHeader = readHeader('bd-contenidos-fiqsha.js')
const fiq = loadBd('bd-contenidos-fiqsha.js', 'BDS_CONTENIDOS_FIQSHA')
fiq.version = '2.2'
fiq.contents = fiq.contents.map(patchFiqshaItem)
if (Array.isArray(fiq.contentsCreatorOnly)) {
  fiq.contentsCreatorOnly = fiq.contentsCreatorOnly.map(patchFiqshaItem)
}
writeBd('bd-contenidos-fiqsha.js', 'BDS_CONTENIDOS_FIQSHA', fiq, fiqHeader)

console.log('OK — UBITS:', ubits.contents.length, 'Fiqsha:', fiq.contents.length)
