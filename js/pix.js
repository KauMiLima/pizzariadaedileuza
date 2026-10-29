/**
 * Gera o código Pix "copia e cola" (BR Code) no padrão EMV do Banco Central.
 * O código é estático e sem valor: o cliente digita o total no app do banco,
 * já que o pedido pode incluir bebidas ou outros itens.
 *
 * Referência: Manual de Padrões para Iniciação do Pix (BCB), seção BR Code.
 */
const Pix = (() => {
  /** Cada campo é: ID (2 dígitos) + tamanho do valor (2 dígitos) + valor. */
  const campo = (id, valor) => id + String(valor.length).padStart(2, '0') + valor;

  /** Bancos não aceitam acentos no nome nem na cidade. */
  const normalizar = (texto) =>
    texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();

  /** Dígito verificador exigido no fim do código: CRC16-CCITT (polinômio 0x1021). */
  function crc16(texto) {
    let crc = 0xffff;
    for (let i = 0; i < texto.length; i++) {
      crc ^= texto.charCodeAt(i) << 8;
      for (let bit = 0; bit < 8; bit++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  /**
   * @param {{ chave: string, nome: string, cidade: string }} dados
   * @returns {string} código Pix "copia e cola"
   */
  function gerarCodigo({ chave, nome, cidade }) {
    const contaPix = campo('00', 'br.gov.bcb.pix') + campo('01', chave.trim());

    const semCrc =
      campo('00', '01') +                              // versão do payload
      campo('26', contaPix) +                          // chave Pix
      campo('52', '0000') +                            // categoria do comerciante
      campo('53', '986') +                             // moeda: real (BRL)
      campo('58', 'BR') +                              // país
      campo('59', normalizar(nome).slice(0, 25)) +     // nome de quem recebe
      campo('60', normalizar(cidade).slice(0, 15)) +   // cidade de quem recebe
      campo('62', campo('05', '***')) +                // identificador da transação
      '6304';                                          // campo do CRC (o valor vem a seguir)

    return semCrc + crc16(semCrc);
  }

  /** A chave é válida se não for o texto de exemplo entre colchetes. */
  const estaConfigurado = (dados) => Boolean(dados.chave) && !dados.chave.startsWith('[');

  return { gerarCodigo, estaConfigurado, crc16 };
})();
