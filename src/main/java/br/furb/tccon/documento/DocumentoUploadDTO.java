package br.furb.tccon.documento;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentoUploadDTO {
    private String titulo;
    private String nomeArquivo;
    private String arquivoBase64;
}
